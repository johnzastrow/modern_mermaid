// modern_mermaid theme-persistence backend.
//
// A deliberately tiny, dependency-free service that stores the shared custom-theme
// library as a single JSON document on a Docker volume, so themes survive sessions
// and are shared across machines. It sits behind the frontend nginx (which proxies
// same-origin /api/* here) and is never exposed directly.
//
// Trust model (v1.2.0): reads are public; writes are refused unless the deployment
// opts in. Two write modes, chosen by environment:
//   THEMES_WRITE_TOKEN=<secret>     writes need "Authorization: Bearer <secret>".
//                                   Use this for any internet-facing instance.
//   THEMES_ALLOW_ANON_WRITE=true    anyone who can reach the API may write. Only for
//                                   a LAN/tailnet instance behind an IP allowlist.
// With neither set the store is read-only (fail closed).

import http from 'node:http';
import { createHash, randomUUID, timingSafeEqual } from 'node:crypto';
import { readFile, writeFile, mkdir, rename, unlink, copyFile } from 'node:fs/promises';
import { dirname } from 'node:path';
import { pathToFileURL } from 'node:url';

export const MAX_BODY = 4_000_000; // ~4 MB ceiling on the whole library
export const MAX_THEMES = 500;
export const MAX_NAME = 200;
export const MIN_TOKEN = 32;
// A random token (openssl rand -hex 32) uses all 16 hex digits; "aaaa..." does not.
export const MIN_DISTINCT = 10;

const sha256 = (s) => createHash('sha256').update(s, 'utf8').digest();

/**
 * Validate the write configuration. Throws on a token too short to be safe, so a
 * typo'd deployment fails at start instead of running with a guessable secret.
 */
export function resolveWriteMode(env) {
  const token = env.THEMES_WRITE_TOKEN || '';
  const anon = env.THEMES_ALLOW_ANON_WRITE === 'true';
  if (token && token.length < MIN_TOKEN) {
    throw new Error(`THEMES_WRITE_TOKEN must be at least ${MIN_TOKEN} characters`);
  }
  if (token && new Set(token).size < MIN_DISTINCT) {
    throw new Error('THEMES_WRITE_TOKEN looks non-random; generate one with: openssl rand -hex 32');
  }
  if (token && anon) {
    throw new Error('Set either THEMES_WRITE_TOKEN or THEMES_ALLOW_ANON_WRITE, not both');
  }
  return { tokenDigest: token ? sha256(token) : null, anon };
}

/** Check the request's bearer token. Digests have a fixed length, so the compare is constant-time. */
function hasValidToken(req, tokenDigest) {
  if (!tokenDigest) return false;
  const m = /^Bearer (\S+)$/.exec(req.headers.authorization || '');
  if (!m) return false;
  return timingSafeEqual(sha256(m[1]), tokenDigest);
}

/** Shape check: a JSON object of at most MAX_THEMES themes, each itself an object. */
export function validateLibrary(parsed) {
  if (parsed === null || typeof parsed !== 'object' || Array.isArray(parsed)) {
    return 'expected a json object of themes';
  }
  const entries = Object.entries(parsed);
  if (entries.length > MAX_THEMES) return `at most ${MAX_THEMES} themes`;
  for (const [name, theme] of entries) {
    if (name.length === 0 || name.length > MAX_NAME) return 'invalid theme name';
    if (theme === null || typeof theme !== 'object' || Array.isArray(theme)) {
      return 'each theme must be an object';
    }
  }
  return null;
}

/** Strong validator for the stored document; quotes are part of the ETag syntax. */
const etagOf = (text) => `"${createHash('sha256').update(text, 'utf8').digest('base64url')}"`;

/**
 * Compare a client's validator with ours. nginx turns the ETag weak ("W/") when
 * it gzips the response; the value is still a hash of the uncompressed
 * document, so the prefix is ignored rather than refusing every gzipped client.
 */
const sameTag = (header, etag) => typeof header === 'string' && header.replace(/^W\//, '') === etag;

function send(res, status, body, extra = {}) {
  res.writeHead(status, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store', ...extra });
  res.end(body);
}

export function createThemesServer({ file, env = process.env }) {
  const { tokenDigest, anon } = resolveWriteMode(env);
  const canWrite = (req) => anon || hasValidToken(req, tokenDigest);

  // The document is cached in memory, so public reads never touch the disk;
  // the cache is replaced on every successful write.
  let cache = null; // { text, etag }
  async function readStore() {
    if (!cache) {
      let text;
      try {
        text = await readFile(file, 'utf8');
      } catch {
        text = '{}'; // no store yet -> empty library
      }
      cache = { text, etag: etagOf(text) };
    }
    return cache;
  }

  // Writes are serialized through one promise chain, and each uses its own temp
  // file, so concurrent PUTs cannot interleave and corrupt the store. The
  // If-Match check runs inside the same queued step as the write, so no other
  // write can land between them. Resolves to 'ok' or 'conflict'.
  let writeChain = Promise.resolve();
  function writeStore(text, ifMatch) {
    const run = async () => {
      // Optimistic concurrency: a client that sends If-Match must have seen the
      // current version, so a stale browser cannot overwrite newer data.
      if (ifMatch && ifMatch !== '*' && !sameTag(ifMatch, (await readStore()).etag)) return 'conflict';
      await mkdir(dirname(file), { recursive: true });
      const tmp = `${file}.${randomUUID()}.tmp`;
      try {
        await writeFile(tmp, text, 'utf8');
        // Keep the previous version as one step of undo against a bad write.
        await copyFile(file, `${file}.bak`).catch(() => {});
        await rename(tmp, file); // atomic replace: a crash can't truncate the store
        cache = { text, etag: etagOf(text) };
        return 'ok';
      } catch (err) {
        await unlink(tmp).catch(() => {});
        throw err;
      }
    };
    const p = writeChain.then(run, run);
    writeChain = p.catch(() => {});
    return p;
  }

  const server = http.createServer((req, res) => {
    const url = (req.url || '').split('?')[0];

    if (url === '/healthz') return send(res, 200, '{"ok":true}');

    // Tells the client whether its saves will be accepted, so a read-only
    // instance never triggers failed writes or a browser auth prompt.
    if (url === '/api/themes/status' && req.method === 'GET') {
      return send(res, 200, JSON.stringify({ writable: canWrite(req) }));
    }

    if (url !== '/api/themes') return send(res, 404, '{"error":"not found"}');

    // HEAD is answered like GET; Node omits the body for HEAD responses.
    if (req.method === 'GET' || req.method === 'HEAD') {
      readStore().then(
        ({ text, etag }) => {
          if (sameTag(req.headers['if-none-match'], etag)) return send(res, 304, '', { ETag: etag });
          send(res, 200, text, { ETag: etag });
        },
        () => send(res, 500, '{"error":"read failed"}'),
      );
      return;
    }

    if (req.method === 'PUT') {
      // Authorize before reading the body, so unauthenticated clients cannot
      // make the server buffer anything. No WWW-Authenticate header: browsers
      // must not pop a password dialog for public users.
      if (!canWrite(req)) {
        req.resume();
        return send(res, 401, '{"error":"writes are not allowed"}');
      }
      if (!/^application\/json\b/i.test(req.headers['content-type'] || '')) {
        req.resume();
        return send(res, 415, '{"error":"expected application/json"}');
      }
      if (Number(req.headers['content-length']) > MAX_BODY) {
        req.resume();
        return send(res, 413, '{"error":"payload too large"}', { Connection: 'close' });
      }

      const chunks = [];
      let size = 0;
      let aborted = false;
      req.on('data', (chunk) => {
        if (aborted) return;
        size += chunk.length;
        if (size > MAX_BODY) {
          aborted = true;
          send(res, 413, '{"error":"payload too large"}', { Connection: 'close' });
          req.destroy();
          return;
        }
        chunks.push(chunk);
      });
      req.on('end', () => {
        if (aborted) return;
        let parsed;
        try {
          parsed = JSON.parse(Buffer.concat(chunks).toString('utf8'));
        } catch {
          return send(res, 400, '{"error":"invalid json"}');
        }
        const problem = validateLibrary(parsed);
        if (problem) return send(res, 400, JSON.stringify({ error: problem }));
        // Re-serialize the validated object (never write raw untrusted bytes back).
        writeStore(JSON.stringify(parsed), req.headers['if-match']).then(
          (result) =>
            result === 'conflict'
              ? send(res, 412, '{"error":"library changed; reload and try again"}', { ETag: cache.etag })
              : send(res, 204, '', { ETag: cache.etag }),
          () => send(res, 500, '{"error":"write failed"}'),
        );
      });
      return;
    }

    send(res, 405, '{"error":"method not allowed"}', { Allow: 'GET, HEAD, PUT' });
  });

  // Bound slow clients: a whole request must arrive within 15 s.
  server.headersTimeout = 10_000;
  server.requestTimeout = 15_000;
  server.keepAliveTimeout = 5_000;
  return server;
}

// Run directly (container entrypoint); importing the module for tests does not listen.
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const file = process.env.THEMES_FILE || '/data/themes.json';
  const port = Number(process.env.PORT || 8090);
  const host = process.env.HOST || '0.0.0.0';
  let server;
  let mode;
  try {
    server = createThemesServer({ file });
    const { anon, tokenDigest } = resolveWriteMode(process.env);
    mode = tokenDigest ? 'token' : anon ? 'anonymous (LAN only)' : 'read-only';
  } catch (err) {
    console.error(`themes-server: ${err.message}`);
    process.exit(1);
  }
  server.listen(port, host, () => {
    console.log(`themes-server listening on ${host}:${port}, store=${file}, writes=${mode}`);
  });
}

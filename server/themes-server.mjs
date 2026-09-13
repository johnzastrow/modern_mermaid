// modern_mermaid theme-persistence backend.
//
// A deliberately tiny, dependency-free service that stores the shared custom-theme
// library as a single JSON document on a Docker volume, so themes survive sessions
// and are shared across every machine on the LAN. It sits behind the frontend nginx
// (which proxies same-origin /api/* here) and is never exposed directly.
//
// Trust model: this is a single-user / trusted-LAN tool with no authentication --
// the reverse proxy in front (Caddy -> nginx) is the only network boundary. It is
// intentionally not hardened for a hostile multi-tenant network. Inputs are still
// validated defensively: body size is capped, and only a JSON object is accepted.

import http from 'node:http';
import { readFile, writeFile, mkdir, rename } from 'node:fs/promises';
import { dirname } from 'node:path';

const FILE = process.env.THEMES_FILE || '/data/themes.json';
const PORT = Number(process.env.PORT || 8090);
const HOST = process.env.HOST || '0.0.0.0';
const MAX_BODY = 4_000_000; // ~4 MB ceiling on the whole library

async function readStore() {
  try {
    return await readFile(FILE, 'utf8');
  } catch {
    return '{}'; // no store yet -> empty library
  }
}

async function writeStore(text) {
  await mkdir(dirname(FILE), { recursive: true });
  // Write to a temp file then rename, so a crash mid-write can't truncate the store.
  const tmp = `${FILE}.tmp`;
  await writeFile(tmp, text, 'utf8');
  await rename(tmp, FILE);
}

function send(res, status, body, type = 'application/json') {
  res.writeHead(status, { 'Content-Type': type, 'Cache-Control': 'no-store' });
  res.end(body);
}

const server = http.createServer((req, res) => {
  const url = (req.url || '').split('?')[0];

  if (url === '/healthz') {
    return send(res, 200, '{"ok":true}');
  }

  if (url !== '/api/themes') {
    return send(res, 404, '{"error":"not found"}');
  }

  if (req.method === 'GET') {
    readStore().then(
      (text) => send(res, 200, text),
      () => send(res, 500, '{"error":"read failed"}'),
    );
    return;
  }

  if (req.method === 'PUT') {
    let body = '';
    let aborted = false;
    req.on('data', (chunk) => {
      body += chunk;
      if (body.length > MAX_BODY) {
        aborted = true;
        send(res, 413, '{"error":"payload too large"}');
        req.destroy();
      }
    });
    req.on('end', () => {
      if (aborted) return;
      let parsed;
      try {
        parsed = JSON.parse(body);
      } catch {
        return send(res, 400, '{"error":"invalid json"}');
      }
      if (parsed === null || typeof parsed !== 'object' || Array.isArray(parsed)) {
        return send(res, 400, '{"error":"expected a json object of themes"}');
      }
      // Re-serialize the validated object (never write raw untrusted bytes back).
      writeStore(JSON.stringify(parsed)).then(
        () => send(res, 204, ''),
        () => send(res, 500, '{"error":"write failed"}'),
      );
    });
    return;
  }

  res.writeHead(405, { Allow: 'GET, PUT', 'Content-Type': 'application/json' });
  res.end('{"error":"method not allowed"}');
});

server.listen(PORT, HOST, () => {
  console.log(`themes-server listening on ${HOST}:${PORT}, store=${FILE}`);
});

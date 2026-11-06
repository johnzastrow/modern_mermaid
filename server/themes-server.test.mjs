// @vitest-environment node
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtemp, readFile, readdir, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createThemesServer, resolveWriteMode, validateLibrary, MAX_BODY, MAX_THEMES } from './themes-server.mjs';

// A token with enough distinct characters to pass the entropy check.
const TOKEN = '0123456789abcdef'.repeat(3);
let dir;
let server;
let base;

async function start(env) {
  server = createThemesServer({ file: join(dir, 'themes.json'), env });
  await new Promise((r) => server.listen(0, '127.0.0.1', r));
  base = `http://127.0.0.1:${server.address().port}`;
}

const put = (body, headers = {}) =>
  fetch(`${base}/api/themes`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...headers },
    body: typeof body === 'string' ? body : JSON.stringify(body),
  });
const auth = { Authorization: `Bearer ${TOKEN}` };
const lib = { Corporate: { name: 'Corporate', mermaidConfig: { theme: 'base' } } };

beforeEach(async () => {
  dir = await mkdtemp(join(tmpdir(), 'themes-test-'));
});
afterEach(async () => {
  await new Promise((r) => (server ? server.close(r) : r()));
  server = undefined;
  await rm(dir, { recursive: true, force: true });
});

describe('resolveWriteMode', () => {
  it('is read-only when nothing is configured', () => {
    expect(resolveWriteMode({})).toEqual({ tokenDigest: null, anon: false });
  });
  it('rejects a short token', () => {
    expect(() => resolveWriteMode({ THEMES_WRITE_TOKEN: 'short' })).toThrow(/at least/);
  });
  it('rejects token and anonymous mode together', () => {
    expect(() => resolveWriteMode({ THEMES_WRITE_TOKEN: TOKEN, THEMES_ALLOW_ANON_WRITE: 'true' })).toThrow(/either/);
  });
  it('rejects a long but non-random token', () => {
    expect(() => resolveWriteMode({ THEMES_WRITE_TOKEN: 'a'.repeat(64) })).toThrow(/non-random/);
  });
  it('only treats the exact string "true" as anonymous mode', () => {
    expect(resolveWriteMode({ THEMES_ALLOW_ANON_WRITE: '1' }).anon).toBe(false);
  });
});

describe('validateLibrary', () => {
  it('accepts an object of objects', () => expect(validateLibrary(lib)).toBeNull());
  it('rejects arrays, null and scalars', () => {
    for (const v of [[], null, 'x', 3]) expect(validateLibrary(v)).not.toBeNull();
  });
  it('rejects non-object theme entries', () => expect(validateLibrary({ a: 'x' })).not.toBeNull());
  it('rejects empty and overlong names', () => {
    expect(validateLibrary({ '': {} })).not.toBeNull();
    expect(validateLibrary({ ['n'.repeat(201)]: {} })).not.toBeNull();
  });
  it('caps the number of themes', () => {
    const many = Object.fromEntries(Array.from({ length: MAX_THEMES + 1 }, (_, i) => [`t${i}`, {}]));
    expect(validateLibrary(many)).toMatch(/at most/);
  });
});

describe('read-only mode (default)', () => {
  beforeEach(() => start({}));

  it('serves an empty library before anything is stored', async () => {
    const res = await fetch(`${base}/api/themes`);
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({});
  });
  it('reports not writable', async () => {
    expect(await (await fetch(`${base}/api/themes/status`)).json()).toEqual({ writable: false });
  });
  it('refuses writes without a browser auth challenge', async () => {
    const res = await put(lib);
    expect(res.status).toBe(401);
    expect(res.headers.get('www-authenticate')).toBeNull();
  });
  it('refuses writes even with a bearer token', async () => {
    expect((await put(lib, auth)).status).toBe(401);
  });
  it('answers health checks and 404s unknown paths', async () => {
    expect((await fetch(`${base}/healthz`)).status).toBe(200);
    expect((await fetch(`${base}/api/other`)).status).toBe(404);
  });
  it('rejects other methods', async () => {
    expect((await fetch(`${base}/api/themes`, { method: 'DELETE' })).status).toBe(405);
  });
});

describe('token mode', () => {
  beforeEach(() => start({ THEMES_WRITE_TOKEN: TOKEN }));

  it('reports writable only with the right token', async () => {
    const status = (h) => fetch(`${base}/api/themes/status`, { headers: h }).then((r) => r.json());
    expect(await status({})).toEqual({ writable: false });
    expect(await status({ Authorization: `Bearer ${'fedcba9876543210'.repeat(3)}` })).toEqual({ writable: false });
    expect(await status(auth)).toEqual({ writable: true });
  });
  it('rejects a missing or wrong token', async () => {
    expect((await put(lib)).status).toBe(401);
    expect((await put(lib, { Authorization: `Bearer ${TOKEN}x` })).status).toBe(401);
    expect((await put(lib, { Authorization: TOKEN })).status).toBe(401);
  });
  it('stores and serves a library written with the token', async () => {
    expect((await put(lib, auth)).status).toBe(204);
    expect(await (await fetch(`${base}/api/themes`)).json()).toEqual(lib);
  });
  it('requires a JSON content type', async () => {
    expect((await put(JSON.stringify(lib), { ...auth, 'Content-Type': 'text/plain' })).status).toBe(415);
  });
  it('rejects invalid JSON and invalid shapes', async () => {
    expect((await put('{nope', auth)).status).toBe(400);
    expect((await put([1, 2], auth)).status).toBe(400);
    expect((await put({ a: 'x' }, auth)).status).toBe(400);
  });
  it('rejects an oversized body', async () => {
    const res = await put({ big: { css: 'x'.repeat(MAX_BODY) } }, auth);
    expect(res.status).toBe(413);
  });
  it('keeps the store intact under concurrent writes and leaves no temp files', async () => {
    const libs = Array.from({ length: 20 }, (_, i) => ({ [`t${i}`]: { n: i } }));
    const results = await Promise.all(libs.map((l) => put(l, auth)));
    expect(results.every((r) => r.status === 204)).toBe(true);
    const stored = JSON.parse(await readFile(join(dir, 'themes.json'), 'utf8'));
    expect(libs).toContainEqual(stored);
    expect((await readdir(dir)).filter((f) => f.endsWith('.tmp'))).toEqual([]);
  });
});

describe('versioning', () => {
  beforeEach(() => start({ THEMES_WRITE_TOKEN: TOKEN }));
  const etag = async () => (await fetch(`${base}/api/themes`)).headers.get('etag');

  it('returns an ETag and answers 304 when it matches', async () => {
    const tag = await etag();
    expect(tag).toMatch(/^"[\w-]+"$/);
    const res = await fetch(`${base}/api/themes`, { headers: { 'If-None-Match': tag } });
    expect(res.status).toBe(304);
  });
  it('answers HEAD with the same ETag and no body', async () => {
    const res = await fetch(`${base}/api/themes`, { method: 'HEAD' });
    expect(res.status).toBe(200);
    expect(res.headers.get('etag')).toBe(await etag());
    expect(await res.text()).toBe('');
  });
  it('accepts a write against the current version and returns the new ETag', async () => {
    const before = await etag();
    const res = await put(lib, { ...auth, 'If-Match': before });
    expect(res.status).toBe(204);
    expect(res.headers.get('etag')).not.toBe(before);
    expect(res.headers.get('etag')).toBe(await etag());
  });
  it('refuses a write from a client that has not seen the latest version', async () => {
    const stale = await etag();
    expect((await put(lib, { ...auth, 'If-Match': stale })).status).toBe(204);
    const res = await put({ Other: {} }, { ...auth, 'If-Match': stale });
    expect(res.status).toBe(412);
    expect(await (await fetch(`${base}/api/themes`)).json()).toEqual(lib);
  });
  it('accepts the weak form of its ETag (nginx gzip adds W/)', async () => {
    const weak = `W/${await etag()}`;
    expect((await fetch(`${base}/api/themes`, { headers: { 'If-None-Match': weak } })).status).toBe(304);
    expect((await put(lib, { ...auth, 'If-Match': weak })).status).toBe(204);
  });
  it('lets only one of two racing writes from the same version win', async () => {
    const tag = await etag();
    const [a, b] = await Promise.all([
      put({ A: {} }, { ...auth, 'If-Match': tag }),
      put({ B: {} }, { ...auth, 'If-Match': tag }),
    ]);
    expect([a.status, b.status].sort()).toEqual([204, 412]);
  });
  it('keeps the previous version as a backup', async () => {
    await put(lib, auth);
    await put({ Other: {} }, auth);
    expect(JSON.parse(await readFile(join(dir, 'themes.json.bak'), 'utf8'))).toEqual(lib);
  });
});

describe('anonymous mode', () => {
  beforeEach(() => start({ THEMES_ALLOW_ANON_WRITE: 'true' }));

  it('accepts writes without a token', async () => {
    expect(await (await fetch(`${base}/api/themes/status`)).json()).toEqual({ writable: true });
    expect((await put(lib)).status).toBe(204);
  });
});

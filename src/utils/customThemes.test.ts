import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  loadSavedThemes,
  persistSavedThemes,
  makeBlankTheme,
  fetchServerThemes,
  pushServerThemes,
  queueServerPush,
  resetServerSync,
  saveWriteToken,
  serverWritable,
  setServerSyncListener,
  PUSH_DELAY_MS,
  type SavedThemes,
} from './customThemes';

const KEY = 'mm-custom-themes';

beforeEach(() => localStorage.clear());
afterEach(() => vi.restoreAllMocks());

const sample = (): SavedThemes => ({
  Corporate: { ...makeBlankTheme('Corporate') },
});

describe('loadSavedThemes', () => {
  it('returns an empty library when nothing is stored', () => {
    expect(loadSavedThemes()).toEqual({});
  });

  it('reads back what persistSavedThemes wrote', () => {
    persistSavedThemes(sample());
    expect(Object.keys(loadSavedThemes())).toEqual(['Corporate']);
  });

  it('returns empty rather than throwing on malformed JSON', () => {
    localStorage.setItem(KEY, '{ this is not json');
    expect(loadSavedThemes()).toEqual({});
  });

  it('returns empty when the stored value is not an object', () => {
    localStorage.setItem(KEY, '"just a string"');
    expect(loadSavedThemes()).toEqual({});
  });

  it('returns empty when the stored value is null', () => {
    localStorage.setItem(KEY, 'null');
    expect(loadSavedThemes()).toEqual({});
  });

  it('survives localStorage throwing on read', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('SecurityError');
    });
    expect(loadSavedThemes()).toEqual({});
  });
});

describe('persistSavedThemes', () => {
  it('writes under the documented key', () => {
    persistSavedThemes(sample());
    expect(localStorage.getItem(KEY)).toContain('Corporate');
  });

  it('overwrites rather than merging', () => {
    persistSavedThemes(sample());
    persistSavedThemes({ Other: makeBlankTheme('Other') });
    expect(Object.keys(loadSavedThemes())).toEqual(['Other']);
  });

  it('can clear the library', () => {
    persistSavedThemes(sample());
    persistSavedThemes({});
    expect(loadSavedThemes()).toEqual({});
  });

  it('swallows a quota error instead of crashing the app', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('QuotaExceededError');
    });
    // Saving is best-effort; the user should not lose the session over it.
    expect(() => persistSavedThemes(sample())).not.toThrow();
  });
});

describe('makeBlankTheme', () => {
  it('uses the supplied name', () => {
    expect(makeBlankTheme('My Theme').name).toBe('My Theme');
  });

  it('defaults the name when none is given', () => {
    expect(makeBlankTheme().name).toBe('New theme');
  });

  it('produces a config Mermaid can consume', () => {
    const theme = makeBlankTheme();
    expect(theme.mermaidConfig.theme).toBe('base');
    expect(theme.mermaidConfig.themeVariables).toMatchObject({
      background: expect.any(String),
      primaryColor: expect.any(String),
      lineColor: expect.any(String),
    });
  });

  it('starts with empty themeCSS so the editor sliders read as unset', () => {
    expect(makeBlankTheme().mermaidConfig.themeCSS).toBe('');
  });

  it('provides all three annotation colors', () => {
    const { annotationColors } = makeBlankTheme();
    expect(Object.keys(annotationColors).sort()).toEqual(['primary', 'secondary', 'text']);
  });

  it('returns an independent object each call', () => {
    const a = makeBlankTheme();
    const b = makeBlankTheme();
    a.mermaidConfig.themeVariables!.primaryColor = '#000000';
    expect(b.mermaidConfig.themeVariables!.primaryColor).not.toBe('#000000');
  });
});

describe('server sync', () => {
  const json = (body: unknown, status = 200, etag = '"v1"') =>
    new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json', ETag: etag } });
  const TOKEN = 't'.repeat(40);

  // persistSavedThemes (used by earlier tests) queues pushes and primes the
  // module's cached state, so reset everything before each test here.
  beforeEach(() => {
    resetServerSync();
    saveWriteToken('');
  });
  afterEach(() => {
    resetServerSync();
    saveWriteToken('');
    setServerSyncListener(null);
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it('never writes before this session has fetched the server copy', async () => {
    saveWriteToken(TOKEN);
    const fetchMock = vi.fn().mockResolvedValue(json({ writable: true }));
    vi.stubGlobal('fetch', fetchMock);
    expect(await pushServerThemes(sample())).toBe('skipped');
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('never writes when the server copy could not be fetched', async () => {
    saveWriteToken(TOKEN);
    const fetchMock = vi.fn().mockResolvedValueOnce(json({ error: 'busy' }, 429));
    vi.stubGlobal('fetch', fetchMock);
    expect(await fetchServerThemes()).toBeNull();
    expect(await pushServerThemes({})).toBe('skipped');
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('does not write when the server reports read-only', async () => {
    const fetchMock = vi.fn().mockResolvedValueOnce(json({})).mockResolvedValue(json({ writable: false }));
    vi.stubGlobal('fetch', fetchMock);
    await fetchServerThemes();
    expect(await pushServerThemes(sample())).toBe('skipped');
    expect(fetchMock.mock.calls.map((c) => c[0])).toEqual(['/api/themes', '/api/themes/status']);
  });

  it('does not write when the status check fails', async () => {
    const fetchMock = vi.fn().mockResolvedValueOnce(json({})).mockRejectedValue(new Error('offline'));
    vi.stubGlobal('fetch', fetchMock);
    await fetchServerThemes();
    expect(await pushServerThemes(sample())).toBe('skipped');
  });

  it('sends the token and the last-seen version, then tracks the new version', async () => {
    saveWriteToken(TOKEN);
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(json({}, 200, '"v1"'))
      .mockResolvedValueOnce(json({ writable: true }))
      .mockResolvedValueOnce(new Response(null, { status: 204, headers: { ETag: '"v2"' } }))
      .mockResolvedValueOnce(new Response(null, { status: 204, headers: { ETag: '"v3"' } }));
    vi.stubGlobal('fetch', fetchMock);
    await fetchServerThemes();
    expect(await pushServerThemes(sample())).toBe('saved');
    const [url, init] = fetchMock.mock.calls[2];
    expect(url).toBe('/api/themes');
    expect(init.method).toBe('PUT');
    expect(init.headers.Authorization).toBe(`Bearer ${TOKEN}`);
    expect(init.headers['If-Match']).toBe('"v1"');
    await pushServerThemes(sample());
    expect(fetchMock.mock.calls[3][1].headers['If-Match']).toBe('"v2"');
  });

  it('stops pushing after a version conflict instead of overwriting', async () => {
    saveWriteToken(TOKEN);
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(json({}))
      .mockResolvedValueOnce(json({ writable: true }))
      .mockResolvedValueOnce(json({ error: 'changed' }, 412));
    vi.stubGlobal('fetch', fetchMock);
    await fetchServerThemes();
    expect(await pushServerThemes(sample())).toBe('conflict');
    expect(await pushServerThemes(sample())).toBe('skipped');
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });

  it('reports a failed write', async () => {
    saveWriteToken(TOKEN);
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(json({}))
      .mockResolvedValueOnce(json({ writable: true }))
      .mockResolvedValueOnce(json({ error: 'slow down' }, 429));
    vi.stubGlobal('fetch', fetchMock);
    await fetchServerThemes();
    expect(await pushServerThemes(sample())).toBe('failed');
  });

  it('coalesces rapid saves into one write and reports the outcome', async () => {
    vi.useFakeTimers();
    saveWriteToken(TOKEN);
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(json({}))
      .mockResolvedValueOnce(json({ writable: true }))
      .mockResolvedValue(new Response(null, { status: 204, headers: { ETag: '"v2"' } }));
    vi.stubGlobal('fetch', fetchMock);
    const listener = vi.fn();
    setServerSyncListener(listener);
    await fetchServerThemes();
    queueServerPush({ A: makeBlankTheme('A') });
    queueServerPush({ B: makeBlankTheme('B') });
    queueServerPush({ C: makeBlankTheme('C') });
    await vi.advanceTimersByTimeAsync(PUSH_DELAY_MS + 10);
    const puts = fetchMock.mock.calls.filter((c) => c[1]?.method === 'PUT');
    expect(puts).toHaveLength(1);
    expect(Object.keys(JSON.parse(puts[0][1].body))).toEqual(['C']);
    expect(listener).toHaveBeenCalledWith('saved');
  });

  it('re-checks write access after the token changes', async () => {
    const fetchMock = vi.fn().mockResolvedValue(json({ writable: false }));
    vi.stubGlobal('fetch', fetchMock);
    expect(await serverWritable()).toBe(false);
    expect(await serverWritable()).toBe(false);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    saveWriteToken(TOKEN);
    await serverWritable();
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('sanitizes themes fetched from the server', async () => {
    const hostile = {
      Evil: {
        name: 'Evil',
        bgClass: 'bg-white',
        mermaidConfig: { theme: 'base', themeCSS: '@import url(https://evil.example/x.css); .a{background:url(https://evil.example/p)}' },
      },
      Broken: 'not a theme',
    };
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(json(hostile)));
    const themes = await fetchServerThemes();
    expect(Object.keys(themes ?? {})).toEqual(['Evil']);
    const css = String(themes?.Evil.mermaidConfig.themeCSS);
    expect(css).not.toContain('@import');
    expect(css).not.toContain('evil.example');
  });

  it('returns null when the backend is absent', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(json({ error: 'x' }, 502)));
    expect(await fetchServerThemes()).toBeNull();
  });

  it('sanitizes what is read back from localStorage', () => {
    localStorage.setItem(KEY, JSON.stringify({ Evil: { mermaidConfig: { themeCSS: '@import url(x);' } } }));
    expect(String(loadSavedThemes().Evil.mermaidConfig.themeCSS)).not.toContain('@import');
  });
});

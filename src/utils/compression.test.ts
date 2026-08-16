import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { compressToURL, decompressFromURL, generateShareURL, parseShareURL } from './compression';

/** Point jsdom at a given URL so the share helpers read/write against it. */
function setLocation(href: string) {
  window.history.replaceState({}, '', href);
}

beforeEach(() => setLocation('/'));

describe('compressToURL / decompressFromURL', () => {
  it('round-trips a diagram unchanged', () => {
    const code = 'flowchart TD\n  A[Start] --> B{Is it working?}\n  B -->|Yes| C[Great!]';
    expect(decompressFromURL(compressToURL(code))).toBe(code);
  });

  it('round-trips non-ASCII content', () => {
    const code = 'flowchart TD\n  A[开始] --> B[ユーザー]\n  B --> C[Ação]';
    expect(decompressFromURL(compressToURL(code))).toBe(code);
  });

  it('produces URL-safe output needing no further escaping', () => {
    const compressed = compressToURL('flowchart TD\n  A --> B');
    expect(compressed).toBe(encodeURIComponent(compressed));
  });

  it('actually compresses repetitive input', () => {
    const repetitive = 'flowchart TD\n' + '  A --> B\n'.repeat(200);
    expect(compressToURL(repetitive).length).toBeLessThan(repetitive.length);
  });

  it('returns empty string for undecodable input rather than throwing', () => {
    expect(decompressFromURL('!!!not-valid-lz!!!')).toBe('');
  });

  it('returns empty string for empty input', () => {
    expect(decompressFromURL('')).toBe('');
  });
});

describe('generateShareURL', () => {
  it('returns a bare URL when given nothing', () => {
    const url = new URL(generateShareURL({}));
    expect([...url.searchParams.keys()]).toEqual([]);
  });

  it('encodes code under the short "c" parameter', () => {
    const url = new URL(generateShareURL({ code: 'flowchart TD\n  A --> B' }));
    expect(decompressFromURL(url.searchParams.get('c')!)).toBe('flowchart TD\n  A --> B');
  });

  it('omits code that is only whitespace', () => {
    expect(new URL(generateShareURL({ code: '   \n  ' })).searchParams.has('c')).toBe(false);
  });

  it('maps each option to its parameter name', () => {
    const url = new URL(generateShareURL({ theme: 'linearLight', background: 'dots', font: 'inter', example: 'flowchart-login' }));
    expect(url.searchParams.get('theme')).toBe('linearLight');
    expect(url.searchParams.get('bg')).toBe('dots');
    expect(url.searchParams.get('font')).toBe('inter');
    expect(url.searchParams.get('example')).toBe('flowchart-login');
  });

  it('does not carry over query parameters already on the page', () => {
    setLocation('/?leftover=1');
    expect(new URL(generateShareURL({ theme: 'x' })).searchParams.has('leftover')).toBe(false);
  });
});

describe('parseShareURL', () => {
  it('returns null when there is nothing to parse', () => {
    expect(parseShareURL()).toBeNull();
  });

  it('reads back everything generateShareURL wrote', () => {
    const params = { code: 'flowchart TD\n  A --> B', theme: 'linearLight', background: 'dots', font: 'inter' };
    setLocation(generateShareURL(params));
    expect(parseShareURL()).toEqual(params);
  });

  it('ignores unrelated query parameters', () => {
    setLocation('/?utm_source=twitter&theme=linearLight');
    expect(parseShareURL()).toEqual({ theme: 'linearLight' });
  });

  it('drops an undecodable code rather than returning garbage', () => {
    setLocation('/?c=!!!broken!!!&theme=linearLight');
    const parsed = parseShareURL();
    expect(parsed).toEqual({ theme: 'linearLight' });
    expect(parsed).not.toHaveProperty('code');
  });

  it('returns null when the only parameter is an undecodable code', () => {
    setLocation('/?c=!!!broken!!!');
    expect(parseShareURL()).toBeNull();
  });

  it('survives a very long code parameter', () => {
    const big = 'flowchart TD\n' + '  A --> B\n'.repeat(500);
    setLocation(generateShareURL({ code: big }));
    expect(parseShareURL()?.code).toBe(big);
  });
});

describe('failure handling', () => {
  afterEach(() => vi.restoreAllMocks());

  it('logs and returns empty rather than propagating a decompression throw', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    // Force the underlying library to throw on a non-string input.
    expect(decompressFromURL(undefined as unknown as string)).toBe('');
    spy.mockRestore();
  });
});

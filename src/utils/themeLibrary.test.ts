import { describe, it, expect } from 'vitest';
import {
  buildLibraryExport,
  parseLibraryFile,
  mergeLibrary,
  coerceTheme,
  libraryFilename,
  LIBRARY_KIND,
} from './themeLibrary';
import type { SavedThemes } from './customThemes';
import type { ThemeConfig } from './themes';

const theme = (name: string, themeCSS = ''): ThemeConfig => ({
  name,
  bgClass: 'bg-white',
  annotationColors: { primary: '#f00', secondary: '#0f0', text: '#000' },
  mermaidConfig: { theme: 'base', themeVariables: { primaryColor: '#fff' }, themeCSS },
});

const library = (...names: string[]): SavedThemes =>
  Object.fromEntries(names.map((n) => [n, theme(n)]));

describe('export/import round trip', () => {
  it('restores the themes it exported', () => {
    const original = library('Corporate', 'Dark Ops');
    const result = parseLibraryFile(buildLibraryExport(original));
    expect(result).not.toBeNull();
    expect(Object.keys(result!.themes).sort()).toEqual(['Corporate', 'Dark Ops']);
    expect(result!.skipped).toEqual([]);
  });

  it('writes a self-identifying envelope', () => {
    const parsed = JSON.parse(buildLibraryExport(library('A'), '2026-08-16T00:00:00.000Z'));
    expect(parsed.kind).toBe(LIBRARY_KIND);
    expect(parsed.version).toBe(1);
    expect(parsed.exportedAt).toBe('2026-08-16T00:00:00.000Z');
  });

  it('names the file with a json extension', () => {
    expect(libraryFilename(1700000000000)).toBe('mermaid-themes-1700000000000.json');
  });

  it('also accepts a bare name->theme map, as recovered from localStorage', () => {
    const result = parseLibraryFile(JSON.stringify(library('Solo')));
    expect(Object.keys(result!.themes)).toEqual(['Solo']);
  });
});

describe('rejecting bad input', () => {
  it('returns null for non-JSON', () => {
    expect(parseLibraryFile('not json at all')).toBeNull();
  });

  it('returns null for empty input', () => {
    expect(parseLibraryFile('')).toBeNull();
  });

  it('returns null for a file claiming a different kind', () => {
    const text = JSON.stringify({ kind: 'something-else', themes: library('A') });
    expect(parseLibraryFile(text)).toBeNull();
  });

  it('skips entries that are not themes rather than failing the whole import', () => {
    const text = JSON.stringify({
      kind: LIBRARY_KIND,
      themes: { Good: theme('Good'), Bad: 'nope', AlsoBad: { noMermaidConfig: true } },
    });
    const result = parseLibraryFile(text)!;
    expect(Object.keys(result.themes)).toEqual(['Good']);
    expect(result.skipped.sort()).toEqual(['AlsoBad', 'Bad']);
  });

  it('refuses an absurdly large file', () => {
    expect(parseLibraryFile('{"a":"' + 'x'.repeat(2_000_001) + '"}')).toBeNull();
  });
});

describe('untrusted input is sanitized', () => {
  it('strips @import and remote url() from imported themeCSS', () => {
    const hostile = '@import url("http://evil.test/x.css"); .node { background: url(https://evil.test/i.png); }';
    const result = parseLibraryFile(
      JSON.stringify({ kind: LIBRARY_KIND, themes: { X: theme('X', hostile) } }),
    )!;
    const css = result.themes.X.mermaidConfig.themeCSS as string;
    expect(css).not.toContain('@import');
    expect(css).not.toContain('evil.test/x.css');
    expect(css).not.toContain('https://evil.test/i.png');
  });

  it('strips executable url schemes from imported themeCSS', () => {
    const hostile = '.node { background: javascript:alert(1); }';
    const result = parseLibraryFile(
      JSON.stringify({ kind: LIBRARY_KIND, themes: { X: theme('X', hostile) } }),
    )!;
    expect(result.themes.X.mermaidConfig.themeCSS).not.toContain('javascript:');
  });

  it('drops a bgStyle value carrying a url scheme', () => {
    const coerced = coerceTheme('X', {
      mermaidConfig: { theme: 'base' },
      bgStyle: { backgroundColor: '#fff', backgroundImage: 'javascript:alert(1)' },
    })!;
    expect(coerced.bgStyle).toEqual({ backgroundColor: '#fff' });
  });

  it('drops non-scalar themeVariables', () => {
    const coerced = coerceTheme('X', {
      mermaidConfig: { theme: 'base', themeVariables: { ok: '#fff', bad: { nested: true } } },
    })!;
    expect(coerced.mermaidConfig.themeVariables).toEqual({ ok: '#fff' });
  });

  it('takes the name from the map key, not the payload', () => {
    // Otherwise a crafted file could overwrite an unrelated saved theme.
    const coerced = coerceTheme('RealName', { name: 'Spoofed', mermaidConfig: { theme: 'base' } })!;
    expect(coerced.name).toBe('RealName');
  });
});

describe('mergeLibrary', () => {
  it('adds non-colliding themes', () => {
    const { merged, renamed } = mergeLibrary(library('A'), library('B'));
    expect(Object.keys(merged).sort()).toEqual(['A', 'B']);
    expect(renamed).toEqual({});
  });

  it('never overwrites an existing theme on a name collision', () => {
    const existing = { A: theme('A', '/* mine */') };
    const { merged, renamed } = mergeLibrary(existing, { A: theme('A', '/* theirs */') });
    expect(merged.A.mermaidConfig.themeCSS).toBe('/* mine */');
    expect(merged['A (imported)'].mermaidConfig.themeCSS).toBe('/* theirs */');
    expect(renamed).toEqual({ A: 'A (imported)' });
  });

  it('keeps counting up when the renamed slot is also taken', () => {
    const existing = { A: theme('A'), 'A (imported)': theme('A (imported)') };
    const { merged } = mergeLibrary(existing, { A: theme('A') });
    expect(Object.keys(merged)).toContain('A (imported 2)');
  });

  it('rewrites the theme name field to match its new key', () => {
    const { merged } = mergeLibrary({ A: theme('A') }, { A: theme('A') });
    expect(merged['A (imported)'].name).toBe('A (imported)');
  });

  it('leaves the original library object unmutated', () => {
    const existing = library('A');
    mergeLibrary(existing, library('A'));
    expect(Object.keys(existing)).toEqual(['A']);
  });
});

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { loadSavedThemes, persistSavedThemes, makeBlankTheme, type SavedThemes } from './customThemes';

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

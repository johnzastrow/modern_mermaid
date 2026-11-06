import { describe, it, expect, vi, afterEach } from 'vitest';
import { configFontFamilies, ensureDiagramFonts } from './diagramFonts';

describe('configFontFamilies', () => {
  it('collects fontFamily values and themeCSS font-family rules, without generics', () => {
    const config = {
      fontFamily: '"Inter", "Noto Sans SC", -apple-system, sans-serif',
      themeVariables: { fontFamily: "'Nunito', system-ui" },
      themeCSS: '.node text { font-family: "JetBrains Mono" !important; } .x{font-family:Caveat}',
    };
    expect(configFontFamilies(config)).toEqual(['Inter', 'Noto Sans SC', 'Nunito', 'JetBrains Mono', 'Caveat']);
  });

  it('returns nothing for configs without fonts', () => {
    expect(configFontFamilies({ theme: 'base' })).toEqual([]);
    expect(configFontFamilies(undefined)).toEqual([]);
  });
});

describe('ensureDiagramFonts', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('loads regular and bold faces of declared families only', async () => {
    const load = vi.fn().mockResolvedValue([]);
    const faces = [{ family: 'Inter' }, { family: '"Caveat"' }];
    Object.defineProperty(document, 'fonts', {
      configurable: true,
      value: { load, forEach: (cb: (f: { family: string }) => void) => faces.forEach(cb) },
    });

    await ensureDiagramFonts({ fontFamily: '"Inter", "Not Declared", sans-serif', themeCSS: 'a{font-family:Caveat}' });

    expect(load.mock.calls.map((c) => c[0]).sort()).toEqual(
      ['400 16px "Caveat"', '400 16px "Inter"', '700 16px "Caveat"', '700 16px "Inter"'],
    );
  });

  it('does not wait longer than the timeout when a font never loads', async () => {
    vi.useFakeTimers();
    Object.defineProperty(document, 'fonts', {
      configurable: true,
      value: { load: () => new Promise(() => {}), forEach: (cb: (f: { family: string }) => void) => cb({ family: 'Slow Font' }) },
    });
    const done = vi.fn();
    void ensureDiagramFonts({ fontFamily: 'Slow Font' }).then(done);
    await vi.advanceTimersByTimeAsync(3000);
    expect(done).toHaveBeenCalled();
    vi.useRealTimers();
  });
});

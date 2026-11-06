import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { usesHandDrawnFonts } from '../utils/handDrawnFonts';

describe('fonts are self-hosted', () => {
  const sources = ['index.html', 'src/fonts.css', 'src/fonts-handdrawn.css', 'src/index.css'];

  it('references no external font hosts', () => {
    for (const file of sources) {
      expect(readFileSync(file, 'utf8'), file).not.toMatch(/https?:\/\/[^'")\s]*(font|go-admin)/i);
    }
  });

  it('has a file on disk for every hand-drawn @font-face', () => {
    const css = readFileSync('src/fonts-handdrawn.css', 'utf8');
    const urls = [...css.matchAll(/url\('\/(fonts\/[^']+)'\)/g)].map((m) => m[1]);
    expect(urls.length).toBeGreaterThan(200);
    for (const url of urls) expect(existsSync(`public/${url}`), url).toBe(true);
    expect(readdirSync('public/fonts')).toEqual(expect.arrayContaining(['OFL.txt']));
  });
});

describe('usesHandDrawnFonts', () => {
  it('detects the hand-drawn families anywhere in a theme config', () => {
    expect(usesHandDrawnFonts({ themeVariables: { fontFamily: '"Excalifont", cursive' } })).toBe(true);
    expect(usesHandDrawnFonts({ themeCSS: '.node { font-family: Xiaolai; }' })).toBe(true);
    expect(usesHandDrawnFonts({ themeVariables: { fontFamily: 'Inter' } })).toBe(false);
    expect(usesHandDrawnFonts(undefined)).toBe(false);
  });
});

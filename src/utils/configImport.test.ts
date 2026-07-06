import { describe, it, expect } from 'vitest';
import type { MermaidConfig } from 'mermaid';
import { buildInitDirective, buildFrontmatter } from './configExport';
import { parseThemeConfigInput, sanitizeThemeCSS } from './configImport';

const sample: MermaidConfig = {
  theme: 'base',
  themeVariables: {
    primaryColor: '#ffffff',
    darkMode: true,
    fontSize: '14px',
  },
  themeCSS: '.node rect { stroke-width: 1.5px; }\n.edgePath .path { stroke: #737373; }',
} as MermaidConfig;

describe('round-trip: init directive', () => {
  it('parses back theme + themeVariables (themeCSS is not inlined)', () => {
    const parsed = parseThemeConfigInput(buildInitDirective(sample));
    expect(parsed).not.toBeNull();
    expect(parsed!.theme).toBe('base');
    expect(parsed!.themeVariables?.primaryColor).toBe('#ffffff');
    expect(parsed!.themeVariables?.darkMode).toBe(true);
    expect(parsed!.themeCSS).toBeUndefined();
  });
});

describe('round-trip: frontmatter', () => {
  it('recovers theme, typed themeVariables and themeCSS', () => {
    const parsed = parseThemeConfigInput(buildFrontmatter(sample));
    expect(parsed).not.toBeNull();
    expect(parsed!.theme).toBe('base');
    expect(parsed!.themeVariables?.primaryColor).toBe('#ffffff');
    expect(parsed!.themeVariables?.darkMode).toBe(true); // boolean, not "true"
    expect(parsed!.themeVariables?.fontSize).toBe('14px'); // quoted string preserved
    expect(parsed!.themeCSS).toContain('stroke-width');
    expect(parsed!.themeCSS).toContain('.edgePath .path');
  });
});

describe('security: sanitizeThemeCSS', () => {
  it('strips @import, external url() and expression()', () => {
    const dirty = '@import url(http://evil.test/x.css); .n { background: url("https://evil.test/p") ; width: expression(alert(1)); }';
    const clean = sanitizeThemeCSS(dirty);
    expect(clean).not.toMatch(/@import/i);
    expect(clean).not.toMatch(/evil\.test/);
    expect(clean).not.toMatch(/expression\s*\(/i);
  });

  it('is applied on import', () => {
    const fm = buildFrontmatter({ ...sample, themeCSS: '.n{}\n@import url(https://evil.test/x);' } as MermaidConfig);
    const parsed = parseThemeConfigInput(fm);
    expect(parsed!.themeCSS).not.toMatch(/@import/i);
  });
});

describe('robustness', () => {
  it('parses raw JSON', () => {
    const parsed = parseThemeConfigInput('{"theme":"base","themeVariables":{"lineColor":"#000000"}}');
    expect(parsed!.themeVariables?.lineColor).toBe('#000000');
  });
  it('returns null for junk', () => {
    expect(parseThemeConfigInput('not a config')).toBeNull();
    expect(parseThemeConfigInput('')).toBeNull();
  });
});

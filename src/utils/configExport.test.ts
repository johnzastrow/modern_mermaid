import { describe, it, expect } from 'vitest';
import type { MermaidConfig } from 'mermaid';
import { buildInitDirective, buildFrontmatter, pickExportableConfig } from './configExport';

const sample: MermaidConfig = {
  theme: 'base',
  themeVariables: {
    primaryColor: '#ffffff',
    darkMode: true,
    fontSize: '14px',
  },
  themeCSS: '.node rect { stroke-width: 1.5px; }\n.edgePath .path { stroke: #737373; }',
  // A key that must NOT be exported:
  securityLevel: 'strict',
} as MermaidConfig;

describe('pickExportableConfig', () => {
  it('keeps only theme, themeVariables and themeCSS', () => {
    const picked = pickExportableConfig(sample);
    expect(Object.keys(picked).sort()).toEqual(['theme', 'themeCSS', 'themeVariables']);
    expect('securityLevel' in picked).toBe(false);
  });
});

describe('buildInitDirective', () => {
  it('produces a single-line, valid JSON init directive', () => {
    const out = buildInitDirective(sample);
    expect(out.startsWith('%%{init: ')).toBe(true);
    expect(out.endsWith('}%%')).toBe(true);
    expect(out).not.toContain('\n');
    // The inner payload must be parseable JSON that round-trips the config.
    const json = out.slice('%%{init: '.length, -'}%%'.length);
    const parsed = JSON.parse(json);
    expect(parsed.theme).toBe('base');
    expect(parsed.themeVariables.primaryColor).toBe('#ffffff');
    expect(parsed.themeCSS).toContain('stroke-width');
  });
});

describe('buildFrontmatter', () => {
  it('quotes colors and uses a literal block for themeCSS', () => {
    const out = buildFrontmatter(sample);
    expect(out.startsWith('---\nconfig:')).toBe(true);
    expect(out.endsWith('---')).toBe(true);
    expect(out).toContain('theme: base');
    expect(out).toContain('primaryColor: "#ffffff"'); // color quoted
    expect(out).toContain('darkMode: true'); // boolean unquoted
    expect(out).toContain('themeCSS: |');
    expect(out).toContain('    .node rect { stroke-width: 1.5px; }');
  });
});

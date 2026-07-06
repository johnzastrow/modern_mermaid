import type { MermaidConfig } from 'mermaid';

/**
 * Serialize a theme's Mermaid config into paste-ready snippets for docs.
 *
 * Only the portable styling keys are exported: `theme`, `themeVariables`
 * (colors/fonts — honored by every Mermaid renderer, including GitHub) and
 * `themeCSS` (rich per-element styling — honored by full renderers such as
 * Typora; GitHub strips it but degrades gracefully to colors/fonts).
 */
export type ExportableConfig = Pick<MermaidConfig, 'theme' | 'themeVariables' | 'themeCSS'>;

export function pickExportableConfig(config: MermaidConfig): ExportableConfig {
  const out: ExportableConfig = {};
  if (config.theme) out.theme = config.theme;
  if (config.themeVariables) out.themeVariables = config.themeVariables;
  if (config.themeCSS) out.themeCSS = config.themeCSS;
  return out;
}

/**
 * A single-line `%%{init: ...}%%` directive to place at the top of a
 * ```mermaid``` block.
 *
 * NOTE: `themeCSS` is intentionally omitted. Mermaid's inline init directive
 * does not reliably apply multi-line `themeCSS`, so including it can break
 * rendering. This block carries only `theme` + `themeVariables` (colors/fonts)
 * — the portable part honored by every renderer, including GitHub. Use
 * {@link buildFrontmatter} when you need the full `themeCSS` styling.
 */
export function buildInitDirective(config: MermaidConfig): string {
  const { theme, themeVariables } = pickExportableConfig(config);
  const portable: ExportableConfig = {};
  if (theme) portable.theme = theme;
  if (themeVariables) portable.themeVariables = themeVariables;
  return `%%{init: ${JSON.stringify(portable)}}%%`;
}

/** Quote a scalar so it is valid YAML (colors start with '#', a comment char). */
function yamlScalar(value: unknown): string {
  if (typeof value === 'boolean' || typeof value === 'number') return String(value);
  // JSON double-quoted strings are valid YAML scalars and escape correctly.
  return JSON.stringify(String(value));
}

/**
 * A YAML frontmatter `config:` block (Mermaid >= 10.5). Far more readable for
 * large `themeCSS` thanks to the `|` literal block scalar.
 */
export function buildFrontmatter(config: MermaidConfig): string {
  const cfg = pickExportableConfig(config);
  const lines: string[] = ['---', 'config:'];

  if (cfg.theme) lines.push(`  theme: ${cfg.theme}`);

  if (cfg.themeVariables) {
    lines.push('  themeVariables:');
    for (const [key, value] of Object.entries(cfg.themeVariables)) {
      lines.push(`    ${key}: ${yamlScalar(value)}`);
    }
  }

  if (cfg.themeCSS) {
    lines.push('  themeCSS: |');
    for (const cssLine of String(cfg.themeCSS).replace(/\n+$/, '').split('\n')) {
      // Literal block scalar: preserve content, add uniform 4-space indent.
      lines.push(cssLine ? `    ${cssLine}` : '');
    }
  }

  lines.push('---');
  return lines.join('\n');
}

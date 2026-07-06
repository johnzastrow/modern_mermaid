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
 * ```mermaid``` block. Most compatible form across Mermaid versions.
 */
export function buildInitDirective(config: MermaidConfig): string {
  return `%%{init: ${JSON.stringify(pickExportableConfig(config))}}%%`;
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

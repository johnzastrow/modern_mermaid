import type { MermaidConfig } from 'mermaid';
import type { ExportableConfig } from './configExport';

/** Reject absurdly large pastes outright (defense in depth). */
const MAX_INPUT = 200_000;

/**
 * Strip dangerous constructs from imported CSS. Importing a theme means running
 * untrusted `themeCSS` through the renderer, so this is the key trust boundary.
 */
export function sanitizeThemeCSS(css: string): string {
  return css
    .slice(0, MAX_INPUT)
    .replace(/@import[^;]*;?/gi, '')
    .replace(/expression\s*\([^)]*\)/gi, '')
    .replace(/url\(\s*['"]?\s*(?:https?:|\/\/)[^)]*\)/gi, 'url()')
    .replace(/javascript:/gi, '');
}

/** Allowlist keys and coerce a parsed object into a safe ExportableConfig. */
function coerceConfig(raw: unknown): ExportableConfig | null {
  if (!raw || typeof raw !== 'object') return null;
  const r = raw as Record<string, unknown>;
  const out: ExportableConfig = {};
  if (typeof r.theme === 'string') out.theme = r.theme as MermaidConfig['theme'];
  if (r.themeVariables && typeof r.themeVariables === 'object') {
    const vars: Record<string, string | number | boolean> = {};
    for (const [k, v] of Object.entries(r.themeVariables as Record<string, unknown>)) {
      if (typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean') vars[k] = v;
    }
    out.themeVariables = vars;
  }
  if (typeof r.themeCSS === 'string') out.themeCSS = sanitizeThemeCSS(r.themeCSS);
  return out.theme || out.themeVariables || out.themeCSS ? out : null;
}

/** Parse an inline `%%{init: {...}}%%` directive (strict JSON payload). */
function parseInit(text: string): ExportableConfig | null {
  const m = text.match(/%%\{\s*init:\s*([\s\S]*)\}%%/); // greedy to the final }%%
  if (!m) return null;
  try {
    return coerceConfig(JSON.parse(m[1].trim()));
  } catch {
    return null;
  }
}

function unquote(v: string): string {
  const t = v.trim();
  if ((t.startsWith('"') && t.endsWith('"')) || (t.startsWith("'") && t.endsWith("'"))) {
    try {
      return JSON.parse(t.startsWith("'") ? `"${t.slice(1, -1)}"` : t);
    } catch {
      return t.slice(1, -1);
    }
  }
  return t;
}

function coerceScalar(v: string): string | number | boolean {
  const t = v.trim();
  if (t === 'true') return true;
  if (t === 'false') return false;
  if ((t.startsWith('"') && t.endsWith('"')) || (t.startsWith("'") && t.endsWith("'"))) return unquote(t);
  if (/^-?\d+(\.\d+)?$/.test(t)) return Number(t);
  return t;
}

/** Parse a YAML frontmatter `config:` block (matches this app's export shape). */
function parseFrontmatter(text: string): ExportableConfig | null {
  const m = text.match(/---[ \t]*\r?\n([\s\S]*?)\r?\n---/);
  if (!m) return null;
  const body = m[1];

  let head = body;
  let css: string | null = null;
  const cssIdx = body.search(/^ {2}themeCSS:\s*\|\s*$/m);
  if (cssIdx !== -1) {
    head = body.slice(0, cssIdx);
    const after = body.slice(cssIdx).split('\n').slice(1); // drop the "themeCSS: |" line
    css = after.map((l) => l.replace(/^ {4}/, '')).join('\n').replace(/\s+$/, '');
  }

  const out: Record<string, unknown> = {};

  const themeMatch = head.match(/^ {2}theme:\s*(.+)$/m);
  if (themeMatch) out.theme = unquote(themeMatch[1]);

  const tvIdx = head.search(/^ {2}themeVariables:\s*$/m);
  if (tvIdx !== -1) {
    const vars: Record<string, string | number | boolean> = {};
    for (const line of head.slice(tvIdx).split('\n').slice(1)) {
      const vm = line.match(/^ {4}([A-Za-z0-9_-]+):\s*(.+)$/);
      if (vm) vars[vm[1]] = coerceScalar(vm[2]);
      else if (line.trim() && !/^ {4}/.test(line)) break; // dedent → end of block
    }
    out.themeVariables = vars;
  }

  if (css != null) out.themeCSS = css;
  return coerceConfig(out);
}

/**
 * Detect the format of pasted text (init directive / YAML frontmatter / raw
 * JSON) and parse it into a safe ExportableConfig. Returns null if unparseable.
 * Never evaluates input.
 */
export function parseThemeConfigInput(text: string): ExportableConfig | null {
  if (!text || text.length > MAX_INPUT) return null;
  const t = text.trim();
  if (t.includes('%%{') && /init:/.test(t)) return parseInit(t);
  if (t.startsWith('---')) return parseFrontmatter(t);
  if (t.startsWith('{')) {
    try {
      return coerceConfig(JSON.parse(t));
    } catch {
      return null;
    }
  }
  return parseInit(t) ?? parseFrontmatter(t);
}

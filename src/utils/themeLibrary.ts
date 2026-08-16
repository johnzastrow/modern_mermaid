/**
 * Backup and restore for the saved-theme library.
 *
 * Saved themes live in a single localStorage key, which means clearing browser
 * data destroys them and there is no way to move a set between machines. This
 * module serializes the whole library to a JSON file and reads one back.
 *
 * An imported file is untrusted input: it arrives from disk, may have been
 * edited by hand or produced by someone else, and its `themeCSS` is fed
 * straight to the renderer. Every field is therefore allowlisted and coerced,
 * and CSS goes through the same `sanitizeThemeCSS` boundary the paste-a-config
 * import already uses. Nothing is ever evaluated.
 */

import type { ThemeConfig } from './themes';
import type { SavedThemes } from './customThemes';
import { sanitizeThemeCSS } from './configImport';

export const LIBRARY_KIND = 'modern-mermaid-theme-library';
export const LIBRARY_VERSION = 1;

/** Reject absurdly large files outright (defense in depth). */
const MAX_FILE = 2_000_000;
/** A library file with more entries than this is treated as hostile. */
const MAX_THEMES = 500;

export interface ThemeLibraryFile {
  kind: typeof LIBRARY_KIND;
  version: number;
  exportedAt: string;
  themes: SavedThemes;
}

export interface LibraryImportResult {
  /** Themes that survived validation, already sanitized. */
  themes: SavedThemes;
  /** Names dropped because they could not be coerced into a theme. */
  skipped: string[];
}

// --- export ---------------------------------------------------------------

export function buildLibraryExport(themes: SavedThemes, exportedAt: string = new Date().toISOString()): string {
  const payload: ThemeLibraryFile = {
    kind: LIBRARY_KIND,
    version: LIBRARY_VERSION,
    exportedAt,
    themes,
  };
  return `${JSON.stringify(payload, null, 2)}\n`;
}

export function libraryFilename(now: number = Date.now()): string {
  return `mermaid-themes-${now}.json`;
}

// --- import ---------------------------------------------------------------

const isRecord = (v: unknown): v is Record<string, unknown> =>
  !!v && typeof v === 'object' && !Array.isArray(v);

/** Keep only string/number/boolean entries — no nested structures, no functions. */
function coerceScalarMap(raw: unknown): Record<string, string | number | boolean> | undefined {
  if (!isRecord(raw)) return undefined;
  const out: Record<string, string | number | boolean> = {};
  for (const [k, v] of Object.entries(raw)) {
    if (typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean') out[k] = v;
  }
  return out;
}

/** CSS-ish string map for bgStyle; values are strings only. */
function coerceStyleMap(raw: unknown): Record<string, string> | undefined {
  if (!isRecord(raw)) return undefined;
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(raw)) {
    // A style value carrying a URL scheme is the one thing worth blocking here.
    if (typeof v === 'string' && !/(?:javascript|vbscript|data)\s*:/i.test(v)) out[k] = v;
  }
  return out;
}

/**
 * Coerce one entry into a ThemeConfig, or null if it is not recognisably a
 * theme. `name` comes from the map key so a mismatched inner name cannot be
 * used to overwrite a different entry.
 */
export function coerceTheme(name: string, raw: unknown): ThemeConfig | null {
  if (!isRecord(raw)) return null;
  const mc = isRecord(raw.mermaidConfig) ? raw.mermaidConfig : null;
  if (!mc) return null;

  const ac = isRecord(raw.annotationColors) ? raw.annotationColors : {};
  const str = (v: unknown, fallback: string) => (typeof v === 'string' ? v : fallback);

  const theme: ThemeConfig = {
    name,
    bgClass: str(raw.bgClass, ''),
    annotationColors: {
      primary: str(ac.primary, '#6b7280'),
      secondary: str(ac.secondary, '#9ca3af'),
      text: str(ac.text, '#374151'),
    },
    mermaidConfig: {
      ...(typeof mc.theme === 'string' ? { theme: mc.theme as ThemeConfig['mermaidConfig']['theme'] } : {}),
      ...(coerceScalarMap(mc.themeVariables) ? { themeVariables: coerceScalarMap(mc.themeVariables) } : {}),
      themeCSS: typeof mc.themeCSS === 'string' ? sanitizeThemeCSS(mc.themeCSS) : '',
    },
  };

  const bgStyle = coerceStyleMap(raw.bgStyle);
  if (bgStyle && Object.keys(bgStyle).length) theme.bgStyle = bgStyle as ThemeConfig['bgStyle'];

  return theme;
}

/** Parse a library file. Returns null when the text is not one. */
export function parseLibraryFile(text: string): LibraryImportResult | null {
  if (!text || text.length > MAX_FILE) return null;

  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    return null;
  }
  if (!isRecord(parsed)) return null;

  // Accept a bare { name: theme } map too — that is what the localStorage value
  // itself looks like, and someone recovering by hand will reach for it.
  const rawThemes = isRecord(parsed.themes) ? parsed.themes : parsed;
  if (parsed.kind !== undefined && parsed.kind !== LIBRARY_KIND) return null;

  const themes: SavedThemes = {};
  const skipped: string[] = [];
  let count = 0;

  for (const [name, value] of Object.entries(rawThemes)) {
    if (count >= MAX_THEMES) {
      skipped.push(name);
      continue;
    }
    if (typeof name !== 'string' || !name.trim()) {
      skipped.push(String(name));
      continue;
    }
    const theme = coerceTheme(name, value);
    if (theme) {
      themes[name] = theme;
      count++;
    } else {
      skipped.push(name);
    }
  }

  if (!Object.keys(themes).length && !skipped.length) return null;
  return { themes, skipped };
}

/**
 * Merge an imported library into the existing one.
 *
 * A name collision never overwrites: the incoming theme is renamed. Losing a
 * theme the user spent time on because a backup happened to reuse its name
 * would be the worst possible outcome here, so the merge fails safe.
 */
export function mergeLibrary(
  existing: SavedThemes,
  incoming: SavedThemes,
): { merged: SavedThemes; renamed: Record<string, string> } {
  const merged: SavedThemes = { ...existing };
  const renamed: Record<string, string> = {};

  for (const [name, theme] of Object.entries(incoming)) {
    let finalName = name;
    if (finalName in merged) {
      let n = 2;
      finalName = `${name} (imported)`;
      while (finalName in merged) finalName = `${name} (imported ${n++})`;
      renamed[name] = finalName;
    }
    merged[finalName] = { ...theme, name: finalName };
  }

  return { merged, renamed };
}

// --- browser plumbing -----------------------------------------------------

export function downloadLibrary(content: string, filename: string = libraryFilename()): void {
  const blob = new Blob([content], { type: 'application/json;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  try {
    const link = document.createElement('a');
    link.download = filename;
    link.href = url;
    link.click();
  } finally {
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
}

/** Prompt for a .json file and hand back its text. Resolves null if cancelled. */
export function pickLibraryFile(): Promise<string | null> {
  return new Promise((resolve) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json,.json';
    input.onchange = () => {
      const file = input.files?.[0];
      if (!file) return resolve(null);
      const reader = new FileReader();
      reader.onload = () => resolve(typeof reader.result === 'string' ? reader.result : null);
      reader.onerror = () => resolve(null);
      reader.readAsText(file);
    };
    input.click();
  });
}

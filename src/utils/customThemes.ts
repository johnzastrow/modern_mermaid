import type { ThemeConfig } from './themes';

/** User-saved themes, keyed by their (unique) name, persisted in localStorage. */
export type SavedThemes = Record<string, ThemeConfig>;

const STORAGE_KEY = 'mm-custom-themes';

export function loadSavedThemes(): SavedThemes {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? (parsed as SavedThemes) : {};
  } catch {
    return {};
  }
}

export function persistSavedThemes(themes: SavedThemes): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(themes));
  } catch {
    // Storage may be full or unavailable; saving is best-effort.
  }
  // Best-effort mirror to the server so the library persists across sessions and
  // is shared across machines. localStorage above stays the fast, offline cache.
  void pushServerThemes(themes);
}

/**
 * Optional server-side theme store (see server/themes-server.mjs). Same-origin
 * `/api/themes`, which the frontend nginx proxies to the backend. Every call is
 * best-effort and degrades fully: if the endpoint is absent or down, the app
 * keeps working from localStorage alone.
 */
const SERVER_ENDPOINT = '/api/themes';

/** Fetch the shared library from the server. Returns null if unavailable. */
export async function fetchServerThemes(): Promise<SavedThemes | null> {
  try {
    const res = await fetch(SERVER_ENDPOINT, { headers: { Accept: 'application/json' } });
    if (!res.ok) return null;
    const data: unknown = await res.json();
    return data && typeof data === 'object' && !Array.isArray(data) ? (data as SavedThemes) : {};
  } catch {
    return null; // backend not present / offline — caller falls back to localStorage
  }
}

/** Push the full library to the server. Fire-and-forget; never throws. */
export async function pushServerThemes(themes: SavedThemes): Promise<void> {
  try {
    await fetch(SERVER_ENDPOINT, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(themes),
    });
  } catch {
    // best-effort
  }
}

/** A neutral, blank-slate theme to start a new design from scratch. */
export function makeBlankTheme(name = 'New theme'): ThemeConfig {
  return {
    name,
    annotationColors: { primary: '#6b7280', secondary: '#9ca3af', text: '#374151' },
    bgClass: 'bg-white',
    mermaidConfig: {
      theme: 'base',
      themeVariables: {
        background: '#ffffff',
        primaryColor: '#ffffff',
        primaryTextColor: '#111827',
        primaryBorderColor: '#d1d5db',
        lineColor: '#6b7280',
        secondaryColor: '#f3f4f6',
        tertiaryColor: '#e5e7eb',
        fontFamily: 'Inter, sans-serif',
        fontSize: '14px',
      },
      themeCSS: '',
    },
  };
}

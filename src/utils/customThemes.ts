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

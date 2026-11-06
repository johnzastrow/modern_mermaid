import mermaid from 'mermaid';

// Hidden test switch for the Mermaid major version.
// `?mermaid=12` selects 12.x and remembers it in this browser; `?mermaid=11`
// (or `?mermaid=default`) returns to the default. There is no visible control:
// the header version badge shows when a non-default version is active.
// 12.x is a separate chunk, downloaded only when selected.

export type Mermaid = typeof mermaid;
export type MermaidMajor = '11' | '12';

export const DEFAULT_MERMAID: MermaidMajor = '11';
export const MERMAID_VERSION_KEY = 'mm-mermaid-version';

export function resolveMermaidMajor(search: string, storage: Storage | null): MermaidMajor {
  const requested = new URLSearchParams(search).get('mermaid');
  try {
    if (requested === '12') {
      storage?.setItem(MERMAID_VERSION_KEY, '12');
      return '12';
    }
    if (requested === '11' || requested === 'default') {
      storage?.removeItem(MERMAID_VERSION_KEY);
      return DEFAULT_MERMAID;
    }
    return storage?.getItem(MERMAID_VERSION_KEY) === '12' ? '12' : DEFAULT_MERMAID;
  } catch {
    // Storage can be unavailable (private mode, blocked site data).
    return requested === '12' ? '12' : DEFAULT_MERMAID;
  }
}

function browserStorage(): Storage | null {
  try {
    return typeof window === 'undefined' ? null : window.localStorage;
  } catch {
    return null;
  }
}

// Decided once per page load, so every render in a session uses one version.
export const ACTIVE_MERMAID: MermaidMajor =
  typeof window === 'undefined' ? DEFAULT_MERMAID : resolveMermaidMajor(window.location.search, browserStorage());

let loaded: Promise<Mermaid> | null = null;

export function loadMermaid(): Promise<Mermaid> {
  loaded ??=
    ACTIVE_MERMAID === '12'
      ? // The 12.x API used here (initialize, render) matches 11.x.
        import('mermaid12').then((m) => m.default as unknown as Mermaid)
      : Promise.resolve(mermaid);
  return loaded;
}

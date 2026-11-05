import type { ThemeConfig } from './themes';
import { parseLibraryFile } from './themeLibrary';

/** User-saved themes, keyed by their (unique) name, persisted in localStorage. */
export type SavedThemes = Record<string, ThemeConfig>;

const STORAGE_KEY = 'mm-custom-themes';

export function loadSavedThemes(): SavedThemes {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    // Older versions merged unsanitized server data into this key, so treat it
    // as untrusted too and run it through the library import sanitizer.
    return parseLibraryFile(raw)?.themes ?? {};
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
  queueServerPush(themes);
}

/**
 * Optional server-side theme store (see server/themes-server.mjs). Same-origin
 * `/api/themes`, which the frontend nginx proxies to the backend. Every call is
 * best-effort and degrades fully: if the endpoint is absent or down, the app
 * keeps working from localStorage alone.
 *
 * Reads are public. Writes are accepted only when the server allows them (a
 * LAN instance in anonymous mode, or a request carrying the owner's write
 * token), so the client asks `/api/themes/status` first and stays read-only
 * otherwise. Public visitors therefore never send a write.
 */
const SERVER_ENDPOINT = '/api/themes';
const STATUS_ENDPOINT = '/api/themes/status';
const TOKEN_KEY = 'mm-theme-write-token';

/** The owner's write token for this instance, if one was entered on this browser. */
export function loadWriteToken(): string {
  try {
    return localStorage.getItem(TOKEN_KEY) || '';
  } catch {
    return '';
  }
}

/** Store (or, with an empty string, forget) the write token and re-check write access. */
export function saveWriteToken(token: string): void {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  } catch {
    // Storage unavailable: writes simply stay disabled.
  }
  writableCheck = null;
}

function authHeaders(): Record<string, string> {
  const token = loadWriteToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

let writableCheck: Promise<boolean> | null = null;

/** Whether the server will accept this browser's writes. Cached until the token changes. */
export function serverWritable(): Promise<boolean> {
  if (!writableCheck) {
    writableCheck = fetch(STATUS_ENDPOINT, { headers: { Accept: 'application/json', ...authHeaders() } })
      .then(async (res) => {
        if (!res.ok) return false;
        const data: unknown = await res.json();
        return !!data && typeof data === 'object' && (data as { writable?: unknown }).writable === true;
      })
      .catch(() => false);
  }
  return writableCheck;
}

/**
 * Version of the server library this browser last saw (its ETag). Null until a
 * fetch succeeds in this session: until then the browser has not seen the
 * server copy, so pushing its local library could wipe the shared one.
 */
let serverEtag: string | null = null;

/** Outcome of a push, for UI feedback. */
export type ServerSyncResult = 'saved' | 'skipped' | 'conflict' | 'failed';
let syncListener: ((result: ServerSyncResult) => void) | null = null;

/** Register a callback for push outcomes (one listener; pass null to remove). */
export function setServerSyncListener(fn: ((result: ServerSyncResult) => void) | null): void {
  syncListener = fn;
}

/** Test hook: forget the session's sync state. */
export function resetServerSync(): void {
  serverEtag = null;
  writableCheck = null;
  if (pushTimer) clearTimeout(pushTimer);
  pushTimer = null;
  pendingPush = null;
}

/**
 * Fetch the shared library from the server. Returns null if unavailable.
 * The server copy is untrusted input (anyone allowed to write could have put
 * anything there), so it goes through the same allowlist-and-sanitize path as
 * an imported library file before it reaches the renderer.
 */
export async function fetchServerThemes(): Promise<SavedThemes | null> {
  try {
    const res = await fetch(SERVER_ENDPOINT, { headers: { Accept: 'application/json' } });
    if (!res.ok) return null;
    const text = await res.text();
    serverEtag = res.headers.get('ETag');
    if (text.trim() === '{}') return {};
    return parseLibraryFile(text)?.themes ?? {};
  } catch {
    return null; // backend not present / offline — caller falls back to localStorage
  }
}

/**
 * Push the full library to the server now, if this browser may write and has
 * seen the current server version. Never throws.
 *
 * The write carries If-Match with the last-seen version, so it is refused (412)
 * when another browser saved in between; this browser then stops pushing until
 * it reloads and merges the newer copy, instead of overwriting it.
 */
export async function pushServerThemes(themes: SavedThemes): Promise<ServerSyncResult> {
  try {
    if (serverEtag === null || !(await serverWritable())) return 'skipped';
    const res = await fetch(SERVER_ENDPOINT, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'If-Match': serverEtag, ...authHeaders() },
      body: JSON.stringify(themes),
    });
    if (res.ok) {
      serverEtag = res.headers.get('ETag') ?? serverEtag;
      return 'saved';
    }
    if (res.status === 412) {
      serverEtag = null;
      return 'conflict';
    }
    return 'failed';
  } catch {
    return 'failed';
  }
}

/** How long to wait for further edits before pushing (coalesces rapid saves). */
export const PUSH_DELAY_MS = 800;
let pushTimer: ReturnType<typeof setTimeout> | null = null;
let pendingPush: SavedThemes | null = null;

/** Schedule a push of the latest library; rapid successive saves become one write. */
export function queueServerPush(themes: SavedThemes): void {
  pendingPush = themes;
  if (pushTimer) clearTimeout(pushTimer);
  pushTimer = setTimeout(() => {
    pushTimer = null;
    const toPush = pendingPush;
    pendingPush = null;
    if (!toPush) return;
    void pushServerThemes(toPush).then((result) => {
      if (result !== 'skipped') syncListener?.(result);
    });
  }, PUSH_DELAY_MS);
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

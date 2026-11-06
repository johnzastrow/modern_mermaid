// The hand-drawn theme uses Excalifont (Latin) and Xiaolai (Chinese). Their
// @font-face rules are large (about 40 KB gzipped), so they load on first use
// rather than with the app.
const HAND_DRAWN = /Excalifont|Xiaolai/;
const FONT_WAIT_MS = 3000;

let loaded: Promise<void> | null = null;

export function usesHandDrawnFonts(config: unknown): boolean {
  return HAND_DRAWN.test(JSON.stringify(config ?? ''));
}

/** Loads the hand-drawn @font-face rules and waits (briefly) for the Latin
 *  face, so Mermaid measures label widths with the real font. */
export function ensureHandDrawnFonts(): Promise<void> {
  loaded ??= import('../fonts-handdrawn.css').then(() =>
    Promise.race([
      document.fonts?.load('16px Excalifont').then(() => undefined) ?? Promise.resolve(),
      new Promise<void>((resolve) => setTimeout(resolve, FONT_WAIT_MS)),
    ]).catch(() => undefined),
  );
  return loaded;
}

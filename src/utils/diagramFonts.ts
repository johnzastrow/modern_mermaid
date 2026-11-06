// Mermaid sizes every node box by measuring its label in the browser. If the
// theme's web font (Inter, Nunito, ...) has not finished loading at that point,
// the boxes are sized for the fallback font and the real, usually wider, glyphs
// get clipped ("Login Succes"). Fonts declared with @font-face load lazily, on
// first use, so the first render of a theme is the one that races.
const FONT_WAIT_MS = 3000;
const WEIGHTS = ['400', '700'];
// Generic families and system aliases never need a download.
const SYSTEM = /^(serif|sans-serif|monospace|cursive|fantasy|system-ui|ui-[a-z-]+|inherit|initial|-apple-system|BlinkMacSystemFont)$/i;

const pending = new Map<string, Promise<void>>();

/** Every family named by a `fontFamily` value or a `font-family` rule in themeCSS. */
export function configFontFamilies(config: unknown): string[] {
  const lists: string[] = [];
  const walk = (node: unknown, key = ''): void => {
    if (typeof node === 'string') {
      if (key === 'fontFamily') lists.push(node);
      else if (key === 'themeCSS') for (const m of node.matchAll(/font-family\s*:\s*([^;}]+)/gi)) lists.push(m[1]);
    } else if (node && typeof node === 'object') {
      for (const [k, v] of Object.entries(node)) walk(v, k);
    }
  };
  walk(config);
  const families = lists
    .flatMap((list) => list.split(','))
    .map((f) => f.replace(/!important/i, '').trim().replace(/^["']|["']$/g, '').trim())
    .filter((f) => f && !SYSTEM.test(f));
  return [...new Set(families)];
}

/**
 * Wait (briefly) until the regular and bold faces of every web font the config
 * names have loaded, so Mermaid measures labels with the glyphs it will draw.
 * Families the page does not declare are skipped: they are system fonts or
 * absent, and waiting would not change the measurement.
 */
export function ensureDiagramFonts(config: unknown): Promise<void> {
  const fonts = typeof document !== 'undefined' ? document.fonts : undefined;
  if (!fonts?.load) return Promise.resolve();
  const declared = new Set<string>();
  fonts.forEach((face) => declared.add(face.family.replace(/^["']|["']$/g, '')));

  const waits = configFontFamilies(config)
    .filter((family) => declared.has(family))
    .map((family) => {
      let p = pending.get(family);
      if (!p) {
        p = Promise.all(WEIGHTS.map((w) => fonts.load(`${w} 16px "${family}"`)))
          .then(() => undefined)
          .catch(() => undefined);
        pending.set(family, p);
      }
      return p;
    });
  if (waits.length === 0) return Promise.resolve();
  return Promise.race([
    Promise.all(waits).then(() => undefined),
    new Promise<void>((resolve) => setTimeout(resolve, FONT_WAIT_MS)),
  ]);
}

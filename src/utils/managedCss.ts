/**
 * Managed `themeCSS` blocks.
 *
 * Some theme-editor controls (corner radius, connector width, arrow size) are
 * sliders whose effect can only be expressed as CSS — Mermaid has no
 * `themeVariable` for them. Each control owns a marker-delimited region of
 * `themeCSS` so it can be rewritten idempotently, over and over as the slider
 * moves, without disturbing CSS the user wrote by hand in the advanced editor.
 *
 * Everything here is plain string surgery on `themeCSS`, which means these
 * settings travel through the existing export/import round-trip for free —
 * with the caveat that `themeCSS` only survives the YAML frontmatter export,
 * never the inline `%%{init}%%` form. See `configExport.ts`.
 */

const start = (name: string) => `/* mm:${name}:start */`;
const end = (name: string) => `/* mm:${name}:end */`;

/** Remove a control's block, leaving the surrounding user CSS intact. */
export function stripManagedBlock(css: string, name: string): string {
  const s = css.indexOf(start(name));
  if (s === -1) return css;
  const e = css.indexOf(end(name), s);
  if (e === -1) return css;
  return (css.slice(0, s) + css.slice(e + end(name).length)).replace(/\n{3,}/g, '\n\n').trim();
}

/** The text of a control's block, or null when the control is unset. */
export function readManagedBlock(css: string, name: string): string | null {
  const s = css.indexOf(start(name));
  if (s === -1) return null;
  const e = css.indexOf(end(name), s);
  if (e === -1) return null;
  return css.slice(s, e + end(name).length);
}

/** Replace (or with a null rule, remove) a control's block. */
export function writeManagedBlock(css: string, name: string, rule: string | null): string {
  const base = stripManagedBlock(css, name);
  if (!rule) return base;
  const block = `${start(name)}\n${rule}\n${end(name)}`;
  return base ? `${base}\n\n${block}` : block;
}

/** Pull the first number matching `pattern` out of a control's block. */
function readNumber(css: string, name: string, pattern: RegExp, fallback: number): number {
  const block = readManagedBlock(css, name);
  if (!block) return fallback;
  const m = block.match(pattern);
  return m ? Number(m[1]) : fallback;
}

// --- corner radius --------------------------------------------------------

export function readRadius(css: string): number {
  return Math.round(readNumber(css, 'radius', /rx:\s*([\d.]+)px/, 0));
}

export function writeRadius(css: string, px: number): string {
  return writeManagedBlock(
    css,
    'radius',
    px ? `.node rect, .node polygon, .cluster rect { rx: ${px}px !important; ry: ${px}px !important; }` : null,
  );
}

// --- connector line width -------------------------------------------------

/**
 * Every diagram type names its connectors differently, and the class list here
 * was read off real rendered output rather than documentation:
 * flowchart uses `.flowchart-link`, sequence `.messageLine0/1`, class
 * `.relation`, state `.transition`, ER `.relationshipLine`, and most non-flow
 * renderers additionally tag edges `.edge-thickness-normal`.
 *
 * The sequence lifeline (`.actor-line`) is deliberately excluded — it is not a
 * connector, and thickening it looks like a rendering bug.
 */
const EDGE_SELECTORS = [
  '.flowchart-link',
  '.messageLine0',
  '.messageLine1',
  '.relation',
  '.transition',
  '.relationshipLine',
  '.edge-thickness-normal',
  '.edgePath .path',
].join(', ');

/** 0 means "unset" — leave Mermaid's own stroke widths alone. */
export function readLineWidth(css: string): number {
  return readNumber(css, 'linewidth', /stroke-width:\s*([\d.]+)px/, 0);
}

export function writeLineWidth(css: string, px: number): string {
  return writeManagedBlock(
    css,
    'linewidth',
    px ? `${EDGE_SELECTORS} { stroke-width: ${px}px !important; }` : null,
  );
}

// --- arrow head size ------------------------------------------------------

/**
 * Arrow heads are SVG `<marker>` elements sized by `markerWidth`/`markerHeight`
 * *attributes*, which CSS cannot set. Scaling the marker's path is the only
 * route available to a stylesheet — and `overflow: visible` is mandatory, not
 * decoration: a `<marker>` clips to its viewport by default, so scaling the
 * path without it shrinks the head into a clipped blob instead of enlarging it.
 * Both halves were verified against rendered output in Chrome.
 */
export function readArrowScale(css: string): number {
  return readNumber(css, 'arrow', /scale\(([\d.]+)\)/, 1);
}

export function writeArrowScale(css: string, scale: number): string {
  const rule =
    scale && scale !== 1
      ? `marker { overflow: visible; }\nmarker path { transform: scale(${scale}); transform-box: fill-box; transform-origin: center; }`
      : null;
  return writeManagedBlock(css, 'arrow', rule);
}

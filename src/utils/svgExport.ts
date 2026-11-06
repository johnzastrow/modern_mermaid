/**
 * Standalone SVG export.
 *
 * The PNG/JPG path rasterizes the whole preview node with `html-to-image`.
 * This one is deliberately different: it serializes the *actual* `<svg>`
 * Mermaid rendered, so the result is true vector — scalable, a fraction of the
 * size, and diffable in git, which is what a documentation repo wants.
 *
 * Two consequences follow from taking the SVG rather than a screenshot, and
 * both are surfaced in the UI rather than hidden:
 *
 * - **Annotations are not included.** They are an HTML overlay drawn on top of
 *   the preview, not part of the diagram's SVG. Use PNG/JPG to capture those.
 * - **Fonts are referenced, not embedded.** A custom font renders correctly
 *   wherever that font is installed (or on the web page that loads it), and
 *   falls back elsewhere. Embedding would mean inlining the whole font file.
 *
 * Mermaid emits its theme styling as a `<style>` element *inside* the SVG, so
 * colors, `themeCSS`, line widths and arrow scaling all travel with the file
 * without any extra work here.
 */

export interface SvgExportOptions {
  /** Solid background to paint behind the diagram. Omit for transparency. */
  background?: string;
  /**
   * Output for Inkscape and other SVG editors, which ignore HTML labels inside
   * `foreignObject` and do not resolve `currentColor` without a `color`. See
   * `makeEditorSafe`. The source must be attached to the document: labels and
   * sizes are measured from the live element.
   */
  editorSafe?: boolean;
}

const SVG_NS = 'http://www.w3.org/2000/svg';

/**
 * Mermaid config that asks for SVG `<text>` labels instead of HTML labels in
 * `foreignObject`. Mermaid 11 reads the top-level key; flowcharts still also
 * read their own.
 */
export function withPlainLabels<T extends object>(config: T): T & { htmlLabels: false; flowchart: Record<string, unknown> } {
  const flowchart = (config as { flowchart?: Record<string, unknown> }).flowchart ?? {};
  return { ...config, htmlLabels: false, flowchart: { ...flowchart, htmlLabels: false } };
}

/** Width/height of an SVG, preferring the viewBox over possibly-stale attributes. */
function intrinsicSize(svg: SVGSVGElement): { width: number; height: number } | null {
  const viewBox = svg.getAttribute('viewBox');
  if (viewBox) {
    const parts = viewBox.split(/[\s,]+/).map(Number);
    if (parts.length === 4 && parts.every((n) => Number.isFinite(n)) && parts[2] > 0 && parts[3] > 0) {
      return { width: parts[2], height: parts[3] };
    }
  }
  const w = parseFloat(svg.getAttribute('width') || '');
  const h = parseFloat(svg.getAttribute('height') || '');
  if (Number.isFinite(w) && Number.isFinite(h) && w > 0 && h > 0) return { width: w, height: h };
  return null;
}

/**
 * Turn a rendered Mermaid `<svg>` into a self-contained SVG document string.
 * The source element is never mutated.
 */
export function buildStandaloneSvg(source: SVGSVGElement, options: SvgExportOptions = {}): string {
  const svg = source.cloneNode(true) as SVGSVGElement;

  // A file opened outside a browser page needs its namespaces declared.
  svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  if (!svg.getAttribute('xmlns:xlink')) {
    svg.setAttribute('xmlns:xlink', 'http://www.w3.org/1999/xlink');
  }

  // Mermaid constrains the on-screen SVG with `max-width` so it fits the
  // preview pane. In a standalone file that just shrinks the diagram, so drop
  // it and pin the intrinsic size instead.
  svg.style.removeProperty('max-width');
  if (!svg.getAttribute('style')?.trim()) svg.removeAttribute('style');

  let size = intrinsicSize(svg);
  // Some diagrams (info) carry no size at all. A browser then shows a default
  // 300x150 canvas and editors guess, so measure the drawing and pin a viewBox.
  if (!size) {
    const box = measuredBox(source);
    if (box) {
      svg.setAttribute('viewBox', `${box.x} ${box.y} ${box.width} ${box.height}`);
      size = { width: box.width, height: box.height };
    }
  }
  if (size) {
    svg.setAttribute('width', String(size.width));
    svg.setAttribute('height', String(size.height));
    if (!svg.getAttribute('viewBox')) {
      svg.setAttribute('viewBox', `0 0 ${size.width} ${size.height}`);
    }
  }

  if (options.editorSafe) makeEditorSafe(source, svg);

  // Background goes in as the first child so it paints behind everything.
  // Percentage sizing keeps it correct whatever the viewBox turns out to be.
  if (options.background) {
    const rect = svg.ownerDocument.createElementNS('http://www.w3.org/2000/svg', 'rect');
    rect.setAttribute('x', '0');
    rect.setAttribute('y', '0');
    rect.setAttribute('width', '100%');
    rect.setAttribute('height', '100%');
    rect.setAttribute('fill', options.background);
    svg.insertBefore(rect, svg.firstChild);
  }

  const markup = new XMLSerializer().serializeToString(svg);
  return `<?xml version="1.0" encoding="UTF-8"?>\n${markup}\n`;
}

/** The live drawing's bounding box, padded; null when it cannot be measured. */
function measuredBox(svg: SVGSVGElement): { x: number; y: number; width: number; height: number } | null {
  try {
    const b = svg.getBBox();
    if (!(b.width > 0 && b.height > 0)) return null;
    const pad = 8;
    return { x: b.x - pad, y: b.y - pad, width: Math.ceil(b.width + 2 * pad), height: Math.ceil(b.height + 2 * pad) };
  } catch {
    return null;
  }
}

/**
 * Rewrite the parts of a Mermaid SVG that SVG editors drop. `live` is the
 * rendered element (measured), `clone` the copy being exported (modified).
 *
 * - `currentColor` becomes the computed text color. Without a `color`
 *   property Inkscape draws nothing (gantt grid lines).
 * - CSS `filter: drop-shadow(...)` (ignored by Inkscape) becomes an
 *   equivalent SVG 1.1 filter referenced from the element.
 * - Spaces at the edge of a text run become non-breaking spaces.
 * - Each `foreignObject` label becomes a centred `<text>` with the same lines,
 *   size, weight, family and color. Mermaid is asked for SVG labels first (see
 *   `withPlainLabels`); this covers the labels it still emits as HTML.
 */
export function makeEditorSafe(live: SVGSVGElement, clone: SVGSVGElement): void {
  // First, while live and clone still match element for element.
  convertCssShadows(live, clone);

  const color = getComputedStyle(live).color || '#000000';
  for (const attr of ['fill', 'stroke', 'stop-color', 'flood-color']) {
    clone.querySelectorAll(`[${attr}="currentColor"]`).forEach((el) => el.setAttribute(attr, color));
  }

  // Mermaid splits labels into tspans such as "+int" and " userId". Editors
  // collapse whitespace at a tspan's edge (Chromium keeps it), so the words
  // run together. A non-breaking space survives everywhere.
  clone.querySelectorAll('text, tspan').forEach((el) => {
    el.childNodes.forEach((node) => {
      if (node.nodeType === 3 && node.textContent?.trim()) {
        node.textContent = node.textContent.replace(/^ +| +$/g, (m) => '\u00a0'.repeat(m.length));
      }
    });
  });

  const liveLabels = live.querySelectorAll('foreignObject');
  clone.querySelectorAll('foreignObject').forEach((fo, i) => {
    const text = liveLabels[i] ? labelAsText(liveLabels[i], clone.ownerDocument) : null;
    if (text) fo.replaceWith(text);
    else fo.remove();
  });
}

/**
 * Parse the first shadow of a computed `filter` value such as
 * "drop-shadow(rgba(0, 0, 0, 0.2) 1px 2px 2px)". Null when there is none.
 */
export function parseDropShadow(filter: string): { color: string; dx: number; dy: number; blur: number } | null {
  const m = filter.match(/drop-shadow\(\s*((?:rgba?|hsla?)\([^)]*\)|#[0-9a-f]{3,8}|[a-z]+)?\s*(-?[\d.]+)px\s+(-?[\d.]+)px(?:\s+([\d.]+)px)?\s*((?:rgba?|hsla?)\([^)]*\)|#[0-9a-f]{3,8}|[a-z]+)?\s*\)/i);
  if (!m) return null;
  return { color: m[1] ?? m[5] ?? 'rgba(0, 0, 0, 0.3)', dx: Number(m[2]), dy: Number(m[3]), blur: Number(m[4] ?? 0) };
}

/** Give every element with a CSS drop-shadow an equivalent SVG filter. */
function convertCssShadows(live: SVGSVGElement, clone: SVGSVGElement): void {
  const liveEls = live.querySelectorAll('*');
  const cloneEls = clone.querySelectorAll('*');
  if (liveEls.length !== cloneEls.length) return;
  const doc = clone.ownerDocument;
  const ids = new Map<string, string>();
  let defs: Element | null = null;

  liveEls.forEach((el, i) => {
    const shadow = parseDropShadow(getComputedStyle(el).filter || '');
    if (!shadow) return;
    const key = JSON.stringify(shadow);
    let id = ids.get(key);
    if (!id) {
      id = `${clone.id || 'svg'}-editor-shadow-${ids.size}`;
      ids.set(key, id);
      defs ??= clone.insertBefore(doc.createElementNS(SVG_NS, 'defs'), clone.firstChild);
      defs.appendChild(shadowFilter(doc, id, shadow));
    }
    const target = cloneEls[i] as SVGElement;
    target.setAttribute('filter', `url(#${id})`);
    // Inline style outranks the stylesheet's drop-shadow, which editors drop.
    target.style.setProperty('filter', `url(#${id})`);
  });
}

/** SVG 1.1 drop shadow: blurred alpha, offset, tinted, under the source. */
function shadowFilter(doc: Document, id: string, s: { color: string; dx: number; dy: number; blur: number }): Element {
  const make = (tag: string, attrs: Record<string, string | number>) => {
    const el = doc.createElementNS(SVG_NS, tag);
    for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, String(v));
    return el;
  };
  const filter = make('filter', { id, x: '-20%', y: '-20%', width: '140%', height: '140%', 'color-interpolation-filters': 'sRGB' });
  // CSS blur radius is twice the Gaussian standard deviation.
  filter.appendChild(make('feGaussianBlur', { in: 'SourceAlpha', stdDeviation: s.blur / 2 }));
  filter.appendChild(make('feOffset', { dx: s.dx, dy: s.dy, result: 'offset' }));
  filter.appendChild(make('feFlood', { 'flood-color': s.color }));
  filter.appendChild(make('feComposite', { in2: 'offset', operator: 'in', result: 'shadow' }));
  const merge = make('feMerge', {});
  merge.appendChild(make('feMergeNode', { in: 'shadow' }));
  merge.appendChild(make('feMergeNode', { in: 'SourceGraphic' }));
  filter.appendChild(merge);
  return filter;
}

/** A `foreignObject` label rebuilt as SVG text; null when it shows no text. */
function labelAsText(fo: SVGForeignObjectElement, doc: Document): SVGTextElement | null {
  const html = fo.querySelector<HTMLElement>('div, span, p');
  // innerText keeps the visual line breaks (<br>, block children); jsdom lacks it.
  const raw = html?.innerText ?? fo.textContent ?? '';
  const lines = raw.split('\n').map((l) => l.trim()).filter(Boolean);
  if (lines.length === 0) return null;

  const styled = (html?.querySelector<HTMLElement>('p, span') ?? html ?? fo) as Element;
  const cs = getComputedStyle(styled);
  const fontSize = parseFloat(cs.fontSize) || 16;
  const lineHeight = parseFloat(cs.lineHeight) || fontSize * 1.2;
  const num = (name: string) => parseFloat(fo.getAttribute(name) || '0') || 0;
  const cx = num('x') + num('width') / 2;
  // Centre the block vertically; 0.35em puts a baseline roughly mid-glyph,
  // without relying on dominant-baseline, which editors support unevenly.
  const firstBaseline = num('y') + num('height') / 2 - ((lines.length - 1) * lineHeight) / 2 + fontSize * 0.35;

  const text = doc.createElementNS(SVG_NS, 'text');
  text.setAttribute('x', String(cx));
  text.setAttribute('y', String(firstBaseline));
  text.setAttribute('text-anchor', 'middle');
  text.setAttribute('font-size', `${fontSize}px`);
  if (cs.fontFamily) text.setAttribute('font-family', cs.fontFamily);
  if (cs.fontWeight) text.setAttribute('font-weight', cs.fontWeight);
  if (cs.color) text.setAttribute('fill', cs.color);
  const transform = fo.getAttribute('transform');
  if (transform) text.setAttribute('transform', transform);
  lines.forEach((line, i) => {
    const tspan = doc.createElementNS(SVG_NS, 'tspan');
    tspan.setAttribute('x', String(cx));
    if (i > 0) tspan.setAttribute('dy', String(lineHeight));
    tspan.textContent = line;
    text.appendChild(tspan);
  });
  return text;
}

/** Filename stem shared with the raster exports. */
export function svgFilename(now: number = Date.now()): string {
  return `mermaid-diagram-${now}.svg`;
}

/** Trigger a download of `content` as an SVG file. */
export function downloadSvg(content: string, filename: string = svgFilename()): void {
  // A Blob URL avoids the length ceiling a data: URL would hit on big diagrams.
  const blob = new Blob([content], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  try {
    const link = document.createElement('a');
    link.download = filename;
    link.href = url;
    link.click();
  } finally {
    // Give the click a tick to start before revoking.
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
}

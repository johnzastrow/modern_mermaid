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

  const size = intrinsicSize(svg);
  if (size) {
    svg.setAttribute('width', String(size.width));
    svg.setAttribute('height', String(size.height));
    if (!svg.getAttribute('viewBox')) {
      svg.setAttribute('viewBox', `0 0 ${size.width} ${size.height}`);
    }
  }

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

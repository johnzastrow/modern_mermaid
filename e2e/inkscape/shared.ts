import { accessSync, constants } from 'node:fs';
import { delimiter, isAbsolute, join, resolve } from 'node:path';

/** Where SVGs, renders, per-diagram JSON and the summary report are written. */
/** One directory per theme and Mermaid major, so runs never mix in a report. */
export const REPORT_DIR = resolve(
  process.cwd(),
  'inkscape-report',
  `${process.env.INKSCAPE_THEME ?? 'linearLight'}-mermaid-${process.env.INKSCAPE_MERMAID === '12' ? '12' : '11'}`,
);

/** Both renderers rasterize at this width (px). */
export const RENDER_WIDTH = 1200;

export const INKSCAPE = process.env.INKSCAPE ?? 'inkscape';
export const MAGICK = process.env.MAGICK ?? 'magick';

export interface FidelityResult {
  category: string;
  id: string;
  theme: string;
  /** Mermaid major the diagram was rendered with. */
  mermaid: '11' | '12';
  /** Which export produced the file: the standard SVG or the editor-safe one. */
  variant: 'standard' | 'editor';
  /** Structural similarity of Inkscape's render to Chromium's; 1 is identical. */
  ssim: number;
  /** Inkscape's drawn-pixel fraction over Chromium's; well below 1 means missing content. */
  coverageRatio: number;
  /** Same ratio for dark pixels only (mostly text and strokes); catches lost labels. */
  darkRatio: number;
  /** foreignObject elements with text: HTML labels Inkscape does not render. */
  htmlLabels: number;
  /** Count of each Inkscape-risky feature found in the exported SVG. */
  features: Record<string, number>;
  /** Inkscape stderr lines, minus desktop-session noise. */
  warnings: string[];
}

/**
 * Verdict bands. SSIM alone is a weak signal here: diagrams are mostly white
 * space, so missing labels barely move it. The dark-pixel ratio and the
 * HTML-label count carry the verdict.
 */
export function verdict(r: FidelityResult): 'good' | 'degraded' | 'poor' {
  if (r.htmlLabels > 0 && r.darkRatio < 0.8) return 'poor';
  if (r.darkRatio < 0.5 || r.coverageRatio < 0.7 || r.ssim < 0.85) return 'poor';
  // Any lost HTML label is visible damage, even when other text outweighs it.
  if (r.htmlLabels > 0) return 'degraded';
  // Far more ink than the reference means distortion (for example stretched text).
  if (r.coverageRatio > 1.5 || r.darkRatio > 1.5) return 'degraded';
  if (r.ssim >= 0.95 && r.coverageRatio >= 0.9 && r.darkRatio >= 0.85) return 'good';
  return 'degraded';
}

/**
 * True when both external tools are on PATH; the suite skips itself otherwise.
 * A PATH lookup rather than running them: launching Inkscape in every worker
 * at once is slow enough to fail spuriously.
 */
export function toolsAvailable(): boolean {
  const onPath = (bin: string) =>
    isAbsolute(bin)
      ? canExec(bin)
      : (process.env.PATH ?? '').split(delimiter).some((dir) => dir && canExec(join(dir, bin)));
  return onPath(INKSCAPE) && onPath(MAGICK);
}

function canExec(file: string): boolean {
  try {
    accessSync(file, constants.X_OK);
    return true;
  } catch {
    return false;
  }
}

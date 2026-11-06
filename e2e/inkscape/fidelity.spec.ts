import { test, expect, type Page } from '@playwright/test';
import { execFile } from 'node:child_process';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { promisify } from 'node:util';
import { examples, type ExampleCategory } from '../../src/utils/examples';
import { anyDiagram, downloadText, openMenu } from '../helpers';
import { INKSCAPE, MAGICK, REPORT_DIR, RENDER_WIDTH, toolsAvailable, type FidelityResult } from './shared';

/**
 * SVG export fidelity in Inkscape.
 *
 * For every bundled example: export the SVG through the app's own Export menu,
 * render it with Chromium (the reference: it is what the user saw) and with
 * Inkscape at the same width, then score how closely Inkscape's raster matches.
 * Both renderers see the same fonts (see playwright.inkscape.config.ts), so the
 * score measures SVG/CSS support rather than font substitution.
 *
 * This is a measurement, not a pass/fail gate on fidelity: a test fails only
 * when Inkscape cannot open the file or renders nothing. Scores and the reasons
 * behind them go to inkscape-report/ (summarised by the global teardown).
 */

const run = promisify(execFile);

/** Exported-SVG features that Inkscape 1.x ignores or supports only partly. */
const FEATURE_PROBES: Record<string, RegExp> = {
  // Mermaid's HTML labels. Inkscape does not render foreignObject content.
  foreignObject: /<foreignObject\b/g,
  cssVariables: /var\(--/g,
  cssFilter: /filter\s*:\s*(drop-shadow|blur)\(/g,
  modernColor: /\b(color-mix|oklch|oklab|lab|lch)\(/g,
  blendOrBackdrop: /\b(mix-blend-mode|backdrop-filter)\s*:/g,
  notSelector: /:not\(/g,
  fontFace: /@font-face/g,
  transformBox: /transform-box\s*:/g,
  // Chromium resolves an unset `color` to black; Inkscape draws nothing (gantt grid lines).
  currentColor: /="currentColor"/g,
};

const theme = process.env.INKSCAPE_THEME ?? 'linearLight';

const cases = (Object.entries(examples) as [ExampleCategory, (typeof examples)[ExampleCategory]][])
  .flatMap(([category, list]) => list.map((ex) => ({ category, id: ex.id })));

test.describe.configure({ mode: 'parallel' });
test.skip(!toolsAvailable(), 'needs inkscape and ImageMagick 7 (magick) on PATH');

test.beforeAll(async () => {
  await mkdir(REPORT_DIR, { recursive: true });
});

async function exportSvg(page: Page, id: string): Promise<string> {
  await page.goto(`/?example=${encodeURIComponent(id)}&theme=${theme}&lang=en`);
  await expect(anyDiagram(page)).toBeVisible();
  // Let lazy diagram chunks and fonts settle before exporting.
  await page.waitForTimeout(1200);
  await openMenu(page, /^Export$/);
  const { text } = await downloadText(page, async () => {
    await page.getByText('SVG (vector)', { exact: true }).click();
  });
  return text;
}

/**
 * Fraction of pixels darker than `threshold` (percent of white). At 96% this is
 * everything drawn, fills included; at 50% it is mostly text and strokes, which
 * is what reveals missing labels on top of light node fills.
 */
async function coverage(png: string, threshold: number): Promise<number> {
  const { stdout } = await run(MAGICK, [png, '-colorspace', 'gray', '-threshold', `${threshold}%`, '-format', '%[fx:1-mean]', 'info:']);
  return Number(stdout.trim());
}

/** foreignObject elements that carry visible text: labels Inkscape will not draw. */
function htmlLabelCount(page: Page, svg: string): Promise<number> {
  // Parse with the browser rather than regexes: exact, and entity-aware.
  return page.evaluate((markup) => {
    const doc = new DOMParser().parseFromString(markup, 'image/svg+xml');
    return [...doc.getElementsByTagName('foreignObject')].filter((fo) => fo.textContent?.trim()).length;
  }, svg);
}

for (const { category, id } of cases) {
  test(`${category}: ${id}`, async ({ page }) => {
    const base = join(REPORT_DIR, id);
    const svg = await exportSvg(page, id);
    await writeFile(`${base}.svg`, svg);

    const features = Object.fromEntries(
      Object.entries(FEATURE_PROBES).map(([k, re]) => [k, (svg.match(re) ?? []).length]),
    );
    // Without a viewBox or size on the root, Inkscape guesses the geometry (info diagram).
    const root = svg.match(/<svg\b[^>]*>/)?.[0] ?? '';
    features.noViewBox = /\bviewBox=/.test(root) || /\bwidth="\d/.test(root) ? 0 : 1;

    // Reference: Chromium rendering the exported file on its own, as an image,
    // so nothing from the app (stylesheets, scripts) can help it.
    const ref = await page.context().newPage();
    await ref.setViewportSize({ width: RENDER_WIDTH, height: 800 });
    const dataUri = `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
    await ref.setContent(
      `<html><body style="margin:0;background:#fff"><img id="d" src="${dataUri}" style="display:block;width:${RENDER_WIDTH}px"></body></html>`,
    );
    await ref.locator('#d').evaluate((img: HTMLImageElement) => img.decode());
    await ref.locator('#d').screenshot({ path: `${base}.chromium.png` });
    await ref.close();

    // Inkscape, headless, same width and background.
    const inkscapeLog = await run(
      INKSCAPE,
      [`${base}.svg`, '--export-type=png', `--export-filename=${base}.inkscape.png`,
        `--export-width=${RENDER_WIDTH}`, '--export-background=#ffffff', '--export-background-opacity=1'],
      { timeout: 60_000 },
    ).then(
      (r) => r.stderr,
      (err: { stderr?: string }) => String(err.stderr ?? err),
    );
    const warnings = inkscapeLog
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l && !/^\s*$/.test(l) && !/Gtk-|dbus|Fontconfig/i.test(l));

    // Inkscape must at least open and draw the file.
    const inkPng = await readFile(`${base}.inkscape.png`).catch(() => null);
    expect(inkPng, `Inkscape produced no PNG for ${id}:\n${inkscapeLog}`).not.toBeNull();

    // Compare at identical geometry. SSIM: 1 is identical.
    await run(MAGICK, [`${base}.inkscape.png`, '-resize', await geometry(`${base}.chromium.png`), `${base}.inkscape.sized.png`]);
    const ssim = await compareSsim(`${base}.chromium.png`, `${base}.inkscape.sized.png`);
    const refCov = await coverage(`${base}.chromium.png`, 96);
    const inkCov = await coverage(`${base}.inkscape.sized.png`, 96);
    const refDark = await coverage(`${base}.chromium.png`, 50);
    const inkDark = await coverage(`${base}.inkscape.sized.png`, 50);
    await run(MAGICK, [`${base}.chromium.png`, `${base}.inkscape.sized.png`, '-background', '#888', '-splice', '0x0', '+append', `${base}.side-by-side.png`]);

    const result: FidelityResult = {
      category, id, theme, ssim,
      coverageRatio: refCov > 0 ? inkCov / refCov : 1,
      darkRatio: refDark > 0 ? inkDark / refDark : 1,
      htmlLabels: await htmlLabelCount(page, svg),
      features, warnings: warnings.slice(0, 10),
    };
    await writeFile(`${base}.json`, JSON.stringify(result, null, 2));
    test.info().annotations.push({ type: 'ssim', description: ssim.toFixed(3) });

    expect(inkCov, `Inkscape rendered an empty image for ${id}`).toBeGreaterThan(0);
  });
}

async function geometry(png: string): Promise<string> {
  const { stdout } = await run(MAGICK, ['identify', '-format', '%wx%h!', png]);
  return stdout.trim();
}

/** Raw `compare -metric SSIM` value: the normalized number in parentheses. */
async function rawSsim(a: string, b: string): Promise<number> {
  // `compare` exits 1 when images differ and writes the metric to stderr.
  const out = await run(MAGICK, ['compare', '-metric', 'SSIM', a, b, 'null:']).then(
    (r) => r.stderr,
    (e: { stderr?: string }) => e.stderr ?? '',
  );
  const m = out.match(/\(([-\d.e]+)\)/) ?? out.match(/^\s*([-\d.e]+)/);
  return Number(m?.[1]);
}

/**
 * SSIM as similarity (1 = identical). ImageMagick 7.1.2 reports it as a
 * distortion (identical = 0) while older releases report similarity, so
 * calibrate once by comparing an image with itself.
 */
let distortionMode: boolean | undefined;
async function compareSsim(a: string, b: string): Promise<number> {
  distortionMode ??= (await rawSsim(a, a)) < 0.5;
  const v = await rawSsim(a, b);
  return distortionMode ? 1 - v : v;
}

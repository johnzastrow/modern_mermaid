import { test, expect } from '@playwright/test';
import { gotoApp, setCode, editor, anyDiagram, openMenu, downloadText, label } from './helpers';

test.beforeEach(async ({ page }) => gotoApp(page));

test.describe('rendering', () => {
  test('renders the starter diagram as real SVG', async ({ page }) => {
    const svg = anyDiagram(page);
    await expect(svg).toBeVisible();
    // Real layout, which is precisely what jsdom cannot provide: under jsdom
    // getBBox returns zeros and mermaid.render throws before producing this.
    const box = await svg.boundingBox();
    expect(box!.width).toBeGreaterThan(50);
    expect(box!.height).toBeGreaterThan(50);
  });

  test('re-renders when the source changes', async ({ page }) => {
    await setCode(page, 'flowchart LR\n  Alpha --> Beta');
    await expect(label(page, 'Alpha')).toBeAttached();
    await expect(label(page, 'Beta')).toBeAttached();

    await setCode(page, 'flowchart LR\n  Gamma --> Delta');
    await expect(label(page, 'Gamma')).toBeAttached();
    await expect(label(page, 'Alpha')).toHaveCount(0);
  });

  test.describe('diagram types beyond flowchart', () => {
    const cases: Array<[string, string, string]> = [
      ['sequence', 'sequenceDiagram\n  Alice->>Bob: Hello', 'Alice'],
      ['state', 'stateDiagram-v2\n  Idle --> Busy', 'Busy'],
      ['mindmap', 'mindmap\n  root((Core))\n    Leaf', 'Leaf'],
      ['timeline', 'timeline\n  title T\n  2024 : Launched', 'Launched'],
      ['journey', 'journey\n  title Day\n  section Go\n    Wake: 5: Me', 'Wake'],
    ];
    for (const [name, code, text] of cases) {
      test(`renders a ${name} diagram`, async ({ page }) => {
        await setCode(page, code);
        // The SVG root must be genuinely visible; the label only needs to be
        // present, since Mermaid transforms individual text nodes in ways that
        // defeat Playwright's visibility heuristic (journey task labels, say).
        await expect(anyDiagram(page)).toBeVisible();
        await expect(label(page, text)).toBeAttached();
      });
    }
  });

  test('surfaces a syntax error without breaking the app', async ({ page }) => {
    await setCode(page, 'flowchart TD\n  A -->');
    // Whatever the presentation, the editor must stay usable and the app alive.
    await expect(editor(page)).toBeEditable();

    await setCode(page, 'flowchart TD\n  A --> B');
    await expect(label(page, 'B')).toBeAttached();
  });

  test('recovers after an empty document', async ({ page }) => {
    await setCode(page, '');
    await expect(editor(page)).toBeEditable();
    await setCode(page, 'flowchart TD\n  Recovered');
    await expect(label(page, 'Recovered')).toBeAttached();
  });
});

test.describe('zoom controls', () => {
  test('zoom in and out change the reported scale', async ({ page }) => {
    const readout = page.getByText(/^\d+%$/).first();
    const initial = await readout.textContent();

    await page.getByTitle('Zoom In').click();
    await expect(readout).not.toHaveText(initial!);
    const zoomed = await readout.textContent();
    expect(parseInt(zoomed!)).toBeGreaterThan(parseInt(initial!));

    await page.getByTitle('Zoom Out').click();
    expect(parseInt((await readout.textContent())!)).toBeLessThan(parseInt(zoomed!));
  });

  test('reset returns to the starting view', async ({ page }) => {
    const readout = page.getByText(/^\d+%$/).first();
    const initial = await readout.textContent();
    await page.getByTitle('Zoom In').click();
    await page.getByTitle('Zoom In').click();
    await expect(readout).not.toHaveText(initial!);

    await page.getByTitle('Reset View').click();
    await expect(readout).toHaveText(initial!);
  });
});

test.describe('SVG export', () => {
  test('downloads a standalone, well-formed SVG', async ({ page }) => {
    await setCode(page, 'flowchart LR\n  Start --> Finish');
    await openMenu(page, /^Export$/);

    const { name, text } = await downloadText(page, async () => {
      await page.getByText('SVG (vector)', { exact: true }).click();
    });

    expect(name).toMatch(/\.svg$/);
    expect(text.startsWith('<?xml version="1.0" encoding="UTF-8"?>')).toBe(true);
    expect(text).toContain('xmlns="http://www.w3.org/2000/svg"');
    // The diagram's own content, not a rasterized screenshot.
    expect(text).toContain('Finish');
    const rootTag = text.match(/<svg[^>]*>/)![0];
    expect(rootTag).not.toContain('max-width');
  });

  test('the transparent variant omits the background rect', async ({ page }) => {
    await setCode(page, 'flowchart LR\n  A --> B');
    await openMenu(page, /^Export$/);
    const opaque = await downloadText(page, async () => {
      await page.getByText('SVG (vector)', { exact: true }).click();
    });

    await openMenu(page, /^Export$/);
    const transparent = await downloadText(page, async () => {
      await page.getByText('SVG (transparent)', { exact: true }).click();
    });

    expect(opaque.text).toContain('width="100%"');
    expect(transparent.text).not.toContain('width="100%"');
  });

  test('the exported SVG renders on its own', async ({ page, context }) => {
    await setCode(page, 'flowchart LR\n  Standalone --> Check');
    await openMenu(page, /^Export$/);
    const { text } = await downloadText(page, async () => {
      await page.getByText('SVG (vector)', { exact: true }).click();
    });

    // Load the exported markup as a document of its own — the real proof that
    // it is self-contained rather than dependent on the app's stylesheet.
    const solo = await context.newPage();
    await solo.setContent(text, { waitUntil: 'load' });
    const svg = solo.locator('svg').first();
    await expect(svg).toBeVisible();
    expect((await svg.boundingBox())!.width).toBeGreaterThan(50);
    await solo.close();
  });

  test('raster export still downloads', async ({ page }) => {
    await setCode(page, 'flowchart LR\n  A --> B');
    await openMenu(page, /^Export$/);
    const [download] = await Promise.all([
      page.waitForEvent('download'),
      page.getByText('With Background', { exact: true }).click(),
    ]);
    expect(download.suggestedFilename()).toMatch(/\.(jpg|png)$/);
  });
});

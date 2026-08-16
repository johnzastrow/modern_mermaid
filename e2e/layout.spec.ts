import { test, expect } from '@playwright/test';
import { gotoApp, setCode, editor, anyDiagram, openMenu, downloadText, label } from './helpers';

test.beforeEach(async ({ page }) => gotoApp(page));

test.describe('examples', () => {
  test('loading an example fills the editor and renders it', async ({ page }) => {
    await openMenu(page, /Examples/);
    await page.getByText('Mind Map', { exact: true }).click();
    await page.getByText('Release Plan', { exact: true }).click();

    await expect(editor(page)).toHaveValue(/mindmap/);
    await expect(anyDiagram(page)).toBeVisible();
    await expect(label(page, 'Release Plan')).toBeAttached();
  });

  test('a beta diagram type renders through the real pipeline', async ({ page }) => {
    // These lazy-load a separate Mermaid chunk, which only a real browser does.
    await openMenu(page, /Examples/);
    await page.getByText('Ishikawa Diagram', { exact: true }).click();
    await page.getByText('Why Did the Build Break?', { exact: true }).click();

    await expect(editor(page)).toHaveValue(/ishikawa-beta/);
    await expect(anyDiagram(page)).toBeVisible();
  });
});

test.describe('theme editor writes real CSS into the render', () => {
  /** Computed stroke-width of the first connector in the rendered diagram. */
  const edgeStroke = (page: import('@playwright/test').Page) =>
    page.evaluate(() => {
      const edge = document.querySelector(
        'svg .flowchart-link, svg .edge-thickness-normal, svg .edgePath .path',
      );
      return edge ? parseFloat(getComputedStyle(edge).strokeWidth) : null;
    });

  test('the line width slider thickens connectors', async ({ page }) => {
    await setCode(page, 'flowchart LR\n  A --> B');
    const before = await edgeStroke(page);
    expect(before).not.toBeNull();

    await page.getByRole('button', { name: /Customize/ }).click();
    const sliders = page.getByRole('slider');
    // Panel order: corner radius, line width, arrow size.
    await sliders.nth(1).fill('6');
    await page.waitForTimeout(700);

    const after = await edgeStroke(page);
    expect(after).toBeGreaterThan(before!);
    expect(after).toBeCloseTo(6, 0);
  });

  test('the arrow size slider scales marker paths', async ({ page }) => {
    await setCode(page, 'flowchart LR\n  A --> B');
    await page.getByRole('button', { name: /Customize/ }).click();
    await page.getByRole('slider').nth(2).fill('2.5');
    await page.waitForTimeout(700);

    const transform = await page.evaluate(() => {
      const markerPath = document.querySelector('svg marker path');
      return markerPath ? getComputedStyle(markerPath).transform : null;
    });
    // scale(2.5) computes to a matrix; identity would mean the rule never applied.
    expect(transform).toContain('matrix');
    expect(transform).not.toBe('none');

    // overflow:visible is what stops the marker viewport clipping the scaled
    // head — without it the arrow gets smaller instead of larger.
    const overflow = await page.evaluate(() => {
      const marker = document.querySelector('svg marker');
      return marker ? getComputedStyle(marker).overflow : null;
    });
    expect(overflow).toContain('visible');
  });

  test('the portability warning appears only once a CSS-only control is used', async ({ page }) => {
    await page.getByRole('button', { name: /Customize/ }).click();
    await expect(page.getByText(/frontmatter/i)).toHaveCount(0);

    await page.getByRole('slider').nth(1).fill('4');
    await expect(page.getByText(/frontmatter/i).first()).toBeVisible();
  });

  test('slider settings reach the exported config', async ({ page }) => {
    await page.getByRole('button', { name: /Customize/ }).click();
    await page.getByRole('slider').nth(1).fill('5');
    await page.waitForTimeout(400);

    await page.getByRole('button', { name: /Config/ }).click();
    // The editor textarea is a textbox too, so scope to the modal.
    const frontmatter = page.getByRole('dialog').getByRole('textbox').first();
    await expect(frontmatter).toHaveValue(/themeCSS:/);
    await expect(frontmatter).toHaveValue(/stroke-width: 5px/);
  });
});

test.describe('share links', () => {
  test('a generated link restores the diagram', async ({ page, context }) => {
    const code = 'flowchart LR\n  Shared --> Link';
    await setCode(page, code);

    // Permission has to exist before the app writes, not just before we read.
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    await page.getByRole('button', { name: /Share/ }).click();
    await page.waitForTimeout(500);
    const url = await page.evaluate(() => navigator.clipboard.readText());
    expect(url).toContain('c=');

    const restored = await context.newPage();
    await restored.goto(url);
    await expect(restored.locator('textarea').first()).toHaveValue(code);
    await restored.close();
  });
});

test.describe('theme library', () => {
  test('exports saved themes as JSON once one exists', async ({ page }) => {
    await page.getByRole('button', { name: /Customize/ }).click();

    // Export is disabled until the library has something in it.
    const exportBtn = page.getByTitle(/no saved themes to export/i);
    await expect(exportBtn).toBeDisabled();

    await page.getByTitle(/save theme/i).click();
    await page.waitForTimeout(400);

    const { name, text } = await downloadText(page, async () => {
      await page.getByTitle(/export all saved themes/i).click();
    });

    expect(name).toMatch(/\.json$/);
    const parsed = JSON.parse(text);
    expect(parsed.kind).toBe('modern-mermaid-theme-library');
    expect(Object.keys(parsed.themes).length).toBeGreaterThan(0);
  });
});

test.describe('config import', () => {
  test('a pasted init directive is applied to the diagram', async ({ page }) => {
    await setCode(page, 'flowchart LR\n  A --> B');
    await page.getByRole('button', { name: /Import/ }).click();

    await page
      .getByRole('dialog')
      .getByRole('textbox')
      .first()
      .fill('%%{init: {"theme":"base","themeVariables":{"lineColor":"#ff00ff"}}}%%');
    await page.getByRole('button', { name: /Load theme/i }).click();
    await page.waitForTimeout(700);

    const stroke = await page.evaluate(() => {
      const edge = document.querySelector('svg .flowchart-link, svg .edge-thickness-normal');
      return edge ? getComputedStyle(edge).stroke : null;
    });
    expect(stroke).toBe('rgb(255, 0, 255)');
  });
});

test.describe('dark mode', () => {
  test('toggling persists across a reload', async ({ page }) => {
    const html = page.locator('html');
    const wasDark = await html.evaluate((el) => el.classList.contains('dark'));

    await page.locator('header button').first().click();
    await expect(html).toHaveClass(wasDark ? /^(?!.*dark).*$/ : /dark/);

    await page.reload();
    await expect(anyDiagram(page)).toBeVisible();
    const stillToggled = await html.evaluate((el) => el.classList.contains('dark'));
    expect(stillToggled).toBe(!wasDark);
  });
});

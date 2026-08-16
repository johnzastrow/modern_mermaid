import { expect, type Page, type Locator } from '@playwright/test';

/** The editor is a plain textarea behind a syntax-highlight overlay. */
export const editor = (page: Page): Locator => page.locator('textarea').first();

/** The rendered Mermaid diagram. */
export const diagram = (page: Page): Locator => page.locator('svg.flowchart, svg[id^="mermaid"], svg[aria-roledescription]').first();

/** Any SVG inside the preview pane, whatever diagram type produced it. */
export const anyDiagram = (page: Page): Locator =>
  page.locator('svg[role="graphics-document document"], svg[aria-roledescription]').first();

export async function gotoApp(page: Page) {
  await page.goto('/');
  await expect(editor(page)).toBeVisible();
  // The starter diagram proves Mermaid finished its first render.
  await expect(anyDiagram(page)).toBeVisible();
}

/** Replace the editor contents and wait for the preview to settle. */
export async function setCode(page: Page, code: string) {
  const ta = editor(page);
  await ta.click();
  await ta.press('ControlOrMeta+a');
  await ta.fill(code);
  // Rendering is debounced; wait for the SVG to reflect the new source.
  await page.waitForTimeout(600);
}

/**
 * A rendered diagram label.
 *
 * Plain `getByText` is unusable inside an SVG here: Mermaid embeds its whole
 * stylesheet in a `<style>` element, so a search for "B" also matches the CSS
 * and trips strict mode. Labels live in `foreignObject > p` (HTML labels) or
 * `text`/`tspan` (plain SVG labels) depending on diagram type.
 */
export const label = (page: Page, text: string): Locator =>
  page
    .locator('svg')
    .locator('foreignObject p, text, tspan')
    .filter({ hasText: new RegExp(`^\\s*${text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*$`) })
    .first();

/** Open one of the toolbar dropdowns by its visible button text. */
export async function openMenu(page: Page, name: RegExp) {
  await page.getByRole('button', { name }).first().click();
}

/**
 * Trigger `action` and return the downloaded file's text.
 * Downloads are one of the main reasons these tests need a real browser.
 */
export async function downloadText(page: Page, action: () => Promise<void>): Promise<{ name: string; text: string }> {
  const [download] = await Promise.all([page.waitForEvent('download'), action()]);
  const stream = await download.createReadStream();
  const chunks: Buffer[] = [];
  for await (const chunk of stream) chunks.push(chunk as Buffer);
  return { name: download.suggestedFilename(), text: Buffer.concat(chunks).toString('utf8') };
}

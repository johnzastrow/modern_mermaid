import { defineConfig, devices } from '@playwright/test';

/**
 * Browser-based tests for the parts jsdom cannot reach.
 *
 * `Preview` and `Layout` are the app's integration surface: Mermaid rendering
 * needs real layout (`getBBox` returns zeros under jsdom, so `mermaid.render`
 * throws outright), and export/copy depend on real Blob URLs, downloads and
 * the async clipboard. Those are the behaviours most worth guarding and the
 * ones the Vitest suite deliberately skips.
 *
 * Tests run against the **production build** rather than the dev server, so
 * what is verified is what actually ships — minified, with the real service
 * worker and asset hashing.
 */
const PORT = 4173;

export default defineConfig({
  testDir: './e2e',
  // Rendering a diagram is genuinely slow the first time Mermaid lazy-loads a
  // diagram chunk; the default 5s assertion timeout is too tight for that.
  expect: { timeout: 10_000 },
  timeout: 60_000,
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: process.env.CI ? [['github'], ['list']] : [['list']],

  use: {
    baseURL: `http://127.0.0.1:${PORT}`,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],

  webServer: {
    command: `pnpm preview --port ${PORT} --strictPort`,
    url: `http://127.0.0.1:${PORT}`,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});

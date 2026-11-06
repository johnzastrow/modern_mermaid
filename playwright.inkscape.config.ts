import { defineConfig, devices } from '@playwright/test';
import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import base from './playwright.config';

/**
 * Opt-in suite: how well exported SVGs survive in Inkscape (`pnpm test:inkscape`).
 * Needs `inkscape` and ImageMagick 7 (`magick`) on PATH; skipped otherwise.
 *
 * Chromium and Inkscape must draw with the same fonts, or the comparison mostly
 * measures font substitution. A private fontconfig file adds the app's bundled
 * fonts (@fontsource packages and public/fonts) on top of the system set, and
 * both the browser and the inkscape child processes inherit it.
 */
const fontsConf = resolve('inkscape-report/fonts.conf');
mkdirSync(resolve('inkscape-report'), { recursive: true });
writeFileSync(
  fontsConf,
  `<?xml version="1.0"?>
<!DOCTYPE fontconfig SYSTEM "fonts.dtd">
<fontconfig>
  <include ignore_missing="yes">/etc/fonts/fonts.conf</include>
  <dir>${resolve('node_modules/@fontsource')}</dir>
  <dir>${resolve('public/fonts')}</dir>
  <cachedir>${resolve('inkscape-report/fontcache')}</cachedir>
</fontconfig>
`,
);
process.env.FONTCONFIG_FILE = fontsConf;

export default defineConfig({
  ...base,
  testDir: './e2e/inkscape',
  testIgnore: [],
  globalTeardown: './e2e/inkscape/report.ts',
  timeout: 120_000,
  retries: 0,
  projects: [{ name: 'inkscape', use: { ...devices['Desktop Chrome'] } }],
});

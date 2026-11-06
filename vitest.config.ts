import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { readFileSync } from 'node:fs';

// Version strings shown in the header. Read at build time, so the client
// bundle carries short strings rather than whole package.json files.
const readVersion = (path: string): string =>
  JSON.parse(readFileSync(new URL(path, import.meta.url), 'utf8')).version;
const versionDefines = {
  __APP_VERSION__: JSON.stringify(readVersion('./package.json')),
  __MERMAID_VERSION__: JSON.stringify(readVersion('./node_modules/mermaid/package.json')),
  __MERMAID12_VERSION__: JSON.stringify(readVersion('./node_modules/mermaid12/package.json')),
};

export default defineConfig({
  plugins: [react()],
  define: versionDefines,
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test/setup.ts',
    // Vitest's default glob would also match the Playwright specs in e2e/,
    // which import @playwright/test and cannot run under this runner.
    // server/ holds the theme backend's tests; they opt into the node environment.
    include: ['src/**/*.{test,spec}.{ts,tsx}', 'server/**/*.test.mjs'],
    coverage: {
      provider: 'v8',
      // Report on every source file, not only the ones a test happened to
      // import. Without this an entirely untested module is simply absent from
      // the table, and the headline percentage flatters the suite.
      all: true,
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        'src/**/*.test.{ts,tsx}',
        'src/**/*.d.ts',
        'src/test/**',
        'src/main.tsx',
        // Large literal catalogues rather than logic. examples.ts is exercised
        // by examples.test.ts, which parses every entry against Mermaid — the
        // check that actually matters for a data table.
        'src/utils/themes.ts',
        'src/utils/fonts.ts',
        'src/utils/backgrounds.ts',
      ],
      reporter: ['text', 'html'],
    },
  },
});

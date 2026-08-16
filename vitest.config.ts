import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test/setup.ts',
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

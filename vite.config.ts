import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'
import { readFileSync } from 'node:fs'
import type { Plugin, Rollup } from 'vite'

// Version strings shown in the header. Read at build time, so the client
// bundle carries short strings rather than whole package.json files.
const readVersion = (path: string): string =>
  JSON.parse(readFileSync(new URL(path, import.meta.url), 'utf8')).version;
const versionDefines = {
  __APP_VERSION__: JSON.stringify(readVersion('./package.json')),
  __MERMAID_VERSION__: JSON.stringify(readVersion('./node_modules/mermaid/package.json')),
  __MERMAID12_VERSION__: JSON.stringify(readVersion('./node_modules/mermaid12/package.json')),
};

// Mermaid 12 is only a test option (?mermaid=12), so keep its chunks out of the
// service worker precache; otherwise every visitor would download both versions.
// A chunk is excluded when it can be reached from the app entry only through
// the dynamic import of the mermaid12 package.
const optionalChunks = new Set<string>();
const MERMAID12_ROOT = /[\\/]mermaid@12[^\\/]*[\\/]/;
const findOptionalChunks: Plugin = {
  name: 'mm-optional-chunks',
  apply: 'build',
  generateBundle(_options, bundle) {
    const chunks = Object.values(bundle).filter((c): c is Rollup.OutputChunk => c.type === 'chunk');
    const isMermaid12Root = (c: Rollup.OutputChunk) => !!c.facadeModuleId && MERMAID12_ROOT.test(c.facadeModuleId);
    const byName = new Map(chunks.map((c) => [c.fileName, c]));
    const reached = new Set<string>();
    const stack = chunks.filter((c) => c.isEntry).map((c) => c.fileName);
    while (stack.length) {
      const name = stack.pop()!;
      const chunk = byName.get(name);
      if (!chunk || reached.has(name) || isMermaid12Root(chunk)) continue;
      reached.add(name);
      stack.push(...chunk.imports, ...chunk.dynamicImports);
    }
    optionalChunks.clear();
    for (const c of chunks) if (!reached.has(c.fileName)) optionalChunks.add(c.fileName);
  },
};

export default defineConfig(({ mode }) => {
  const isExtension = mode === 'extension';

  return {
    define: versionDefines,
    plugins: [
      findOptionalChunks,
      react(),
      tailwindcss(),
      !isExtension && VitePWA({
        registerType: 'autoUpdate',
        // Emit an external registerSW.js instead of an inline <script>, so a
        // strict Content-Security-Policy (script-src 'self') does not block it.
        injectRegister: 'script',
        manifest: {
          name: "Modern Mermaid",
          short_name: "Mermaid",
          description: "A modern, beautiful Mermaid.js editor with custom themes and high-quality export.",
          start_url: "/",
          display: "standalone",
          background_color: "#ffffff",
          theme_color: "#1e1e1e",
          icons: [
            {
              src: "/icon-192.png",
              sizes: "192x192",
              type: "image/png",
            },
            {
              src: "/icon-512.png",
              sizes: "512x512",
              type: "image/png",
            },
          ],
        },
        workbox: {
          manifestTransforms: [
            async (entries) => ({
              manifest: entries.filter((e) => !optionalChunks.has(e.url.replace(/^\//, ''))),
              warnings: [],
            }),
          ],
          runtimeCaching: [
            {
              urlPattern: ({ request }) =>
                request.destination === 'document' ||
                request.destination === 'script' ||
                request.destination === 'style' ||
                request.destination === 'image' ||
                request.destination === 'font',
              handler: 'CacheFirst',
              options: {
                cacheName: 'mm-static-cache',
                expiration: {
                  maxEntries: 200,
                  maxAgeSeconds: 60 * 60 * 24 * 30,
                },
              },
            },
          ],
        },
      }),
    ].filter(Boolean),
    build: {
      outDir: isExtension ? 'dist-extension' : 'dist',
      sourcemap: isExtension,
      rollupOptions: isExtension ? {
        input: {
          main: 'index.html',
          background: 'src/background.ts'
        },
        output: {
          entryFileNames: (chunkInfo) => {
            return chunkInfo.name === 'background' ? '[name].js' : 'assets/[name]-[hash].js';
          }
        }
      } : {}
    },
    server: {
      host: '0.0.0.0',
      port: 5173,
      strictPort: false,
    },
  };
})
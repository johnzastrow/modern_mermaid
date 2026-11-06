# Changelog

All notable changes to this project are documented here. This project adheres to
[Semantic Versioning](https://semver.org/).

## [Unreleased]

### Added
- **Export > SVG (Inkscape / editors).** An SVG that Inkscape and other SVG
  editors display correctly. The diagram is re-rendered with plain SVG text
  labels, then: leftover HTML labels (`foreignObject`) become SVG text,
  `currentColor` becomes a concrete color (gantt grid lines), CSS drop shadows
  become SVG 1.1 filters, spaces at the edge of text runs become non-breaking
  (class members ran together), and unsized diagrams get a measured `viewBox`.
  Measured with `pnpm test:inkscape` on 35 diagrams: poor results drop from 10
  to 0 on both Mermaid 11 and Mermaid 12.
- `pnpm test:inkscape` scores both exports, and `INKSCAPE_MERMAID=12` runs it
  against the Mermaid 12 switch. Reports go to `inkscape-report/<theme>-mermaid-<major>/`.

### Changed
- The standard SVG export measures diagrams that carry no size (info) and pins
  a `viewBox`, instead of leaving viewers to fall back to 300x150.
- The SVG export code is shared: the preview's render and post-processing now
  live in one function used by both the preview and the editor-safe export.

## [1.3.2] - 2026-11-06

### Fixed
- Labels no longer lose their last characters ("Login Succes", "COMMEN").
  Mermaid sizes each box by measuring its label, and on a theme's first render
  the web font (Inter, Nunito, ...) was often still loading, so boxes were
  sized for the fallback font. Rendering now waits, up to 3 seconds, for the
  regular and bold faces of every web font the diagram config names. This
  generalizes the wait that only the Hand Drawn theme had.

### Added
- `pnpm test:inkscape`: an opt-in Playwright suite that exports every example
  diagram as SVG, renders it with Chromium and Inkscape using the same fonts,
  and scores the match (SSIM, drawn- and dark-pixel ratios, lost HTML labels,
  Inkscape-risky SVG features). It writes `inkscape-report/report.md` with
  side-by-side images. First result with Inkscape 1.5: 22 good, 3 degraded,
  10 poor of 35. Every poor result is a diagram type with HTML labels in
  `foreignObject`, which Inkscape does not render. Gantt grid lines
  (`stroke="currentColor"`) and the info diagram (no `viewBox`) also degrade.
- README: a "Software design diagrams" section (sequence, class, ER, state,
  flowchart, requirement) in the restrained themes.

### Changed
- Deployment defaults and docs point at 1.3.2.

## [1.3.1] - 2026-11-06

### Fixed
- Share links with the Windows 95, Playful Doodle, Organic Natural, High Tech,
  Kawaii Cute or Geometric Collage theme opened in the default theme. The
  loader checked a hand-maintained list of theme names that had fallen behind;
  it now accepts any key of the theme registry.
- The Export config and Import dialogs no longer sit underneath the preview's
  zoom controls. They rendered inside the toolbar's stacking context, so their
  z-index could not lift them above it; both now render in a portal on
  `document.body`.

### Changed
- README screenshots: the hero shows the visual theme editor, the Markdown
  export section shows the config dialog, and the theme gallery is replaced by
  a gallery of less common diagram types (architecture, sankey, quadrant, git
  graph, block, XY chart), each in a different theme. The old theme
  screenshots are removed; the translated READMEs use the new images.
- Deployment defaults point at this release: `docker-compose.deploy.yml` falls
  back to `MM_VERSION=1.3.1`, and the README, `docs/DEPLOYMENT.md` and
  `SECURITY.md` use it in their examples, verify commands and version tables.
  1.3.0 shipped with these still at 1.2.0, so an install that did not set
  `MM_VERSION` ran 1.2.0.

## [1.3.0] - 2026-11-05

### Added
- The header shows the app version, linked to its release notes. Hovering it
  also shows the bundled Mermaid version. Both are read from `package.json`
  files at build time.
- A hidden test switch for Mermaid 12.3.0. Add `?mermaid=12` to the URL to
  render with 12.x; the choice is remembered in that browser, and the header
  badge turns amber and names the Mermaid version while it is active.
  `?mermaid=11` returns to the default. Mermaid 11.17.2 stays the default for
  everyone else. 12.x is a separate download, fetched only when selected, and
  is kept out of the offline (service worker) cache.

### Fixed
- **Fonts are self-hosted.** The app loaded fonts from Google Fonts and from a
  third-party host (`quick.go-admin.cn`, inherited from upstream). The CSP
  blocked both, so diagrams silently fell back to system fonts.
  - Inter, JetBrains Mono, Caveat, Patrick Hand, Nunito and Open Sans now come
    from `@fontsource` packages, bundled with the app.
  - Excalifont and Xiaolai (the Hand Drawn theme) are bundled from Excalidraw
    0.18.1 with their unicode ranges, so a browser fetches only the slices a
    diagram needs. They load only when a diagram uses them, and are kept out of
    the offline cache until first use. Xiaolai previously pointed at 6 of its
    205 slices, so most Chinese characters fell back to another font.
  - Noto Sans SC and Noto Serif SC map to the CJK fonts installed on the
    visitor's system instead of a 160 MB download.
  - Unused families (VT323, Ma Shan Zheng, Kalam) are no longer referenced.
  - Font licenses (SIL OFL 1.1) are in `public/fonts/`.
- The preview toolbar no longer covers the zoom controls or spills into the
  editor in narrow preview panes; it wraps onto a second row instead.

### Notes
- Mermaid 12 changes how existing diagrams look: ELK becomes the default
  layout and the `neo` look the default appearance. See the
  [Mermaid 12.0.0 release notes](https://github.com/mermaid-js/mermaid/releases/tag/mermaid%4012.0.0).

## [1.2.0] - 2026-11-05

First formal release, hardened for running on the internet. The version jumps
from 0.5.0 to 1.2.0 because the repository already carries `v1.0.0` and `v1.1.0`
tags from July 2026; continuing above them keeps release and image tags in order.

### Security
- Both images apply Alpine security updates at build time, so fixes published
  after the pinned base was built are included. The theme backend image no
  longer ships npm, npx, corepack or yarn, which it never used.
- **Theme library writes are off by default.** `PUT /api/themes` previously
  accepted writes from anyone who could reach the app. The backend now refuses
  writes unless the operator sets an owner write token (`THEMES_WRITE_TOKEN`,
  at least 32 characters, compared in constant time) or, for a LAN instance
  behind an allowlist, `THEMES_ALLOW_ANON_WRITE=true`. Authorization is checked
  before the body is read; bodies must be JSON objects of at most 500 themes.
- **Themes fetched from the server are sanitized.** They now pass through the
  same allowlist-and-sanitize path as imported theme files, and so do themes
  read back from localStorage (which older versions filled with unsanitized
  server data).
- Concurrent writes are serialized and each uses its own temp file, so the store
  can no longer be corrupted by overlapping saves.
- **No more silent overwrites of the shared library.** Reads carry an ETag and
  writes send `If-Match`, so a browser holding an old copy gets `412` instead of
  replacing newer data. A browser that could not fetch the library this session
  (backend restarting, rate limited) never writes. Rapid saves are coalesced into
  one write, failures show a message, and the server keeps the previous version
  as `themes.json.bak`.
- The theme CSS sanitizer now resolves CSS escapes and comments before matching
  (`\75 rl(` and `@\69mport` previously slipped past it) and removes `<`.
- Mermaid's `securityLevel: 'strict'` is now set explicitly on every render.
- The owner token must also contain at least 10 distinct characters.
- nginx: per-client rate limits on static files, API reads and API writes, and a
  per-client connection cap;
  method allowlists; request size and timeout bounds; `server_tokens off`;
  `Cross-Origin-Opener-Policy` and `Cross-Origin-Resource-Policy` headers.
- Containers: read-only root filesystems, memory, CPU and process limits, log
  rotation, and publication on `127.0.0.1` by default (`MM_BIND`).
- Base images pinned by digest; nginx moved from the unsupported 1.27 line to
  stable 1.30. Dependabot now also watches `server/Dockerfile`.
- Dependencies updated: the production audit goes from 13 advisories (1
  critical, 2 high in DOMPurify via mermaid) to 1 low. Remaining accepted
  advisories are listed in SECURITY.md.
- CI and release pipeline: all actions pinned to commit SHAs; Trivy image scans;
  a compose smoke test. Images are pushed by digest, scanned, signed with cosign
  and attested (SBOM, SLSA provenance) before any tag is applied, so a failed
  scan never leaves a tagged image. Release tags must point at a commit on
  `main`.

### Added
- `GET /api/themes/status` reports whether this browser may write, so public
  visitors never send writes or see an auth prompt.
- "Shared library" control in the theme editor for entering or forgetting the
  owner write token.
- Release workflow: tag `vX.Y.Z` to publish images tagged `X.Y.Z`, `X.Y` and
  `latest`, plus a GitHub Release with the static build zip, source archive,
  SBOMs, `SHA256SUMS` and build provenance.
- `docs/DEPLOYMENT.md`: internet-facing and LAN deployment, verification,
  upgrades and backups. Backend tests (`server/themes-server.test.mjs`).

### Changed
- Pushes to `main` now publish `edge` and `sha-<short>` images; `latest` moves
  only on a release. `docker-compose.deploy.yml` pins a release (`MM_VERSION`)
  instead of following `latest`.

### Upgrade notes
- **Writes to the shared theme library stop working until you configure them.**
  Set `THEMES_WRITE_TOKEN` (and enter it in the theme editor), or
  `THEMES_ALLOW_ANON_WRITE=true` on a LAN-only instance.
- The app is published on `127.0.0.1` by default. If clients connect to the
  container port directly rather than through a reverse proxy, set `MM_BIND`.

## [0.5.0] - 2026-09-13

### Added
- **Server-side theme persistence.** Custom theme libraries now persist across
  sessions and are shared across every machine, instead of living only in a
  single browser's `localStorage`. A tiny dependency-free backend
  (`server/themes-server.mjs`) stores the library as one JSON document on a
  Docker volume, exposed as same-origin `GET`/`PUT /api/themes`; the frontend
  nginx proxies `/api/*` to it.
- Second container image `ghcr.io/johnzastrow/modern_mermaid-themes` (built and
  pushed by the same GitHub Actions workflow) plus a `themes-data` volume in
  both compose files. Frontend host port is now parameterized via `MM_PORT`.

### Changed
- `persistSavedThemes` now also mirrors the library to the server (best-effort),
  and the app hydrates its library from the server on mount, merging the server
  copy over the local one and writing the merged result back so both converge.

### Notes
- Fully degrades: if the backend is absent or unreachable the app keeps working
  from `localStorage` exactly as before -- the nginx `/api` proxy uses a
  variable + Docker DNS resolver so nginx starts even with no backend, and every
  client call is wrapped to fall back silently.
- No authentication: this is a single-user / trusted-LAN tool sitting behind the
  reverse proxy, which is the only network boundary. The store is a single
  shared library, written atomically (temp file + rename) and size-capped.

## [0.4.2] - 2026-08-16

### Added
- **Playwright browser tests** for `Preview` and `Layout` — 25 specs covering
  the behaviour jsdom cannot reach. Under jsdom `getBBox` returns zeros and
  `mermaid.render` throws outright, so these two components had no meaningful
  coverage at all; downloads, Blob URLs and the async clipboard were equally
  out of reach.
- `pnpm test:e2e`, `pnpm test:e2e:ui`, and `pnpm typecheck:e2e`. A separate
  **Browser tests** CI job installs Chromium only, builds, typechecks the specs
  and runs them, uploading the Playwright report when it fails.

### Notes
- Tests run against the **production build** via `vite preview`, so what they
  verify is the artifact the container actually ships — minified, hashed, with
  the real service worker.
- The most valuable specs prove things previously only checked by hand: the
  line-width slider raises a connector's *computed* `stroke-width`, the arrow
  slider produces a real `matrix(...)` transform on marker paths with
  `overflow: visible` in effect, an exported SVG opens as a standalone document
  and renders, and a share link round-trips a diagram through the clipboard.
- Chromium only. These tests target rendering and download plumbing, not
  cross-browser differences; more engines would triple CI time for little
  signal.
- Assertions on diagram labels use presence rather than visibility. Mermaid
  transforms individual SVG text nodes in ways that defeat Playwright's
  visibility heuristic — journey task labels report `hidden` while plainly
  drawn — so the SVG root is asserted visible and the labels asserted present.

### Fixed
- Vitest's default glob matched the Playwright specs in `e2e/`, which import
  `@playwright/test` and cannot run under it. `include` is now scoped to `src`.
- `tsconfig.e2e.json` is deliberately **not** referenced from the root project.
  `.dockerignore` strips `e2e/` from the build context, so referencing it made
  `tsc -b` fail inside the container with TS18003. The specs are typechecked by
  `pnpm typecheck:e2e` in CI instead, and the production build stays lean.

## [0.4.1] - 2026-08-16

### Changed
- Upgraded `@testing-library/jest-dom` 6.9.1 -> 7.0.1 and **lifted the exact
  pin** back to a caret range. The 6.x line was a dead end: 6.10.0 was
  deprecated by its author for shipping breaking changes in a minor, leaving
  6.9.1 as the last usable release.
- Coverage now reports on **every** source file (`all: true`) rather than only
  the ones a test happens to import. The previous configuration reported 80%
  while entire modules were untested and simply absent from the table; the
  honest figure at that moment was 15.9%. Large literal catalogues
  (`themes`, `fonts`, `backgrounds`) are excluded as data rather than logic.

### Fixed
- jest-dom's matchers now typecheck under `tsc -b`. **Correcting an earlier
  note in this changelog: the 7.x upgrade does not fix this on its own** —
  7.0.1's `vitest.d.ts` is byte-identical to 6.9.1's. The real cause is that
  jest-dom augments `Assertion` in module `vitest`, while Vitest 4 declares
  that interface in `@vitest/expect` and merely re-exports it, and a module
  augmentation cannot merge into a re-exported interface. The fix is
  `src/types/vitest-matchers.d.ts`, which augments the empty
  `interface Matchers<T>` that `@vitest/expect` exposes for exactly this
  purpose. Two placement details matter and both cost a debugging cycle: the
  file must live outside `src/test` (excluded by `tsconfig.app.json`), and
  `@vitest/expect` must be a direct devDependency or the specifier fails to
  resolve and the augmentation silently declares a *new* ambient module.

### Added
- Tests for the previously untested core: `compression` (share-URL round trip,
  malformed input, oversized diagrams), `customThemes` (persistence, corrupt
  storage, quota failure), `i18n` (key-set parity across all six languages, no
  blank strings, no untranslated blocks), `ExampleSelector`, `ImportConfig`
  (including that hostile pasted CSS is sanitized before reaching the app),
  `ExportConfig`, `DarkModeContext`, and the SVG/library download paths.
- **260 tests, up from 175.** `src/utils` coverage is 93%, `src/contexts` 82%.
  Overall is 25%, held down by `Preview.tsx` (1704 lines), `AnnotationLayer`
  (934) and `Layout` (549) — canvas- and DOM-heavy components where jsdom tests
  would cost far more than they would catch. That is a deliberate stopping
  point, not an oversight.

## [0.4.0] - 2026-08-16

### Added
- **SVG export**, as two more entries in the Export menu (with background, and
  transparent). Unlike the PNG/JPG path, which rasterizes the preview node with
  `html-to-image`, this serializes the `<svg>` Mermaid actually rendered — true
  vector, roughly 15 KB against 200 KB+ for the same diagram as PNG, and
  diffable in git. Verified end to end: an exported file opens standalone with
  colors, corner radius, line width and arrow scaling all intact.
- **Theme library backup.** Two buttons in the theme editor header export every
  saved theme to a JSON file and merge one back in. Saved themes previously
  lived only in the `mm-custom-themes` localStorage key, so clearing browser
  data destroyed them and there was no way to move a set between machines.

### Security
- An imported library is untrusted input. Every field is allowlisted and
  coerced, `themeCSS` goes through the same `sanitizeThemeCSS` boundary the
  paste-a-config import already uses, `bgStyle` values carrying a URL scheme are
  dropped, and each theme's name is taken from its map key rather than the
  payload so a crafted file cannot overwrite an unrelated saved theme. File size
  and theme count are both capped. Nothing is ever evaluated.
- **Importing never overwrites.** A name collision renames the incoming theme
  (`Name (imported)`, then `(imported 2)`, …) rather than replacing what is
  already saved; losing hand-made work to a filename clash would be the worst
  outcome available, so the merge fails safe.

### Notes
- SVG export deliberately does **not** include annotations: they are an HTML
  overlay on top of the preview, not part of the diagram's SVG. The menu says
  so. Use PNG/JPG to capture annotated diagrams.
- Fonts in an exported SVG are referenced, not embedded, so a custom font falls
  back where it is not installed. Embedding would mean inlining the font file.
- Clipboard copy was already implemented (`copyImage`, wired through the Copy
  menu with opaque and transparent variants) and needed no work — it had been
  listed as a gap in error.

## [0.3.0] - 2026-08-15

### Added
- **Connector line width** and **arrow head size** sliders in the theme editor,
  alongside the existing corner-radius control. Line width is a pixel value
  (`auto` leaves Mermaid's own widths alone); arrow size is a multiplier of
  whatever the diagram type draws.
- A **portability warning** in the theme editor, shown only while one of these
  CSS-only controls is in use. These three settings are `themeCSS`, so they
  export via YAML frontmatter but not the inline `%%{init}%%` form, and GitHub
  strips `themeCSS` entirely. Colors and fonts remain portable everywhere.
- `src/utils/managedCss.ts`, extracting the marker-delimited `themeCSS` block
  helpers that previously lived inline in `ThemeEditor` and served only the
  radius slider. All three controls now share one idempotent implementation,
  covered by `managedCss.test.ts` and `ThemeEditor.test.tsx` (142 tests total).

### Notes
- Neither setting has a Mermaid `themeVariable`, so CSS is the only route.
  Both rules were verified against diagrams rendered in Chrome rather than
  derived from documentation:
  - Connector selectors were read off real output and differ per diagram type
    (`.flowchart-link`, `.messageLine0/1`, `.relation`, `.transition`,
    `.relationshipLine`, `.edge-thickness-normal`). The sequence lifeline
    (`.actor-line`) is deliberately excluded — it is not a connector.
  - Arrow heads are `<marker>` elements sized by `markerWidth`/`markerHeight`
    *attributes*, which CSS cannot set. Scaling the marker's path is the only
    option, and `marker { overflow: visible }` is **mandatory**: a marker clips
    to its viewport by default, so scaling without it shrinks the head into a
    clipped blob instead of enlarging it.
- jest-dom's matchers (`toBeInTheDocument` and friends) work at runtime but do
  not typecheck under vitest 4: jest-dom 6.9.1 augments `Assertion` in module
  `vitest`, while vitest 4 re-exports that interface from `@vitest/expect`, so
  the augmentation never merges. Component tests use plain matchers until the
  6.9.1 pin is lifted. This is further reason 6.x is a dead end for this repo.

## [0.2.0] - 2026-08-15

### Added
- Examples for all 22 diagram types the app was missing, taking the built-in
  library from 9 categories / 13 examples to **31 categories / 35 examples**.
  Mermaid 11.16.1 supports 31 authorable diagram types and every one now has a
  worked example: `journey`, `mindmap`, `timeline`, `quadrant`, `requirement`,
  `c4`, `sankey`, `block`, `architecture`, `kanban`, `packet`, `radar`,
  `treemap`, `venn`, `swimlane`, `wardley`, `cynefin`, `ishikawa`, `info`, and
  the three railroad grammar flavours (EBNF, ABNF, PEG).
- `src/utils/examples.test.ts`, which parses every example against the installed
  mermaid and asserts the catalogue's structural invariants (unique ids, a name
  and code body in all six languages, a label for every category, and every id
  resolvable through `findExampleById`). Distinct diagram bodies are parsed once
  each rather than once per language. This takes the suite from 12 tests to 118.

### Notes
- New examples are English-only: all six language keys carry the same English
  text. Existing translated examples are untouched.
- Bare `railroad-beta` is deliberately absent. Despite shipping a module, it has
  no authorable syntax of its own -- it is the shared renderer behind the three
  grammar flavours, and every documented form is rejected by its parser.
  Railroad diagrams are covered through `railroad-ebnf-beta`,
  `railroad-abnf-beta`, and `railroad-peg-beta`.
- Eight of the new types are `-beta` in mermaid 11.16.1 (`packet`, `radar`,
  `treemap`, `venn`, `swimlane`, `wardley`, `cynefin`, `ishikawa`), as are the
  railroad flavours and `sankey`, `block`, and `architecture`. Their syntax can
  change in a future mermaid release; the new test is what will catch it.

## [0.1.1] - 2026-08-15

### Security
- Resolved all 32 open Dependabot alerts. `pnpm audit` now reports no known
  vulnerabilities in either the production or the full dependency graph.
- **Root cause: a stale `workbox-build` pin.** `vite-plugin-pwa@1.3.0` declares
  `workbox-build`/`workbox-window` as `^7.4.1`, but the lockfile had drifted to
  `7.4.0` in violation of that range. 7.4.0 carries a legacy build subtree that
  7.4.1 drops entirely, and that subtree was the sole source of the alerts for
  `rollup@2`, `lodash`, `serialize-javascript@6`, `picomatch@2`, `minimatch@5`,
  `@babel/core`, and `@babel/plugin-transform-modules-systemjs`. Regenerating the
  lockfile against the declared range removed `lodash` and both `@babel` packages
  from the tree outright and moved the rest past their fixed versions.
- **`fast-uri` needed an explicit override.** `ajv` depends on `fast-uri: ^3.0.1`,
  and although `3.1.5` satisfies that range, `latest` now points at the 4.x line
  and the maintained 3.x line sits behind a non-default `three` dist-tag — so
  ordinary resolution stopped at `3.1.0` and never reached the patch. This is what
  Dependabot reported as `security_update_not_possible` (five advisories,
  CVSS 7.5, all development scope). Pinned forward to `^3.1.5`, which keeps ajv's
  declared range satisfied.
- Overrides live in `pnpm-workspace.yaml`; pnpm 11 no longer reads
  `pnpm.overrides` from `package.json`.

### Changed
- Refreshed the lockfile, taking minor/patch bumps across the tree. Notably
  `mermaid` 11.16.0 → 11.16.1, `postcss` 8.5.16 → 8.5.26, `nanoid` 3.3.15 →
  3.3.18, and `dompurify` 3.4.11 → 3.4.13 — the four runtime-scope alerts. This
  supersedes Dependabot PRs #11 and #12.
- Pinned `@testing-library/jest-dom` to an exact `6.9.1`. The caret range would
  otherwise resolve to `6.10.0`, which its author has deprecated for shipping
  breaking changes in a minor ("Use 6.9.1 for the 6.x line, or upgrade to 7.0.0").
  Moving to 7.x is viable — its peer and engine requirements are already met — but
  is left as a separate, deliberate change.

## [0.1.0] - 2026-07-06

### Changed
- Upgraded all dependencies to their latest versions, including major bumps:
  Vite 7 → 8, TypeScript 5.9 → 6, ESLint 9 → 10 (+ `typescript-eslint`,
  `eslint-plugin-react-hooks` 7), Mermaid 11.12 → 11.16, `lucide-react` 0.554 → 1,
  `jsdom` 28 → 29, `@vitejs/plugin-react` 5 → 6.
- Pinned the package manager (`pnpm@11.10.0`) via the `packageManager` field so
  builds are reproducible with Corepack.
- ESLint flat config: kept the newly-strict `no-explicit-any`,
  `react-refresh/only-export-components`, and `react-hooks/set-state-in-effect`
  rules as warnings (visible tech debt) rather than hard errors, to avoid
  behavior-changing rewrites during a dependency pass.
- Service worker now registers via an external script (`injectRegister: 'script'`)
  so a strict `script-src 'self'` Content-Security-Policy does not block it.

### Removed
- Google Analytics integration (`GoogleAnalytics`, `useAnalytics`,
  `config/analytics`) and all `trackEvent` call sites — this is a self-hosted,
  no-auth tool with no need for external telemetry.
- Cookie-consent banner (`UserNotice`), which existed only to satisfy the
  analytics integration.
- Upstream promotional links (GitHub/Discord) and `DiscordIcon` from the header,
  and the analytics-only `env.template`.

### Fixed
- `lucide-react` 1.x removed the `Github` brand icon (build breakage); removed
  the dependent header link.
- Lint errors surfaced by the toolchain upgrade: `no-case-declarations`,
  `no-useless-escape`, and dead `no-useless-assignment` post-increments.

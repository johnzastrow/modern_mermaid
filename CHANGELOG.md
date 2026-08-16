# Changelog

All notable changes to this project are documented here. This project adheres to
[Semantic Versioning](https://semver.org/).

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

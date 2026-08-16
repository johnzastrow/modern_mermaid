# Changelog

All notable changes to this project are documented here. This project adheres to
[Semantic Versioning](https://semver.org/).

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

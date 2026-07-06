# Changelog

All notable changes to this project are documented here. This project adheres to
[Semantic Versioning](https://semver.org/).

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

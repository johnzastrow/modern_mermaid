# Security Policy

## Supported versions

| Version | Supported |
|---|---|
| 1.3.x | Yes |
| Earlier, and unreleased `main` / `edge` images | No; upgrade to the latest release |

## Reporting a vulnerability

Please report suspected vulnerabilities **privately** — do not open a public
issue for a security problem.

- Preferred: open a [GitHub private security advisory](https://github.com/johnzastrow/modern_mermaid/security/advisories/new).
- Include: affected version/commit, reproduction steps, impact, and any
  suggested remediation.

You can expect an acknowledgement within a few days. Once a fix is available it
will be released and the advisory published.

## Scope and threat model

The diagram editor runs entirely in the browser and renders user-supplied
Mermaid text; the server never receives diagrams. A small backend stores one
shared theme library. The design assumes the app may be exposed to the internet
behind a TLS reverse proxy.

Trust boundaries:

1. **Diagram and theme input in the browser** (pasted text, share links,
   imported theme files, and the shared library fetched from the server). All
   of it is treated as untrusted: Mermaid runs with `securityLevel: 'strict'`,
   and every theme passes through one allowlist-and-sanitize path before it
   reaches the renderer.
2. **The theme API** (`/api/themes`). Reads are public. Writes are refused unless
   the operator configures an owner write token (`THEMES_WRITE_TOKEN`) or, for a
   LAN instance behind an IP allowlist, anonymous writes. The default is
   read-only. See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md).
3. **The host running the containers**, protected by the container hardening
   below.

Reports most relevant to this project include:

- Cross-site scripting (XSS) or CSS/style injection via diagram or theme input.
- Bypasses of the Content-Security-Policy shipped in `nginx.conf`.
- Writing to the theme library without the configured token, or any way to make
  the backend read or write outside its data file.
- Escaping or abusing the containers' resource limits.
- Supply-chain issues in dependencies, base images, or the build and release
  pipeline.

Out of scope:

- Deployments that deliberately weaken the shipped configuration (removing the
  CSP, publishing the app on `0.0.0.0` without a proxy, enabling anonymous
  writes on a public instance).
- Volumetric denial of service; rate limits are per client and assume an
  upstream proxy or CDN for large-scale abuse.
- Theft of the write token from a browser the attacker already controls.

## Hardening built in

**Application**
- Mermaid runs with `securityLevel: 'strict'`, set last so no theme can relax it.
- A strict `Content-Security-Policy` with no external origins, plus
  `X-Frame-Options`, `nosniff`, `Referrer-Policy`, `Permissions-Policy` and
  cross-origin isolation headers (`nginx.conf`).
- Themes from every source (share links, files, the server, localStorage) are
  allowlisted and their CSS sanitized before rendering. The sanitizer resolves
  CSS escapes and comments first; the CSP remains the primary control.

**Theme API**
- Writes are off by default. The owner token is compared in constant time; it
  must be at least 32 characters with at least 10 distinct characters, and
  startup fails otherwise.
- Every write carries the version the browser last saw (`If-Match`), so a stale
  browser cannot overwrite newer data, and a browser that has not fetched the
  library this session never writes. The previous version is kept as
  `themes.json.bak`.
- Authorization is checked before the request body is read. Bodies are capped
  at 4 MB, must be `application/json`, and must be an object of at most 500
  themes. Writes are serialized and atomic. Reads are served from memory.
- nginx rate-limits reads and writes and caps concurrent connections per client, allows only `GET`, `HEAD` and
  `PUT` on `/api` and only `GET`/`HEAD` elsewhere, and bounds request timeouts.

**Containers**
- Non-root users, all Linux capabilities dropped, `no-new-privileges`, read-only
  root filesystems, and memory, CPU and process limits.
- Published on `127.0.0.1` by default so only a local reverse proxy can connect.
- Base images pinned by digest.

**Supply chain**
- GitHub Actions pinned to full commit SHAs. Dependabot updates npm packages,
  actions, and both Dockerfiles' base images.
- Dependency install scripts are blocked by default (pnpm `onlyBuiltDependencies`).
- CI runs lint, unit, backend and browser tests, `pnpm audit`, CodeQL, a compose
  smoke test, and a Trivy image scan that fails on fixable HIGH/CRITICAL issues.
- Images are pushed by digest, scanned, signed with cosign (keyless) and
  attested (SBOM, SLSA provenance) before any tag points at them. Releases must
  be tagged on a commit in `main`; release files have SHA-256 checksums and
  GitHub build provenance. Only releases move `latest`.

## Known, accepted advisories (1.3.1)

These have no fix that the depending package's version range allows. None is
reachable from a request to a running instance.

| Package | Severity | Where | Why accepted |
|---|---|---|---|
| `katex` (via mermaid) | Low | Browser | Requires pre-existing prototype pollution; fixed only in 0.18, outside mermaid's `^0.16` range |
| `glob` (via workbox-build) | Moderate | Build only | Used at build time on repository files |
| `minimatch` (via eslint) | Moderate | Lint only | Development tool on repository files |
| `deepmerge` (via workbox-build) | Low | Build only | No patched release published yet |

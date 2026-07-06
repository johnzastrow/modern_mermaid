# Security Policy

## Supported versions

This is a self-hosted, single-page application with no backend and no
authentication. Only the latest `main` (and the most recent tagged release) is
supported; please run a current build.

## Reporting a vulnerability

Please report suspected vulnerabilities **privately** — do not open a public
issue for a security problem.

- Preferred: open a [GitHub private security advisory](https://github.com/johnzastrow/modern_mermaid/security/advisories/new).
- Include: affected version/commit, reproduction steps, impact, and any
  suggested remediation.

You can expect an acknowledgement within a few days. Once a fix is available it
will be released and the advisory published.

## Scope and threat model

The app runs entirely in the browser and renders user-supplied Mermaid text.
The primary trust boundary is **untrusted diagram/theme input** that is parsed
and rendered client-side. Reports most relevant to this project include:

- Cross-site scripting (XSS) or CSS/style injection via diagram or theme input.
- Bypasses of the Content-Security-Policy shipped in `nginx.conf`.
- Supply-chain issues in dependencies (see automated Dependabot + `pnpm audit`
  in CI).

Out of scope: issues that require a modified/self-hosted deployment to
deliberately weaken the shipped configuration (e.g. removing CSP headers).

## Hardening built in

- Mermaid runs with `securityLevel: 'strict'`.
- A strict `Content-Security-Policy` with no external origins (`nginx.conf`).
- The container runs as a non-root user with dropped capabilities.
- Dependency install scripts are blocked by default (pnpm `onlyBuiltDependencies`).
- CI runs lint, tests, `pnpm audit`, and CodeQL; Dependabot keeps deps current.

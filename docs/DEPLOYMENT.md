# Deploying modern_mermaid

This guide covers running a release on your own server, including on the public
internet. For the threat model and how to report a vulnerability, see
[SECURITY.md](../SECURITY.md).

## What runs

| Container | Image | Purpose |
|---|---|---|
| `modern-mermaid` | `ghcr.io/johnzastrow/modern_mermaid` | nginx serving the static app, plus `/api/*` proxy and rate limits |
| `modern-mermaid-themes` | `ghcr.io/johnzastrow/modern_mermaid-themes` | Stores the shared theme library as one JSON file on a volume |

Request path:

```
browser --HTTPS--> your reverse proxy (TLS) --HTTP--> 127.0.0.1:<MM_PORT> nginx --> themes backend (compose network only)
```

The diagram editor itself runs entirely in the browser. The server never sees
diagram text.

## Image tags

| Tag | Meaning |
|---|---|
| `1.3.2` | One release. **Use this in production.** |
| `1.3` | Latest patch of the 1.3 line |
| `latest` | Latest release |
| `edge`, `sha-<short>` | Builds of `main`; unreleased, for testing only |

## Settings

Put these in a `.env` file next to the compose file (`chmod 600 .env`).

| Variable | Default | Meaning |
|---|---|---|
| `MM_VERSION` | `1.3.2` | Release to run (deploy compose file only) |
| `MM_BIND` | `127.0.0.1` | Host address the app is published on. Keep the default when a reverse proxy runs on the same host. Use `0.0.0.0` only on a trusted network. |
| `MM_PORT` | `8080` | Host port |
| `THEMES_WRITE_TOKEN` | unset | Owner write token for the shared theme library, at least 32 characters. Required for writes on an internet-facing instance. |
| `THEMES_ALLOW_ANON_WRITE` | `false` | `true` lets anyone who can reach `/api` write the library. Only for a LAN instance behind an IP allowlist. Cannot be combined with a token. |

### Who can write the shared theme library

| Configuration | Result |
|---|---|
| Neither variable set | Read-only. Everyone sees the shared library; nobody can change it. |
| `THEMES_WRITE_TOKEN` set | Only browsers holding the token can save to it. Everyone else saves to their own browser only. |
| `THEMES_ALLOW_ANON_WRITE=true` | Anyone who can reach the site can overwrite it. |

Generate a random token (the server refuses short or low-variety tokens) and
enter it once in the app (Theme editor, "Shared library"):

```bash
openssl rand -hex 32     # 64 hex characters
```

The token is stored in that browser's localStorage. Use "Forget" on shared
computers. To revoke it, change `THEMES_WRITE_TOKEN` and recreate the
`themes-backend` container.

## Install a release

```bash
mkdir -p ~/stacks/modern-mermaid && cd ~/stacks/modern-mermaid
curl -fsSLO https://raw.githubusercontent.com/johnzastrow/modern_mermaid/v1.3.2/docker-compose.deploy.yml
umask 077
cat > .env <<EOF
MM_VERSION=1.3.2
MM_PORT=8080
THEMES_WRITE_TOKEN=$(openssl rand -hex 32)
EOF
docker compose -f docker-compose.deploy.yml up -d
docker compose -f docker-compose.deploy.yml ps     # both containers "healthy"
```

### Verify the images

Release images are signed with cosign (keyless, through GitHub's OIDC identity)
and carry provenance attestations. Verify before the first deploy and after each
upgrade:

```bash
cosign verify ghcr.io/johnzastrow/modern_mermaid:1.3.2 \
  --certificate-identity https://github.com/johnzastrow/modern_mermaid/.github/workflows/_images.yml@refs/tags/v1.3.2 \
  --certificate-oidc-issuer https://token.actions.githubusercontent.com
gh attestation verify oci://ghcr.io/johnzastrow/modern_mermaid:1.3.2 --repo johnzastrow/modern_mermaid
```

The identity pins the exact workflow and release tag that signed the image, so a
signature made by any other workflow or branch does not verify. Repeat both
commands for `modern_mermaid-themes`. For the strongest guarantee,
pin the digest from the release notes instead of the tag
(`image: ghcr.io/johnzastrow/modern_mermaid@sha256:...`).

## Reverse proxy: internet-facing (Caddy)

```caddy
mermaid.example.com {
	encode zstd gzip
	header {
		Strict-Transport-Security "max-age=31536000; includeSubDomains"
		-Server
	}
	reverse_proxy 127.0.0.1:8080
}
```

Caddy sets `X-Forwarded-For`, which nginx uses to apply its rate limits per
client:

| Path | Limit per client IP |
|---|---|
| Static files | 50 requests/s (burst 100) |
| `/api/*` reads | 10 requests/s (burst 20) |
| `/api/themes` writes | 12 per minute (burst 10) |
| Concurrent connections | 30 |

Over the limit, nginx answers `429`. Other proxies (Traefik, nginx) work the same
way. Keep the app on `127.0.0.1` so the proxy is the only way in. nginx trusts
`X-Forwarded-For` only from private addresses.

## Reverse proxy: LAN or tailnet only (Caddy)

Use this for a private instance, for example with `THEMES_ALLOW_ANON_WRITE=true`:

```caddy
mermaid.lan.example.com {
	@allowed remote_ip 192.168.1.0/24 100.64.0.0/10
	handle @allowed {
		reverse_proxy 127.0.0.1:6080
	}
	handle {
		respond 403
	}
}
```

## Upgrade

```bash
cd ~/stacks/modern-mermaid
sed -i 's/^MM_VERSION=.*/MM_VERSION=<new>/' .env
# verify the new images (see above), then:
docker compose -f docker-compose.deploy.yml pull
docker compose -f docker-compose.deploy.yml up -d
```

The theme library lives in the `themes-data` volume and survives upgrades. The
backend also keeps the version before the most recent save as `themes.json.bak`
in the same volume.

## Back up the theme library

```bash
docker run --rm -v modern-mermaid_themes-data:/data:ro -v "$PWD":/out alpine \
  cp /data/themes.json /out/themes-$(date +%F).json
```

(The volume name is `<compose project>_themes-data`; check it with `docker volume ls`.)

## Static hosting without Docker

Each release has `modern-mermaid-<version>-dist.zip`, the built site. Serve it
with any web server. Copy the security headers from
[nginx.conf](../nginx.conf), especially the Content-Security-Policy. Without the
theme backend the app keeps themes in each browser only.

Check the download first:

```bash
sha256sum -c SHA256SUMS --ignore-missing
gh attestation verify modern-mermaid-1.3.2-dist.zip --repo johnzastrow/modern_mermaid
```

# syntax=docker/dockerfile:1
# Theme-persistence backend for modern_mermaid. Dependency-free Node service.
# Base image pinned by digest; Dependabot (docker ecosystem, /server) proposes updates.
FROM node:24-alpine@sha256:8a32c8cf649a49915a66e81e7a609223c708d0adabf288ee3f4077d765542f85 AS runtime
WORKDIR /app
COPY themes-server.mjs ./
# Apply Alpine security fixes published after the pinned base was built, and
# remove the bundled package managers: the server has no dependencies, so
# npm, npx, corepack and yarn are unused attack surface (and scanner noise).
RUN apk upgrade --no-cache \
 && rm -rf /usr/local/lib/node_modules /opt/yarn-* \
      /usr/local/bin/npm /usr/local/bin/npx /usr/local/bin/corepack \
      /usr/local/bin/yarn /usr/local/bin/yarnpkg
# /data holds the single themes.json document; a volume is mounted here at runtime.
# Pre-create it owned by the unprivileged `node` user so writes succeed as non-root.
RUN mkdir -p /data && chown -R node:node /data
# Writes are off unless the deployment sets THEMES_WRITE_TOKEN (internet-facing)
# or THEMES_ALLOW_ANON_WRITE=true (LAN behind an allowlist). See docs/DEPLOYMENT.md.
ENV THEMES_FILE=/data/themes.json \
    PORT=8090 \
    HOST=0.0.0.0 \
    NODE_ENV=production
USER node
EXPOSE 8090
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -qO- http://127.0.0.1:8090/healthz >/dev/null 2>&1 || exit 1
CMD ["node", "themes-server.mjs"]

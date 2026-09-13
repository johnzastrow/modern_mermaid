# syntax=docker/dockerfile:1
# Theme-persistence backend for modern_mermaid. Dependency-free Node service.
FROM node:24-alpine AS runtime
WORKDIR /app
COPY themes-server.mjs ./
# /data holds the single themes.json document; a volume is mounted here at runtime.
# Pre-create it owned by the unprivileged `node` user so writes succeed as non-root.
RUN mkdir -p /data && chown -R node:node /data
ENV THEMES_FILE=/data/themes.json \
    PORT=8090 \
    HOST=0.0.0.0
USER node
EXPOSE 8090
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -qO- http://127.0.0.1:8090/healthz >/dev/null 2>&1 || exit 1
CMD ["node", "themes-server.mjs"]

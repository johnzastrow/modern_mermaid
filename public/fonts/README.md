# Bundled fonts

All fonts are served from this app; no font is loaded from a third-party host.

| Family | Files | Source | License |
|---|---|---|---|
| Excalifont | `excalifont/*.woff2` (7 unicode-range slices) | `@excalidraw/excalidraw` 0.18.1, `dist/prod/fonts` | SIL OFL 1.1 |
| Xiaolai | `xiaolai/*.woff2` (205 unicode-range slices) | `@excalidraw/excalidraw` 0.18.1, `dist/prod/fonts` | SIL OFL 1.1 |
| Inter, JetBrains Mono, Caveat, Patrick Hand, Nunito, Open Sans | emitted by Vite into `assets/` | `@fontsource/*` 5.3.0 packages | SIL OFL 1.1 (license in each package) |

The `@font-face` rules for Excalifont and Xiaolai, with the unicode ranges
Excalidraw publishes for each slice, are in `src/fonts-handdrawn.css`. They are
loaded only when a diagram uses those families. See `OFL.txt` for the license.

Noto Sans SC and Noto Serif SC are not bundled; `src/fonts.css` maps those names
to the CJK fonts installed on the visitor's system.

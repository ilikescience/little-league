# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Is

Little League is a color theme with three variants (Dark, Darker, Light) targeting multiple editors and terminals: VS Code, Zed, iTerm, and Ghostty. Design tokens are stored in OKLCH (DTCG format) and compiled via [Terrazzo](https://terrazzo.ds) into format-specific theme files.

## Commands

```bash
npm run build              # Build all theme variants for all targets
npm run build:dark         # Build only dark variant
npm run build:darker       # Build only darker variant
npm run build:light        # Build only light variant
npm run watch              # Watch and rebuild on change
npm run test               # Build and verify outputs match committed snapshots
npm run publish:vscode     # Publish VS Code extension to Marketplace
```

To test the VS Code theme, use the Extension Host launch config (F5) — it points to `targets/vscode/`.
To test the Zed theme, use "zed: install dev extension" pointing to `targets/zed/`.
To install Ghostty themes: `cp targets/ghostty/* ~/.config/ghostty/themes/`

## Architecture

### Directory Structure

```
tokens/                    # DTCG design tokens in OKLCH color space
plugins/                   # Terrazzo plugins (shared transform + per-format builders)
terrazzo.config.*.mjs      # One config per theme variant (dark, darker, light)
targets/                   # All output formats as peers
  vscode/                  # VS Code extension (package.json, themes/, images/)
  zed/                     # Zed extension (extension.toml, themes/)
  iterm/                   # iTerm .itermcolors files
  ghostty/                 # Ghostty theme files
```

### Token Pipeline

1. **Token sources** (`tokens/`) — DTCG-format JSON files with colors in OKLCH color space
2. **Terrazzo configs** (`terrazzo.config.*.mjs`) — one per variant, selects background tokens. Shared token list in `terrazzo.shared.mjs`.
3. **Core transform** (`plugins/core-transform.mjs`) — converts OKLCH/sRGB to hex, registers transforms under `format: "core"`
4. **Format plugins** — each reads core transforms and builds target-specific output:
   - `plugins/vscode-theme.mjs` → `targets/vscode/themes/*.color-theme.json`
   - `plugins/zed-theme.mjs` → `targets/zed/themes/*.json`
   - `plugins/iterm-theme.mjs` → `targets/iterm/*.itermcolors`
   - `plugins/ghostty-theme.mjs` → `targets/ghostty/*`

### Token Organization

- `tokens/core.tokens.json` — primitive color palette in OKLCH (aqua, green, yellow, etc. in 10-step scales)
- `tokens/dark/`, `tokens/darker/`, `tokens/light/` — theme-specific semantic tokens (background, border, font)
- `tokens/application/` — VS Code UI component mappings (activityBar, editor, statusBar, etc.)
- `tokens/syntax/` — syntax highlighting scopes (comment, keyword, string, etc.)

### Color Space

Tokens are stored in **OKLCH** (perceptually uniform color space) per the DTCG specification:
```json
{ "colorSpace": "oklch", "components": [L, C, H], "alpha": 1 }
```
- L = lightness (0–1), C = chroma (0–~0.37), H = hue (0–360°)

Conversion to hex happens at build time in `plugins/color-utils.mjs` via the OKLab intermediary. All output formats receive hex values.

### Semantic Token Scales

Ordered semantic tokens use a **0–1000 numeric scale** (like CSS font-weight):
- **500** = default/most-common value
- Steps at **100** intervals
- Higher number = more prominent/emphasized

### Theme Variant Differences

The three `terrazzo.config.*.mjs` files differ only in which background token files they include:
- **Dark**: `tokens/dark/background.tokens.json` + dark border/font
- **Darker**: `tokens/darker/background.tokens.json` + dark border/font, plus `variant: "er"`
- **Light**: `tokens/light/` background/border/font

### Shared Utilities (`plugins/color-utils.mjs`)

- `colorToHex(dtcgColor)` — converts DTCG color objects (OKLCH or sRGB) to hex strings
- `oklchToSrgb(L, C, H)` / `srgbToOklch(r, g, b)` — color space conversion
- `hexToRgbFloats(hex)` — parse hex to RGB floats (used by iTerm plugin)

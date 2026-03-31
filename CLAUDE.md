# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Is

Little League is a VS Code color theme extension with three variants: Dark, Darker, and Light. It uses [Terrazzo](https://terrazzo.ds) (DTCG design token tooling) to compile design tokens into VS Code `.color-theme.json` files.

## Commands

```bash
npm run build              # Build all three theme variants
npm run build:dark         # Build only dark theme
npm run build:darker       # Build only darker theme
npm run build:light        # Build only light theme
npm run watch              # Watch all three configs and rebuild on change
npm run publish            # Publish to VS Code Marketplace (runs build first via prepublishOnly)
```

To test the theme in VS Code, use the Extension Host launch config (F5 or Run > Start Debugging).

## Architecture

### Token Pipeline

Design tokens flow through this pipeline:

1. **Token sources** (`tokens/`) — DTCG-format JSON files defining colors
2. **Terrazzo configs** (`terrazzo.config.*.mjs`) — one per theme variant, each selects different token sources for backgrounds. Shared application/syntax token list is in `terrazzo.shared.mjs`.
3. **Custom plugin** (`plugins/vscode-theme.mjs`) — transforms DTCG color values to hex and builds VS Code theme JSON
4. **Output** (`themes/`) — generated `.color-theme.json` files (committed to repo)

### Token Organization

- `tokens/core.tokens.json` — primitive color palette (aqua, green, yellow, etc. in 10-step scales)
- `tokens/dark/`, `tokens/darker/`, `tokens/light/` — theme-specific semantic tokens (background, border, font)
- `tokens/application/` — VS Code UI component mappings (activityBar, editor, statusBar, etc.)
- `tokens/syntax/` — syntax highlighting scopes (comment, keyword, string, etc.)

### Semantic Token Scales

Ordered semantic tokens use a **0–1000 numeric scale** (like CSS font-weight):
- **500** = default/most-common value
- Steps at **100** intervals
- Higher number = more prominent/emphasized

Examples: `surface.500` (base editor bg), `font.primary.500` (standard text), `border.primary.500` (standard border)

### Theme Variant Differences

The three `terrazzo.config.*.mjs` files differ only in which background token files they include and the plugin options:
- **Dark**: uses `tokens/dark/background.tokens.json` + dark border/font
- **Darker**: uses `tokens/darker/background.tokens.json` + dark border/font, plus `variant: "er"` in plugin options
- **Light**: uses `tokens/light/` background/border/font

### Plugin Behavior

`plugins/vscode-theme.mjs` handles:
- Converting DTCG color objects to hex (prefers sRGB components over hex property)
- Routing `syntax.*` tokens to `tokenColors` array (TextMate scopes)
- Routing other tokens to `colors` object (VS Code UI colors)
- Skipping `color.*` tokens (primitives used only as references)

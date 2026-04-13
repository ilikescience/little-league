/**
 * Terrazzo plugin for generating Ghostty terminal theme files.
 * Reads terminal color transforms registered by the VS Code theme plugin.
 */

import { stripAlpha } from "./color-utils.mjs";

/** Ordered ANSI palette token IDs (indices 0–15) */
const PALETTE_TOKENS = [
  "terminal.ansiBlack",
  "terminal.ansiRed",
  "terminal.ansiGreen",
  "terminal.ansiYellow",
  "terminal.ansiBlue",
  "terminal.ansiMagenta",
  "terminal.ansiCyan",
  "terminal.ansiWhite",
  "terminal.ansiBrightBlack",
  "terminal.ansiBrightRed",
  "terminal.ansiBrightGreen",
  "terminal.ansiBrightYellow",
  "terminal.ansiBrightBlue",
  "terminal.ansiBrightMagenta",
  "terminal.ansiBrightCyan",
  "terminal.ansiBrightWhite",
];

/**
 * @param {Object} options
 * @param {string} options.name - Theme name prefix (e.g., "Little League")
 * @param {string[]} options.modes - Theme modes to generate (e.g., ["dark"])
 * @param {string} [options.variant] - Optional variant suffix (e.g., "er" for "darker")
 */
export default function ghosttyTheme(options = {}) {
  const { name = "Theme", modes = ["dark"], variant = "" } = options;

  return {
    name: "ghostty-theme",

    async build({ getTransforms, outputFile }) {
      for (const mode of modes) {
        const transforms = getTransforms({ format: "core", mode: "." });
        const colors = {};
        for (const t of transforms) {
          colors[t.id] = t.value;
        }

        const modeCapitalized =
          mode.charAt(0).toUpperCase() + mode.slice(1);
        const themeName = variant
          ? `${name} ${modeCapitalized}${variant}`
          : `${name} ${modeCapitalized}`;

        const lines = [
          `# ${themeName}`,
          `# Generated from design tokens by the Little League build pipeline.`,
          ``,
        ];

        // Core colors
        if (colors["terminal.background"])
          lines.push(`background = ${stripAlpha(colors["terminal.background"])}`);
        if (colors["terminal.foreground"])
          lines.push(`foreground = ${stripAlpha(colors["terminal.foreground"])}`);
        if (colors["terminalCursor.foreground"])
          lines.push(
            `cursor-color = ${stripAlpha(colors["terminalCursor.foreground"])}`
          );
        if (colors["terminalCursor.background"])
          lines.push(
            `cursor-text = ${stripAlpha(colors["terminalCursor.background"])}`
          );
        if (colors["terminal.selectionBackground"])
          lines.push(
            `selection-background = ${stripAlpha(colors["terminal.selectionBackground"])}`
          );
        if (colors["terminal.foreground"])
          lines.push(
            `selection-foreground = ${stripAlpha(colors["terminal.foreground"])}`
          );

        // ANSI palette
        lines.push(``);
        for (let i = 0; i < PALETTE_TOKENS.length; i++) {
          const hex = colors[PALETTE_TOKENS[i]];
          if (hex) lines.push(`palette = ${i}=${stripAlpha(hex)}`);
        }

        lines.push(``); // trailing newline

        const filename = `ghostty/${themeName}`;
        outputFile(filename, lines.join("\n"));
      }
    },
  };
}

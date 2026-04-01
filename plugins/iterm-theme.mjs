/**
 * Terrazzo plugin for generating iTerm2 color scheme files (.itermcolors)
 * Reads terminal color transforms registered by the VS Code theme plugin.
 */

import { hexToRgbFloats } from "./color-utils.mjs";

/** Map VS Code terminal token IDs to iTerm plist color keys */
const TOKEN_TO_ITERM = {
  "terminal.ansiBlack": "Ansi 0 Color",
  "terminal.ansiRed": "Ansi 1 Color",
  "terminal.ansiGreen": "Ansi 2 Color",
  "terminal.ansiYellow": "Ansi 3 Color",
  "terminal.ansiBlue": "Ansi 4 Color",
  "terminal.ansiMagenta": "Ansi 5 Color",
  "terminal.ansiCyan": "Ansi 6 Color",
  "terminal.ansiWhite": "Ansi 7 Color",
  "terminal.ansiBrightBlack": "Ansi 8 Color",
  "terminal.ansiBrightRed": "Ansi 9 Color",
  "terminal.ansiBrightGreen": "Ansi 10 Color",
  "terminal.ansiBrightYellow": "Ansi 11 Color",
  "terminal.ansiBrightBlue": "Ansi 12 Color",
  "terminal.ansiBrightMagenta": "Ansi 13 Color",
  "terminal.ansiBrightCyan": "Ansi 14 Color",
  "terminal.ansiBrightWhite": "Ansi 15 Color",
};

function colorEntry(key, hex) {
  const { r, g, b, a } = hexToRgbFloats(hex);
  const alphaEntry =
    a < 1
      ? `\n\t\t\t<key>Alpha Component</key>\n\t\t\t<real>${a}</real>`
      : "";
  return `\t\t<key>${key}</key>
\t\t<dict>${alphaEntry}
\t\t\t<key>Blue Component</key>
\t\t\t<real>${b}</real>
\t\t\t<key>Green Component</key>
\t\t\t<real>${g}</real>
\t\t\t<key>Red Component</key>
\t\t\t<real>${r}</real>
\t\t</dict>`;
}

/**
 * @param {Object} options
 * @param {string} options.name - Theme name prefix (e.g., "Little League")
 * @param {string[]} options.modes - Theme modes to generate (e.g., ["dark"])
 * @param {string} [options.variant] - Optional variant suffix (e.g., "er" for "darker")
 */
export default function itermTheme(options = {}) {
  const { name = "Theme", modes = ["dark"], variant = "" } = options;

  return {
    name: "iterm-theme",

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

        // Build ANSI color entries
        const ansiEntries = Object.entries(TOKEN_TO_ITERM)
          .map(([tokenId, itermKey]) => {
            const hex = colors[tokenId];
            return hex ? colorEntry(itermKey, hex) : null;
          })
          .filter(Boolean);

        // Build UI color entries
        const uiEntries = [
          colors["terminal.background"] &&
            colorEntry("Background Color", colors["terminal.background"]),
          colors["terminal.foreground"] &&
            colorEntry("Foreground Color", colors["terminal.foreground"]),
          colors["terminal.foreground"] &&
            colorEntry("Bold Color", colors["terminal.foreground"]),
          colors["terminal.selectionBackground"] &&
            colorEntry(
              "Selection Color",
              colors["terminal.selectionBackground"]
            ),
          colors["terminal.background"] &&
            colorEntry(
              "Selected Text Color",
              colors["terminal.background"]
            ),
          colors["terminalCursor.foreground"] &&
            colorEntry("Cursor Color", colors["terminalCursor.foreground"]),
          colors["terminalCursor.background"] &&
            colorEntry(
              "Cursor Text Color",
              colors["terminalCursor.background"]
            ),
        ].filter(Boolean);

        const xml = `<?xml version="1.0" encoding="UTF-8"?>
<!--

    Name:       ${themeName}
    Author:     Matt Strom (https://github.com/ilikescience)

    Generated from design tokens by the Little League build pipeline.

-->
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
\t<dict>
${[...ansiEntries, ...uiEntries].join("\n")}
\t</dict>
</plist>
`;

        const filename = `iterm/${themeName}.itermcolors`;
        outputFile(filename, xml);
      }
    },
  };
}

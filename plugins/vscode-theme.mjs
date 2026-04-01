/**
 * Terrazzo plugin for generating VS Code theme files.
 * Build-only — reads transforms from core-transform plugin.
 */

/**
 * @param {Object} options
 * @param {string} options.name - Theme name prefix (e.g., "Little League")
 * @param {string[]} options.modes - Theme modes to generate (e.g., ["dark", "light"])
 * @param {string} [options.variant] - Optional variant suffix (e.g., "er" for "darker")
 * @returns {import("@terrazzo/cli").Plugin}
 */
export default function vscodeTheme(options = {}) {
  const { name = "Theme", modes = ["dark", "light"], variant = "" } = options;

  return {
    name: "vscode-theme",

    async build({ tokens, getTransforms, outputFile }) {
      for (const mode of modes) {
        const modeCapitalized = mode.charAt(0).toUpperCase() + mode.slice(1);
        const themeName = variant
          ? `${name} ${modeCapitalized}${variant}`
          : `${name} ${modeCapitalized}`;
        const theme = {
          name: themeName,
          type: mode,
          colors: {},
          tokenColors: [],
        };

        // Get all transforms for the default mode (we run separate builds per mode)
        const transforms = getTransforms({
          format: "core",
          mode: ".",
        });

        // Process each token
        for (const transform of transforms) {
          const id = transform.id;
          const value = transform.value;

          // Skip core color tokens and semantic tokens - they're only used as references
          if (id.startsWith("color.")) continue;

          // Syntax tokens go to tokenColors
          if (id.startsWith("syntax.")) {
            const scope = convertSyntaxIdToScope(id);
            const fontStyle = transform.fontStyle;

            theme.tokenColors.push({
              scope: scope,
              settings: {
                foreground: value,
                ...(fontStyle && { fontStyle }),
              },
            });
          }
          // Application tokens go to colors
          else {
            if (id && value) {
              theme.colors[id] = value;
            }
          }
        }

        // Sort colors alphabetically for consistency
        const sortedColors = {};
        for (const key of Object.keys(theme.colors).sort()) {
          sortedColors[key] = theme.colors[key];
        }
        theme.colors = sortedColors;

        // Sort tokenColors by scope for consistency
        theme.tokenColors.sort((a, b) => a.scope.localeCompare(b.scope));

        const filename = variant
          ? `vscode/themes/little-league-${mode}${variant.toLowerCase()}.color-theme.json`
          : `vscode/themes/little-league-${mode}.color-theme.json`;
        outputFile(filename, JSON.stringify(theme, null, 2));
      }
    },
  };
}

/**
 * Convert syntax token ID to VS Code scope
 * e.g., "syntax.comment.line" -> "comment.line"
 * Handles wildcard tokens: "syntax.comment.*" -> "comment"
 * @param {string} id
 * @returns {string}
 */
function convertSyntaxIdToScope(id) {
  // Remove "syntax." prefix
  let scope = id.replace(/^syntax\./, "");

  // Handle wildcard: remove trailing ".*" or just "*"
  if (scope.endsWith(".*")) {
    scope = scope.slice(0, -2);
  } else if (scope.endsWith("*")) {
    // If it's just "comment.*" it becomes "comment"
    scope = scope.slice(0, -1);
    if (scope.endsWith(".")) {
      scope = scope.slice(0, -1);
    }
  }

  return scope;
}

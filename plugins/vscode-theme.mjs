/**
 * Terrazzo plugin for generating VS Code theme files
 * Generates little-league-dark.color-theme.json and little-league-light.color-theme.json
 */

/**
 * Convert DTCG color value to hex string with alpha
 * @param {Object} color - DTCG color object
 * @returns {string} - Hex color string
 */
function colorToHex(color) {
  if (!color || typeof color !== "object") {
    return color;
  }

  let hex = "";

  // Prefer converting from sRGB components
  if (color.components && color.colorSpace === "srgb") {
    const [r, g, b] = color.components.map((c) =>
      Math.round(c * 255)
        .toString(16)
        .padStart(2, "0")
    );
    hex = `#${r}${g}${b}`;
  }

  // Fall back to hex if no components
  if (!hex && color.hex) {
    hex = color.hex;
  }

  // Add alpha if present and not 1
  if (color.alpha !== undefined && color.alpha !== 1) {
    const alphaHex = Math.round(color.alpha * 255)
      .toString(16)
      .padStart(2, "0");
    hex = hex + alphaHex;
  }

  return hex;
}

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

    async transform({ tokens, setTransform }) {
      for (const [id, token] of Object.entries(tokens)) {
        // Skip non-color tokens
        if (token.$type !== "color") continue;

        // Transform each mode
        if (token.mode) {
          for (const [modeName, modeToken] of Object.entries(token.mode)) {
            const value = modeToken.$value;
            const hexValue = colorToHex(value);

            if (hexValue) {
              setTransform(id, {
                format: "vscode",
                localID: id,
                value: hexValue,
                mode: modeName,
                fontStyle: modeToken.originalValue?.$extensions?.fontStyle,
              });
            }
          }
        }
      }
    },

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
          format: "vscode",
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
            const colorKey = convertIdToColorKey(id);
            if (colorKey && value) {
              theme.colors[colorKey] = value;
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
          ? `little-league-${mode}${variant.toLowerCase()}.color-theme.json`
          : `little-league-${mode}.color-theme.json`;
        outputFile(filename, JSON.stringify(theme, null, 2));
      }
    },
  };
}

/**
 * Convert token ID to VS Code color key
 * e.g., "activityBar.background" -> "activityBar.background"
 * @param {string} id
 * @returns {string}
 */
function convertIdToColorKey(id) {
  // Token IDs are already in the right format
  return id;
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

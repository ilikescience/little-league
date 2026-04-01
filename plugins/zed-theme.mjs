/**
 * Terrazzo plugin for generating Zed editor theme files.
 * Reads color transforms registered by the VS Code theme plugin and maps them
 * to Zed's theme schema (v0.2.0).
 */

/** Map VS Code terminal token IDs to Zed terminal.ansi keys */
const ANSI_TOKEN_TO_ZED = {
  "terminal.ansiBlack": "black",
  "terminal.ansiRed": "red",
  "terminal.ansiGreen": "green",
  "terminal.ansiYellow": "yellow",
  "terminal.ansiBlue": "blue",
  "terminal.ansiMagenta": "magenta",
  "terminal.ansiCyan": "cyan",
  "terminal.ansiWhite": "white",
  "terminal.ansiBrightBlack": "bright_black",
  "terminal.ansiBrightRed": "bright_red",
  "terminal.ansiBrightGreen": "bright_green",
  "terminal.ansiBrightYellow": "bright_yellow",
  "terminal.ansiBrightBlue": "bright_blue",
  "terminal.ansiBrightMagenta": "bright_magenta",
  "terminal.ansiBrightCyan": "bright_cyan",
  "terminal.ansiBrightWhite": "bright_white",
};

/**
 * Map Zed syntax keys to VS Code TextMate scopes.
 * The VS Code transforms store syntax tokens as "syntax.<scope>" IDs.
 * We strip the "syntax." prefix to get the scope, then match here.
 */
const SYNTAX_SCOPE_MAP = {
  attribute: "entity.other.attribute-name",
  boolean: "constant.language.boolean.true",
  comment: "comment",
  "comment.doc": "comment.block.documentation",
  constant: "constant.numeric",
  constructor: "entity.name.function",
  function: "entity.name.function",
  "function.method": "entity.name.function",
  keyword: "keyword",
  label: "entity.name.tag.yaml",
  link_text: "markup.underline.link",
  link_uri: "markup.underline.link",
  number: "constant.numeric",
  operator: "keyword.operator",
  property: "support.type.property-name",
  punctuation: "punctuation.separator",
  "punctuation.bracket": "meta.brace.round",
  "punctuation.delimiter": "punctuation.separator",
  "punctuation.list_marker": "punctuation.definition.list",
  "punctuation.special": "punctuation.definition.template-expression",
  string: "string",
  "string.escape": "string",
  "string.regex": "string",
  "string.special": "string",
  "string.special.symbol": "constant.language.symbol",
  tag: "entity.name.tag",
  "text.literal": "markup.fenced_code",
  title: "markup.heading",
  type: "support.class",
  variable: "variable",
  "variable.special": "variable.language.this",
};

/**
 * Ensure hex color has 8 digits (RRGGBBAA) for Zed's expected format.
 * @param {string} hex - Hex color string (#RRGGBB or #RRGGBBAA)
 * @returns {string|null} 8-digit hex with alpha, or null if input is falsy
 */
function z(hex) {
  if (!hex) return null;
  if (hex.length === 7) return hex + "ff";
  return hex;
}

/**
 * Build the Zed style object from VS Code color/syntax transforms.
 * @param {Object} c - Map of VS Code color key → hex value
 * @param {Object} syntaxMap - Map of VS Code scope → { foreground, fontStyle }
 */
function buildStyle(c, syntaxMap) {
  // Build syntax highlighting (the only truly nested object in the schema)
  const syntax = {};
  for (const [zedKey, vsScope] of Object.entries(SYNTAX_SCOPE_MAP)) {
    const token = syntaxMap[vsScope];
    if (token) {
      const entry = { color: z(token.foreground) };
      if (token.fontStyle) entry.font_style = token.fontStyle;
      syntax[zedKey] = entry;
    }
  }

  // All style keys use flat dot-notation per the Zed v0.2.0 schema.
  // Only "syntax" and "players" are nested objects.
  const style = {
    // Backgrounds
    "background": z(c["editor.background"]),
    "background.appearance": "opaque",
    "elevated_surface.background": z(c["editorWidget.background"]),
    "surface.background": z(c["sideBar.background"]),
    "drop_target.background": z(c["editorGroup.dropBackground"]),

    // Borders
    "border": z(c["panel.border"]),
    "border.variant": z(c["sideBar.border"]),
    "border.focused": z(c["focusBorder"]),
    "border.selected": z(c["tab.activeBorderTop"]),
    "border.transparent": z(c["focusBorder"]),
    "border.disabled": z(c["editorWidget.border"]),

    // Interactive elements
    "element.background": z(c["button.secondaryBackground"]),
    "element.hover": z(c["list.hoverBackground"]),
    "element.active": z(c["toolbar.activeBackground"]),
    "element.selected": z(c["list.activeSelectionBackground"]),
    "element.disabled": z(c["button.secondaryBackground"]),

    "ghost_element.background": "#00000000",
    "ghost_element.hover": z(c["toolbar.hoverBackground"]),
    "ghost_element.active": z(c["toolbar.activeBackground"]),
    "ghost_element.selected": z(c["list.activeSelectionBackground"]),
    "ghost_element.disabled": "#00000000",

    // Text
    "text": z(c["foreground"]),
    "text.muted": z(c["sideBar.foreground"]),
    "text.placeholder": z(c["input.placeholderForeground"]),
    "text.disabled": z(c["disabledForeground"]),
    "text.accent": z(c["textLink.activeForeground"]),

    // Icons
    "icon": z(c["icon.foreground"]),
    "icon.muted": z(c["editorGutter.foldingControlForeground"]),
    "icon.disabled": z(c["disabledForeground"]),
    "icon.placeholder": z(c["input.placeholderForeground"]),
    "icon.accent": z(c["textLink.activeForeground"]),

    // Editor
    "editor.background": z(c["editor.background"]),
    "editor.foreground": z(c["editor.foreground"]),
    "editor.gutter.background": z(c["editorGutter.background"]),
    "editor.subheader.background": z(c["editorGroupHeader.tabsBackground"]),
    "editor.active_line.background": z(c["editor.lineHighlightBackground"]),
    "editor.highlighted_line.background": z(c["editor.rangeHighlightBackground"]),
    "editor.line_number": z(c["editorLineNumber.foreground"]),
    "editor.active_line_number": z(c["editorLineNumber.activeForeground"]),
    "editor.hover_line_number": z(c["editorLineNumber.activeForeground"]),
    "editor.invisible": z(c["editorWhitespace.foreground"]),
    "editor.wrap_guide": z(c["editorRuler.foreground"]),
    "editor.active_wrap_guide": z(c["editorIndentGuide.activeBackground1"]),
    "editor.document_highlight.read_background": z(c["editor.wordHighlightBackground"]),
    "editor.document_highlight.write_background": z(c["editor.wordHighlightStrongBackground"]),

    // Search
    "search.match_background": z(c["editor.findMatchHighlightBackground"]),
    "search.active_match_background": z(c["editor.findMatchBackground"]),

    // Tab bar
    "tab_bar.background": z(c["editorGroupHeader.tabsBackground"]),
    "tab.active_background": z(c["tab.activeBackground"]),
    "tab.inactive_background": z(c["tab.inactiveBackground"]),

    // Status bar
    "status_bar.background": z(c["statusBar.background"]),

    // Title bar
    "title_bar.background": z(c["titleBar.activeBackground"]),
    "title_bar.inactive_background": z(c["titleBar.inactiveBackground"]),

    // Toolbar
    "toolbar.background": z(c["editorGroupHeader.tabsBackground"]),

    // Panel
    "panel.background": z(c["sideBar.background"]),
    "panel.focused_border": z(c["panel.border"]),
    "pane.focused_border": z(c["editorGroup.border"]),
    "pane_group.border": z(c["editorGroup.border"]),

    // Scrollbar
    "scrollbar.thumb.background": z(c["scrollbarSlider.background"]),
    "scrollbar.thumb.hover_background": z(c["scrollbarSlider.hoverBackground"]),
    "scrollbar.thumb.border": z(c["scrollbarSlider.background"]),
    "scrollbar.track.background": z(c["scrollbar.background"]),
    "scrollbar.track.border": z(c["scrollbar.background"]),

    // Links
    "link_text.hover": z(c["textLink.foreground"]),

    // Version control
    "version_control.added": z(c["gitDecoration.addedResourceForeground"]),
    "version_control.modified": z(c["gitDecoration.modifiedResourceForeground"]),
    "version_control.deleted": z(c["gitDecoration.deletedResourceForeground"]),

    // Status indicators
    "conflict": z(c["gitDecoration.conflictingResourceForeground"]),
    "created": z(c["gitDecoration.addedResourceForeground"]),
    "deleted": z(c["gitDecoration.deletedResourceForeground"]),
    "error": z(c["editorError.foreground"]),
    "hidden": z(c["gitDecoration.ignoredResourceForeground"]),
    "hint": z(c["editorHint.foreground"]),
    "ignored": z(c["gitDecoration.ignoredResourceForeground"]),
    "info": z(c["editorInfo.foreground"]),
    "modified": z(c["gitDecoration.modifiedResourceForeground"]),
    "predictive": z(c["editorInlayHint.foreground"]),
    "renamed": z(c["gitDecoration.renamedResourceForeground"]),
    "success": z(c["editorGutter.addedBackground"]),
    "unreachable": z(c["disabledForeground"]),
    "warning": z(c["editorWarning.foreground"]),

    // Players (multiplayer cursor colors)
    "players": [
      { cursor: z(c["editorCursor.foreground"]) },
      { cursor: z(c["terminal.ansiBlue"]) },
      { cursor: z(c["terminal.ansiGreen"]) },
      { cursor: z(c["terminal.ansiYellow"]) },
      { cursor: z(c["terminal.ansiMagenta"]) },
      { cursor: z(c["terminal.ansiCyan"]) },
      { cursor: z(c["terminal.ansiRed"]) },
      { cursor: z(c["terminal.ansiBrightBlue"]) },
    ],

    // Terminal
    "terminal.background": z(c["terminal.background"]),
    "terminal.foreground": z(c["terminal.foreground"]),
    "terminal.bright_foreground": z(c["terminal.ansiBrightWhite"]),
    "terminal.dim_foreground": z(c["terminal.ansiBrightBlack"]),
  };

  // Terminal ANSI colors
  for (const [tokenId, zedKey] of Object.entries(ANSI_TOKEN_TO_ZED)) {
    if (c[tokenId]) style[`terminal.ansi.${zedKey}`] = z(c[tokenId]);
  }

  // Syntax (the one truly nested object in the schema)
  style.syntax = syntax;

  return style;
}

/**
 * @param {Object} options
 * @param {string} options.name - Theme name prefix (e.g., "Little League")
 * @param {string[]} options.modes - Theme modes to generate (e.g., ["dark"])
 * @param {string} [options.variant] - Optional variant suffix (e.g., "er" for "darker")
 */
export default function zedTheme(options = {}) {
  const { name = "Theme", modes = ["dark"], variant = "" } = options;

  return {
    name: "zed-theme",

    async build({ getTransforms, outputFile }) {
      for (const mode of modes) {
        const transforms = getTransforms({ format: "core", mode: "." });

        // Build lookup maps from transforms
        const colors = {};
        const syntaxMap = {};
        for (const t of transforms) {
          colors[t.id] = t.value;

          // Build syntax scope map from syntax.* tokens
          if (t.id.startsWith("syntax.")) {
            let scope = t.id.replace(/^syntax\./, "");
            if (scope.endsWith(".*")) scope = scope.slice(0, -2);
            else if (scope.endsWith("*")) {
              scope = scope.slice(0, -1);
              if (scope.endsWith(".")) scope = scope.slice(0, -1);
            }
            syntaxMap[scope] = {
              foreground: t.value,
              fontStyle: t.fontStyle || null,
            };
          }
        }

        const modeCapitalized =
          mode.charAt(0).toUpperCase() + mode.slice(1);
        const themeName = variant
          ? `${name} ${modeCapitalized}${variant}`
          : `${name} ${modeCapitalized}`;

        const theme = {
          $schema: "https://zed.dev/schema/themes/v0.2.0.json",
          name: themeName,
          author: "Matt Strom (https://github.com/ilikescience)",
          themes: [
            {
              name: themeName,
              appearance: mode === "light" ? "light" : "dark",
              style: buildStyle(colors, syntaxMap),
            },
          ],
        };

        const fileMode = variant
          ? `${mode}${variant.toLowerCase()}`
          : mode;
        const filename = `zed/themes/little-league-${fileMode}.json`;
        outputFile(filename, JSON.stringify(theme, null, 2) + "\n");
      }
    },
  };
}

import { defineConfig } from "@terrazzo/cli";
import vscodeTheme from "./plugins/vscode-theme.mjs";
import { sharedTokens } from "./terrazzo.shared.mjs";

export default defineConfig({
  tokens: [
    "./tokens/core.tokens.json",
    "./tokens/darker/background.tokens.json",
    "./tokens/dark/border.tokens.json",
    "./tokens/dark/font.tokens.json",
    ...sharedTokens,
  ],
  outDir: "./themes/",
  plugins: [
    vscodeTheme({
      name: "Little League",
      modes: ["dark"],
      variant: "er",
    }),
  ],
});

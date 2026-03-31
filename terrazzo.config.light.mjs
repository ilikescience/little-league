import { defineConfig } from "@terrazzo/cli";
import vscodeTheme from "./plugins/vscode-theme.mjs";
import { sharedTokens } from "./terrazzo.shared.mjs";

export default defineConfig({
  tokens: [
    "./tokens/core.tokens.json",
    "./tokens/light/background.tokens.json",
    "./tokens/light/border.tokens.json",
    "./tokens/light/font.tokens.json",
    ...sharedTokens,
  ],
  outDir: "./themes/",
  plugins: [
    vscodeTheme({
      name: "Little League",
      modes: ["light"],
    }),
  ],
});

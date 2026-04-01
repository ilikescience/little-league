import { defineConfig } from "@terrazzo/cli";
import coreTransform from "./plugins/core-transform.mjs";
import vscodeTheme from "./plugins/vscode-theme.mjs";
import itermTheme from "./plugins/iterm-theme.mjs";
import ghosttyTheme from "./plugins/ghostty-theme.mjs";
import zedTheme from "./plugins/zed-theme.mjs";
import { sharedTokens } from "./terrazzo.shared.mjs";

export default defineConfig({
  tokens: [
    "./tokens/core.tokens.json",
    "./tokens/darker/background.tokens.json",
    "./tokens/dark/border.tokens.json",
    "./tokens/dark/font.tokens.json",
    ...sharedTokens,
  ],
  outDir: "./targets/",
  plugins: [
    coreTransform(),
    vscodeTheme({ name: "Little League", modes: ["dark"], variant: "er" }),
    itermTheme({ name: "Little League", modes: ["dark"], variant: "er" }),
    ghosttyTheme({ name: "Little League", modes: ["dark"], variant: "er" }),
    zedTheme({ name: "Little League", modes: ["dark"], variant: "er" }),
  ],
});

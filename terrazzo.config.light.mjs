import { defineConfig } from "@terrazzo/cli";
import coreTransform from "./plugins/core-transform.mjs";
import vscodeTheme from "./plugins/vscode-theme.mjs";
import itermTheme from "./plugins/iterm-theme.mjs";
import ghosttyTheme from "./plugins/ghostty-theme.mjs";
import zedTheme from "./plugins/zed-theme.mjs";
import starshipTheme from "./plugins/starship-theme.mjs";
import { sharedTokens } from "./terrazzo.shared.mjs";

export default defineConfig({
  tokens: [
    "./tokens/core.tokens.json",
    "./tokens/light/background.tokens.json",
    "./tokens/light/border.tokens.json",
    "./tokens/light/font.tokens.json",
    ...sharedTokens,
  ],
  outDir: "./targets/",
  plugins: [
    coreTransform(),
    vscodeTheme({ name: "Little League", modes: ["light"] }),
    itermTheme({ name: "Little League", modes: ["light"] }),
    ghosttyTheme({ name: "Little League", modes: ["light"] }),
    zedTheme({ name: "Little League", modes: ["light"] }),
    starshipTheme({ name: "Little League", modes: ["light"] }),
  ],
});

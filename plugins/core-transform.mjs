/**
 * Shared Terrazzo transform plugin.
 * Converts DTCG color tokens to hex and registers them under format "core".
 * All format-specific build plugins read from these transforms.
 */

import { colorToHex } from "./color-utils.mjs";

export default function coreTransform() {
  return {
    name: "core-transform",

    async transform({ tokens, setTransform }) {
      for (const [id, token] of Object.entries(tokens)) {
        if (token.$type !== "color") continue;

        if (token.mode) {
          for (const [modeName, modeToken] of Object.entries(token.mode)) {
            const value = modeToken.$value;
            const hexValue = colorToHex(value);

            if (hexValue) {
              setTransform(id, {
                format: "core",
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
  };
}

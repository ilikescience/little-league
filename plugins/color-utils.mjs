/**
 * Shared color conversion utilities for theme plugins.
 *
 * Supports sRGB and OKLCH color spaces per the DTCG specification.
 * OKLCH→sRGB conversion uses the OKLab color model by Björn Ottosson.
 */

// --- OKLCH ↔ sRGB conversion ---

function srgbToLinear(c) {
  return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

function linearToSrgb(c) {
  return c <= 0.0031308
    ? 12.92 * c
    : 1.055 * Math.pow(c, 1 / 2.4) - 0.055;
}

function clamp01(v) {
  return Math.min(1, Math.max(0, v));
}

function to8bit(v) {
  return Math.round(clamp01(v) * 255)
    .toString(16)
    .padStart(2, "0");
}

/**
 * Convert OKLCH to sRGB floats (0–1).
 * @param {number} L - Lightness (0–1)
 * @param {number} C - Chroma (0–~0.37)
 * @param {number} H - Hue (0–360 degrees)
 * @returns {[number, number, number]} [r, g, b] in sRGB, clamped to 0–1
 */
export function oklchToSrgb(L, C, H) {
  // OKLCH → OKLab
  const hRad = (H * Math.PI) / 180;
  const a = C * Math.cos(hRad);
  const b = C * Math.sin(hRad);

  // OKLab → linear sRGB (via LMS intermediary)
  const l_ = L + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = L - 0.0894841775 * a - 1.291485548 * b;

  const l = l_ * l_ * l_;
  const m = m_ * m_ * m_;
  const s = s_ * s_ * s_;

  const lr = +4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s;
  const lg = -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s;
  const lb = -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s;

  return [linearToSrgb(lr), linearToSrgb(lg), linearToSrgb(lb)];
}

/**
 * Convert sRGB floats (0–1) to OKLCH.
 * @param {number} r - Red (0–1)
 * @param {number} g - Green (0–1)
 * @param {number} b - Blue (0–1)
 * @returns {[number, number, number]} [L, C, H]
 */
export function srgbToOklch(r, g, b) {
  const lr = srgbToLinear(r);
  const lg = srgbToLinear(g);
  const lb = srgbToLinear(b);

  // Linear sRGB → LMS
  const l = Math.cbrt(0.4122214708 * lr + 0.5363325363 * lg + 0.0514459929 * lb);
  const m = Math.cbrt(0.2119034982 * lr + 0.6806995451 * lg + 0.1073969566 * lb);
  const s = Math.cbrt(0.0883024619 * lr + 0.2817188376 * lg + 0.6299787005 * lb);

  // LMS → OKLab
  const L = 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s;
  const a = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s;
  const bOk = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s;

  // OKLab → OKLCH
  const C = Math.sqrt(a * a + bOk * bOk);
  let H = (Math.atan2(bOk, a) * 180) / Math.PI;
  if (H < 0) H += 360;

  // Achromatic: set hue to 0
  if (C < 1e-10) H = 0;

  return [L, C, H];
}

// --- Hex conversion ---

/**
 * Convert DTCG color value to hex string with alpha.
 * Supports sRGB and OKLCH color spaces.
 * @param {Object} color - DTCG color object
 * @returns {string} - Hex color string
 */
export function colorToHex(color) {
  if (!color || typeof color !== "object") {
    return color;
  }

  let hex = "";

  if (color.components && color.colorSpace === "srgb") {
    const [r, g, b] = color.components;
    hex = `#${to8bit(r)}${to8bit(g)}${to8bit(b)}`;
  } else if (color.components && color.colorSpace === "oklch") {
    const [L, C, H] = color.components;
    const [r, g, b] = oklchToSrgb(L, C, H);
    hex = `#${to8bit(r)}${to8bit(g)}${to8bit(b)}`;
  }

  // Fall back to hex property if no components
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
 * Parse a hex color string to RGB float components (0.0–1.0).
 * Supports #RGB, #RRGGBB, and #RRGGBBAA formats.
 * @param {string} hex - Hex color string
 * @returns {{ r: number, g: number, b: number, a: number }}
 */
export function hexToRgbFloats(hex) {
  const h = hex.replace("#", "");
  let r, g, b, a;

  if (h.length === 3) {
    r = parseInt(h[0] + h[0], 16) / 255;
    g = parseInt(h[1] + h[1], 16) / 255;
    b = parseInt(h[2] + h[2], 16) / 255;
    a = 1;
  } else if (h.length === 6) {
    r = parseInt(h.slice(0, 2), 16) / 255;
    g = parseInt(h.slice(2, 4), 16) / 255;
    b = parseInt(h.slice(4, 6), 16) / 255;
    a = 1;
  } else if (h.length === 8) {
    r = parseInt(h.slice(0, 2), 16) / 255;
    g = parseInt(h.slice(2, 4), 16) / 255;
    b = parseInt(h.slice(4, 6), 16) / 255;
    a = parseInt(h.slice(6, 8), 16) / 255;
  }

  return { r, g, b, a };
}

/**
 * Strip alpha channel from a hex color string.
 * @param {string} hex - Hex color (#RRGGBB or #RRGGBBAA)
 * @returns {string} - Hex color without alpha (#RRGGBB)
 */
export function stripAlpha(hex) {
  return hex.length === 9 ? hex.slice(0, 7) : hex;
}

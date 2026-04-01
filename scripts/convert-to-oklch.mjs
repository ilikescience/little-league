#!/usr/bin/env node
/**
 * One-time migration script: converts all sRGB token values to OKLCH.
 *
 * For each DTCG color object with colorSpace "srgb", this script:
 *   1. Converts sRGB components to OKLCH
 *   2. Replaces the colorSpace and components
 *   3. Removes the hex property (hex is derived at build time)
 *   4. Verifies round-trip: OKLCH → sRGB → hex matches the original hex
 *
 * Usage: node scripts/convert-to-oklch.mjs
 */

import { readFileSync, writeFileSync } from "node:fs";
import { globSync } from "node:fs";
import { srgbToOklch, oklchToSrgb } from "../plugins/color-utils.mjs";

// Find all token files
import { readdirSync, statSync } from "node:fs";
import { join } from "node:path";

function walkTokenFiles(dir) {
  const files = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      files.push(...walkTokenFiles(full));
    } else if (full.endsWith(".tokens.json")) {
      files.push(full);
    }
  }
  return files;
}

function to8bit(v) {
  return Math.round(Math.min(1, Math.max(0, v)) * 255)
    .toString(16)
    .padStart(2, "0");
}

function srgbToHex(r, g, b) {
  return `#${to8bit(r)}${to8bit(g)}${to8bit(b)}`;
}

let totalConverted = 0;
let totalErrors = 0;

function convertValue(obj, path) {
  if (!obj || typeof obj !== "object") return;

  // Check if this is a sRGB color value
  if (
    obj.colorSpace === "srgb" &&
    Array.isArray(obj.components) &&
    obj.components.length === 3
  ) {
    const [r, g, b] = obj.components;

    // Remember original hex for verification
    const originalHex = obj.hex || srgbToHex(r, g, b);

    // Convert to OKLCH
    const [L, C, H] = srgbToOklch(r, g, b);

    // Round-trip verification: OKLCH → sRGB → hex
    const [rr, rg, rb] = oklchToSrgb(L, C, H);
    const roundTripHex = srgbToHex(rr, rg, rb);

    if (roundTripHex.toLowerCase() !== originalHex.toLowerCase()) {
      console.error(
        `  MISMATCH at ${path}: original=${originalHex} roundtrip=${roundTripHex}`
      );
      totalErrors++;
    }

    // Update the object in-place
    obj.colorSpace = "oklch";
    obj.components = [
      parseFloat(L.toPrecision(10)),
      parseFloat(C.toPrecision(10)),
      parseFloat(H.toPrecision(10)),
    ];
    delete obj.hex;

    totalConverted++;
    return;
  }

  // Recurse into nested objects/arrays
  for (const key of Object.keys(obj)) {
    if (typeof obj[key] === "object" && obj[key] !== null) {
      convertValue(obj[key], `${path}.${key}`);
    }
  }
}

// Main
const tokenDir = join(import.meta.dirname, "..", "tokens");
const files = walkTokenFiles(tokenDir);

console.log(`Found ${files.length} token files\n`);

for (const file of files) {
  const content = readFileSync(file, "utf-8");
  const json = JSON.parse(content);
  const before = totalConverted;

  convertValue(json, file.split("/tokens/")[1]);

  const count = totalConverted - before;
  if (count > 0) {
    writeFileSync(file, JSON.stringify(json, null, 2) + "\n");
    console.log(`  ${file.split("/tokens/")[1]}: ${count} values converted`);
  }
}

console.log(`\nTotal: ${totalConverted} values converted`);
if (totalErrors > 0) {
  console.error(`\n⚠ ${totalErrors} round-trip mismatches detected!`);
  process.exit(1);
} else {
  console.log("All round-trip verifications passed.");
}

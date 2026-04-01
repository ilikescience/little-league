#!/usr/bin/env node
/**
 * Bump the version across all targets and create a git tag.
 *
 * Usage: node scripts/bump-version.mjs <version>
 *   e.g. node scripts/bump-version.mjs 1.5.0
 *
 * Updates:
 *   - package.json (root)
 *   - targets/vscode/package.json
 *   - targets/zed/extension.toml
 *
 * Then commits and creates a git tag v<version>.
 */

import { readFileSync, writeFileSync } from "node:fs";
import { execSync } from "node:child_process";
import { join } from "node:path";

const root = join(import.meta.dirname, "..");
const version = process.argv[2];

if (!version || !/^\d+\.\d+\.\d+$/.test(version)) {
  console.error("Usage: node scripts/bump-version.mjs <version>");
  console.error("  e.g. node scripts/bump-version.mjs 1.5.0");
  process.exit(1);
}

// 1. Root package.json
const rootPkg = join(root, "package.json");
const rootJson = JSON.parse(readFileSync(rootPkg, "utf-8"));
rootJson.version = version;
writeFileSync(rootPkg, JSON.stringify(rootJson, null, 2) + "\n");
console.log(`  package.json → ${version}`);

// 2. VS Code package.json
const vscodePkg = join(root, "targets/vscode/package.json");
const vscodeJson = JSON.parse(readFileSync(vscodePkg, "utf-8"));
vscodeJson.version = version;
writeFileSync(vscodePkg, JSON.stringify(vscodeJson, null, 2) + "\n");
console.log(`  targets/vscode/package.json → ${version}`);

// 3. Zed extension.toml
const zedToml = join(root, "targets/zed/extension.toml");
let toml = readFileSync(zedToml, "utf-8");
toml = toml.replace(/^version = ".*"$/m, `version = "${version}"`);
writeFileSync(zedToml, toml);
console.log(`  targets/zed/extension.toml → ${version}`);

// 4. Commit and tag
execSync("git add package.json targets/vscode/package.json targets/zed/extension.toml", { cwd: root });
execSync(`git commit -m "${version}"`, { cwd: root });
execSync(`git tag v${version}`, { cwd: root });

console.log(`\nCommitted and tagged v${version}`);
console.log(`Push with: git push origin main --tags`);

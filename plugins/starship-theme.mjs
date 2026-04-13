/**
 * Terrazzo plugin for generating Starship prompt theme files (TOML).
 * Produces a powerline-style prompt with graduated background segments
 * using the Little League gray scale.
 */

import { stripAlpha } from "./color-utils.mjs";

/** Language/runtime modules with Nerd Font symbols. */
const LANG_MODULES = {
  buf:        "buf ",
  bun:        "bun ",
  c:          " ",
  cmake:      "cmake ",
  cobol:      "cobol ",
  crystal:    " ",
  daml:       "daml ",
  dart:       " ",
  deno:       " ",
  dotnet:     " ",
  elixir:     " ",
  elm:        " ",
  erlang:     " ",
  fennel:     " ",
  gleam:      "gleam ",
  golang:     " ",
  gradle:     " ",
  haskell:    " ",
  haxe:       " ",
  java:       " ",
  julia:      " ",
  kotlin:     " ",
  lua:        " ",
  meson:      "meson ",
  mojo:       "mojo ",
  nim:        " ",
  nodejs:     " ",
  ocaml:      " ",
  odin:       "odin ",
  package:    " ",
  perl:       " ",
  php:        " ",
  purescript: " ",
  python:     " ",
  quarto:     "quarto ",
  rlang:      " ",
  red:        "red ",
  ruby:       " ",
  rust:       " ",
  scala:      " ",
  solidity:   "sol ",
  swift:      " ",
  terraform:  "󱁢 ",
  typst:      "typst ",
  vlang:      "V ",
  zig:        " ",
};

/** Cloud/infra modules disabled (no $version to display). */
const DISABLED_MODULES = [
  "aws", "azure", "gcloud", "kubernetes", "openstack", "pulumi",
  "vagrant", "docker_context", "conda", "guix_shell", "helm",
  "nix_shell", "opa", "spack",
];

/**
 * @param {Object} options
 * @param {string} options.name - Theme name prefix (e.g., "Little League")
 * @param {string[]} options.modes - Theme modes to generate (e.g., ["dark"])
 * @param {string} [options.variant] - Optional variant suffix (e.g., "er" for "darker")
 */
export default function starshipTheme(options = {}) {
  const { name = "Theme", modes = ["dark"], variant = "" } = options;

  return {
    name: "starship-theme",

    async build({ getTransforms, outputFile }) {
      for (const mode of modes) {
        const transforms = getTransforms({ format: "core", mode: "." });
        const colors = {};
        for (const t of transforms) {
          colors[t.id] = stripAlpha(t.value);
        }

        const modeCapitalized =
          mode.charAt(0).toUpperCase() + mode.slice(1);
        const themeName = variant
          ? `${name} ${modeCapitalized}${variant}`
          : `${name} ${modeCapitalized}`;
        const slug = themeName.toLowerCase().replace(/ /g, "-");

        // Segment colors: dark→light gradient for dark modes, light→dark for light.
        // Lead-in blocks (l1–l4) step from terminal bg toward the directory.
        // Content segments (dir, git, lang, time) fade back out.
        let l1, l2, l3, l4;
        let dirBg, dirFg, gitBg, gitFg, langBg, langFg, timeBg, timeFg;

        if (mode === "light") {
          l1 = colors["color.core.gray.50"] || "#eeeeee";
          l2 = colors["color.core.gray.100"] || "#dddddd";
          l3 = colors["color.core.gray.200"] || "#bfbfc0";
          l4 = colors["color.core.gray.300"] || "#a4a4a5";
          dirBg  = colors["color.core.gray.400"] || "#8c8c8d";
          dirFg  = colors["color.core.gray.0"] || "#ffffff";
          gitBg  = colors["color.core.gray.200"] || "#bfbfc0";
          gitFg  = colors["color.core.gray.700"] || "#4d4d52";
          langBg = colors["color.core.gray.100"] || "#dddddd";
          langFg = colors["color.core.gray.600"] || "#616164";
          timeBg = colors["color.core.gray.50"] || "#eeeeee";
          timeFg = colors["color.core.gray.500"] || "#757578";
        } else {
          l1 = colors["color.core.gray.900"] || "#242428";
          l2 = colors["color.core.gray.850"] || "#2f2f37";
          l3 = colors["color.core.gray.800"] || "#3a3a3f";
          l4 = colors["color.core.gray.750"] || "#434349";
          dirBg  = colors["color.core.gray.650"] || "#57575b";
          dirFg  = colors["color.core.gray.50"] || "#eeeeee";
          gitBg  = colors["color.core.gray.800"] || "#3a3a3f";
          gitFg  = colors["color.core.gray.300"] || "#a4a4a5";
          langBg = colors["color.core.gray.850"] || "#2f2f37";
          langFg = colors["color.core.gray.400"] || "#8c8c8d";
          timeBg = colors["color.core.gray.900"] || "#242428";
          timeFg = colors["color.core.gray.500"] || "#757578";
        }

        const langModules = Object.entries(LANG_MODULES).map(([m, sym]) => `[${m}]
symbol = "${sym}"
style = "bg:${langBg}"
format = '[[ $symbol$version ](fg:${langFg} bg:${langBg})]($style)'`
        ).join("\n\n");

        const langVars = Object.keys(LANG_MODULES).map(m => `$${m}`).join("");

        const disabledModules = DISABLED_MODULES.map(m => `[${m}]
disabled = true`
        ).join("\n\n");

        const toml = `# ${themeName}
# Generated from design tokens by the Little League build pipeline.
#
# Usage: save to ~/.config/starship.toml or source via STARSHIP_CONFIG

"$schema" = 'https://starship.rs/config-schema.json'

format = """
[ ](bg:${l1})\\
[ ](bg:${l2})\\
[ ](bg:${l3})\\
[ ](bg:${l4})\\
$directory\\
$git_branch\\
$git_status\\
${langVars}\\
$time\\
\\n$character"""

[directory]
style = "fg:${dirFg} bg:${dirBg}"
format = "[ $path ]($style)"
truncation_length = 3
truncation_symbol = "…/"

[git_branch]
symbol = ""
style = "bg:${gitBg}"
format = '[[ $symbol$branch ](fg:${gitFg} bg:${gitBg})]($style)'

[git_status]
style = "bg:${gitBg}"
format = '[[($all_status$ahead_behind )](fg:${gitFg} bg:${gitBg})]($style)'

[character]
format = "$symbol "
success_symbol = "[❯](fg:${dirFg})"
error_symbol = "[❯](red)"

${langModules}

${disabledModules}

[time]
disabled = false
time_format = "%R"
style = "bg:${timeBg}"
format = '[[ 󰥔 $time ](fg:${timeFg} bg:${timeBg})]($style)'
`;

        const filename = `starship/${slug}.toml`;
        outputFile(filename, toml);
      }
    },
  };
}

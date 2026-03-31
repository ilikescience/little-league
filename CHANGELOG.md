# Change Log

All notable changes to the "little-league" extension will be documented in this file.

Check [Keep a Changelog](http://keepachangelog.com/) for recommendations on how to structure this file.

## [Unreleased]

- Nothing!

## [1.4.0] - 2026-03-31

### Added

- 72 new VS Code theme properties: command center, menus, checkboxes, sticky scroll, inlay hints, tree guides, toolbar, banners, secondary buttons, minimap slider, and more
- Descriptions on all application tokens from VS Code theme color reference
- Shared token list so new tokens only need to be added in one place

### Changed

- Token scales now use a 500-centered numeric system (like CSS font-weight) instead of arbitrary numbers
- Selection tokens consolidated from 10 to 6 (removed unused levels)
- Alpha surface tokens renamed by purpose (shadow, line-highlight, range-highlight, etc.)
- 4 alpha tokens converted to opaque where the background is known
- Deprecated `extensionButton.prominent*` properties replaced with current equivalents
- Directory structure simplified: `dark-original/` and `dark/` renamed to `dark/` and `darker/`

### Fixed

- `notication.tokens.json` typo corrected to `notification.tokens.json`

### Removed

- Unused tokens, empty placeholder files, and 24 empty token entries

## [1.3.1] - 2025-12-27

### Fixed

- Updated darkest gray in Darker theme (#0A0A0A → #101011) for better visibility

## [1.3.0] - 2025-12-26

### Added

- Little League Darker variant - a deeper, darker version of the original theme

### Changed

- Migrated build pipeline from Style Dictionary to Terrazzo

## [1.2.0] - 2022-06-03

### Fixed

- Updated terminal colors to include better bright black

## [1.1.0] - 2022-02-20

### Added

- A theme icon and banner colors for the marketplace

### Fixed

- Selection colors


## [1.0.0] - 2022-02-20

First proper release. Probably breaks a lot!

### Added

- A new theme: Little League Light
- New build pipeline based on Dany Banks'[Nu Disco](https://github.com/dbanksdesign/nu-disco-vscode-theme) theme and [styledictionary](https://github.com/amzn/style-dictionary)
- Bracket pair colorizer hints
- Lots of new demo files
- A proper readme

### Fixed

- Some weird bugs with the minimap causing it to appear blank

## [0.1.0] - 2022-01-26

Very early intiial release - just getting the feel for publishing a theme.


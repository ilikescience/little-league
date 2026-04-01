#!/bin/bash
# Update the Little League submodule in the zed-industries/extensions fork
# and push a branch for PR submission.
#
# Prerequisites:
#   - gh CLI authenticated
#   - Fork at ilikescience/extensions exists
#
# Usage: ./scripts/release-zed.sh

set -euo pipefail

VERSION=$(node -p "require('./package.json').version")

echo "Releasing Zed extension v${VERSION}"

TMPDIR=$(mktemp -d)
trap "rm -rf $TMPDIR" EXIT

# Clone the fork
echo "Cloning extensions fork..."
gh repo clone ilikescience/extensions "$TMPDIR" -- --depth=1

cd "$TMPDIR"

# Sync with upstream
git remote add upstream https://github.com/zed-industries/extensions.git
git fetch upstream main --depth=1
git reset --hard upstream/main

# Update the submodule to the latest commit
git submodule update --init extensions/little-league
cd extensions/little-league
git fetch origin
git checkout origin/main
cd ../..

# Update version in extensions.toml
sed -i.bak "/^\[little-league\]/,/^$/{s/version = \".*\"/version = \"${VERSION}\"/;}" extensions.toml
rm -f extensions.toml.bak

# Commit and push
BRANCH="update-little-league-${VERSION}"
git checkout -b "$BRANCH"
git add extensions/little-league extensions.toml
git commit -m "Update Little League to v${VERSION}"
git push origin "$BRANCH" --force

echo ""
echo "Branch pushed. Create PR at:"
echo "  https://github.com/ilikescience/extensions/pull/new/${BRANCH}"
echo ""
echo "Or run:"
echo "  gh pr create --repo zed-industries/extensions --head ilikescience:${BRANCH} --title 'Update Little League to v${VERSION}' --body 'Version bump to v${VERSION}'"

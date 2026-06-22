#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

echo "# Context Brief"
echo
echo "## Repo"
git status --short || true
echo
echo "## Branch"
git branch --show-current || true
echo
echo "## Remote"
git remote -v || true
echo
echo "## Operation Docs"
printf '%s\n' "- docs/operations/roop-delegation.md"
printf '%s\n' "- README.md"
echo
echo "Direct Obsidian writes are disabled; external devlog automation may summarize committed changes."

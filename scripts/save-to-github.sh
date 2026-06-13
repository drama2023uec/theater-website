#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

branch="$(git branch --show-current)"
if [[ -z "$branch" ]]; then
  echo "No current git branch found." >&2
  exit 1
fi

git fetch origin "$branch" >/dev/null 2>&1 || true

tracked_paths=(
  ".gitignore"
  "README.md"
  "api"
  "article.html"
  "article.js"
  "assets"
  "index.html"
  "journal.html"
  "journal.js"
  "script.js"
  "show.html"
  "show.js"
  "shows.html"
  "shows.js"
  "styles.css"
  "scripts"
)

git add "${tracked_paths[@]}"

if git diff --cached --quiet; then
  echo "No site changes to save."
else
  message="${1:-Save site changes}"
  git commit -m "$message"
fi

git push -u origin "$branch"

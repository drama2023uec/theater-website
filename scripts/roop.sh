#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

message="${*:-Roop checkpoint}"
stamp="$(date +%Y-%m-%d-%H%M%S)"
out_dir="work/roop"
brief="$out_dir/context-$stamp.md"

mkdir -p "$out_dir"

echo "== observe =="
./scripts/ensure-agent-environment.sh
./scripts/context-brief.sh > "$brief"
echo "context: $brief"

echo "== preflight =="
./scripts/preflight.sh

echo "== verify =="
git diff --check
bash -n scripts/context-brief.sh
bash -n scripts/dev-preview.sh
bash -n scripts/save-to-github.sh
bash -n scripts/deploy-prod.sh
bash -n scripts/preflight.sh
bash -n scripts/roop.sh

for file in script.js shows.js show.js journal.js article.js api/content.js api/show.js api/post.js api/like.js api/comments.js tests/notion-source.test.js tests/about-slideshow.test.js tests/article-comments.test.js tests/article-comments-ui.test.js tests/article-line-breaks.test.js tests/notion-images.test.js tests/notion-natural-images.test.js tests/responsive-viewport.test.js; do
  node --check "$file"
done

echo "== record =="
echo "dev log disabled: no progress record written"

echo "== handoff =="
git status --short

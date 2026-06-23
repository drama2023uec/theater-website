#!/usr/bin/env bash
set -u

cd "$(dirname "$0")/.."

fail=0

check() {
  local label="$1"
  shift
  if "$@"; then
    printf 'ok: %s\n' "$label"
  else
    printf 'ng: %s\n' "$label" >&2
    fail=1
  fi
}

check "Vercel CLI exists" bash -c 'command -v vercel >/dev/null'
check ".env.local exists" test -f .env.local
check "NOTION_API_KEY exists in .env.local" grep -q '^NOTION_API_KEY=' .env.local
check "NOTION_POSTS_DATABASE_ID exists in .env.local" grep -q '^NOTION_POSTS_DATABASE_ID=' .env.local
check "NOTION_SHOWS_DATABASE_ID exists in .env.local" grep -q '^NOTION_SHOWS_DATABASE_ID=' .env.local
check "context-brief is executable" test -x scripts/context-brief.sh
check "dev-preview is executable" test -x scripts/dev-preview.sh
check "ensure-agent-environment is executable" test -x scripts/ensure-agent-environment.sh
check "no local show data file" test ! -f site-data.js
check "no local content helper file" test ! -f site-content.js
check "homepage does not load local JSON data" bash -c '! grep -q "site-data.js\\|site-content.js" index.html'
check "shows page does not load local JSON data" bash -c '! grep -q "site-data.js\\|site-content.js" shows.html'
check "journal page does not load local JSON data" bash -c '! grep -q "site-data.js\\|site-content.js" journal.html'
check "API content reads Notion only" bash -c '! grep -q "require(.*site-data" api/content.js'

exit "$fail"

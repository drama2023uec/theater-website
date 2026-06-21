#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

port="${PORT:-3000}"

if [[ ! -f ".env.local" ]]; then
  echo "Missing .env.local. Pull Vercel env before API preview." >&2
  echo "Run: npx vercel env pull .env.local" >&2
  exit 1
fi

if ! grep -q '^NOTION_API_KEY=' .env.local; then
  echo ".env.local does not contain NOTION_API_KEY. API preview will not match production." >&2
  echo "Run: npx vercel env pull .env.local" >&2
  exit 1
fi

NO_UPDATE_NOTIFIER=1 VERCEL_NO_UPDATE_NOTIFIER=1 npx vercel dev --listen "127.0.0.1:$port"

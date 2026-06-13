#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

message="${1:-Save site changes before deploy}"

./scripts/save-to-github.sh "$message"
npx vercel deploy --prod --yes --force

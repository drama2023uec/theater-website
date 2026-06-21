#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

repo_root="$(pwd)"
repo_parent="$(dirname "$repo_root")"
codex_config="$HOME/.codex/config.toml"

ensure_codex_trusted_project() {
  local project="$1"

  if [[ ! -f "$codex_config" ]]; then
    echo "skip: Codex config not found: $codex_config"
    return 0
  fi

  if grep -Fqx "[projects.\"$project\"]" "$codex_config"; then
    echo "ok: Codex trusted project exists: $project"
    return 0
  fi

  {
    printf '\n[projects."%s"]\n' "$project"
    printf 'trust_level = "trusted"\n'
  } >> "$codex_config"
  echo "added: Codex trusted project: $project"
}

ensure_codex_trusted_project "$repo_parent"
echo "dev log disabled: Obsidian Daily write checks skipped"
echo "dev log disabled: git hooksPath setup skipped"
./scripts/preflight.sh

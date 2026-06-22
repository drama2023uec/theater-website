# Claude Code運用指示

このrepoでは `AGENTS.md` と同じ運用を採用する。

最初に読むもの:

1. `AGENTS.md`
2. `docs/operations/roop-delegation.md`
3. 見た目改善なら `docs/operations/visual-roop-criteria.md`
4. `README.md`
5. `./scripts/ensure-agent-environment.sh` の出力

作業入口:

- 起動時検査: `./scripts/ensure-agent-environment.sh`
- ローカル確認: `./scripts/dev-preview.sh`
- 開発ログ: このrepoからObsidianへ直接書かない。外部 `/Users/owner/obsidian-automation` によるcommit済み変更の要約記録は許可
- 無人roop: 無効
- GitHub保存: `./scripts/save-to-github.sh "message"`
- 本番deploy: `./scripts/deploy-prod.sh "message"`

本番deployはマスターの明示指示があるときだけ実行する。

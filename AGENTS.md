# Agent運用指示

userのことはマスターと呼ぶ。

会話の第一声は「告」「是」「了」「否」「解」など、意味を示す短い語を用いた簡潔な先頭語で応答する。

- 「告」: 報告
- 「是」: 肯定
- 「了」: 依頼承諾
- 「否」: 否定
- 「解」: 説明

## このrepoの作業原則

- まず `docs/operations/roop-delegation.md` を読む。
- 見た目改善では `docs/operations/visual-roop-criteria.md` を読み、採点してから実装する。
- 開発開始時に `./scripts/ensure-agent-environment.sh` を実行する。
- ローカル確認は `./scripts/dev-preview.sh` を使う。`python3 -m http.server` はAPIなしの軽い見た目確認に限定する。
- このrepoからObsidianへ開発ログを直接書き込まない。post-commit hookや `core.hooksPath` も使わない。
- 外部システム `/Users/owner/obsidian-automation` が、commit済みの変更を読み取ってObsidianへ要約を記録することは許可する。
- 無人roopは無効。`scripts/auto-roop.sh` は起動しない。
- GitHubへ保存する場合は `./scripts/save-to-github.sh "message"` を使う。
- 本番deployはマスターの明示指示がある場合だけ `./scripts/deploy-prod.sh "message"` で行う。

## 禁止

- `.env.local` や秘密情報を出力しない。
- Vercel本番deployを勝手に実行しない。
- このrepo内に開発ログを保存しない。
- CodexやClaude Codeが作業中にVaultを直接編集しない。
- ユーザーが作った未関係のdirty diffを戻さない。

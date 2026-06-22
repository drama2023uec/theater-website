# Roop設計と権限委譲

このサイトの開発は、GitHubを永続保存、Vercelを本番反映、NotionをCMSとして扱う。repo内への開発ログ保存、作業中のVault直接編集、無人roopは無効である。外部 `/Users/owner/obsidian-automation` がcommit済み変更を読み取り、Obsidianへ要約を記録することは許可する。

## 原則

- 開始時は必ず `./scripts/context-brief.sh` を読む。
- その前に `./scripts/ensure-agent-environment.sh` を実行する。
- ローカル確認は `./scripts/dev-preview.sh` を使う。
- 保存は `./scripts/save-to-github.sh "message"` を使う。
- 本番反映は `./scripts/deploy-prod.sh "message"` だけを使う。
- このrepoからObsidianへ開発ログを直接書かない。
- post-commit hookや `core.hooksPath` は使わない。
- 静的サーバーはAPIなし確認用であり、進行度確認には使わない。
- 環境健全性は `./scripts/preflight.sh` で確認する。
- roop/auto-roopは使わない。
- 見た目改善のroopは `docs/operations/visual-roop-criteria.md` の採点基準を使う。

## Roop

1. Observe
   - `git status --short`
   - `./scripts/context-brief.sh`
   - `README.md`
   - `docs/operations/roop-delegation.md`
2. Decide
   - 目的
   - deploy禁止かどうか
   - 保存するかどうか
   - 必要な検証
   - 見た目改善の場合は `docs/operations/visual-roop-criteria.md` の対象セクションと合格点
3. Act
   - 小さい差分で実装する。
   - Notion/API経路と静的fallback経路の両方を壊さない。
4. Verify
   - `git diff --check`
   - `node --check *.js`
   - `bash -n scripts/*.sh`
   - ChromeまたはVercel devで主要画面を確認する。
5. Record
   - このrepoから開発ログを直接記録しない。
6. Sync
   - 保存する場合は `./scripts/save-to-github.sh "message"`。
   - deployする場合は `./scripts/deploy-prod.sh "message"`。
7. Handoff
   - 未検証、未保存、禁止事項、次アクションを明示する。

## 権限レベル

### Level 0: 自動実行

- repo内の読取
- `git diff`, `git status`, `rg`, `sed`
- 構文チェック
- ローカルプレビュー起動
- Chromeでのローカル表示確認
- repo内のファイル編集
### Level 1: 自動実行してよい

- 小規模なUI修正
- fallbackデータ更新
- docs更新
- 画像差し替え

### Level 2: 原則自動、失敗時停止

- `./scripts/save-to-github.sh`
- Git commit
- GitHub push

### Level 3: 明示指示が必要

- `./scripts/deploy-prod.sh`
- Vercel本番deploy
- 外部サービスへの送信
- 秘密情報の表示、転記、共有
- 破壊的操作

## Codex / Claude Code 共通運用

- Codexは `AGENTS.md` を読む。
- Claude Codeは `CLAUDE.md` を読む。
- 両方ともこのファイルと `scripts/` の入口を正とする。
- ツール差はあっても、Observe -> Decide -> Act -> Verify -> Sync -> Handoff の順序は変えない。

## 現在の制限

このrepoからの開発ログ直接記録と無人roopは無効。外部 `/Users/owner/obsidian-automation` によるcommit済み変更の要約記録は許可する。

## 実行コマンド

```bash
./scripts/ensure-agent-environment.sh
./scripts/context-brief.sh
./scripts/preflight.sh
```

本番deployは含めない。deployはマスターの明示指示がある場合だけ `./scripts/deploy-prod.sh "message"` を実行する。

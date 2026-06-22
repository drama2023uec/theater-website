# 演劇同好会サイト構成メモ

この出力は、Gemini共有会話の方針をサイト化した静的デモである。

## 採用方針

- フロントエンドは自由に作り込む
- 更新UIはNotionに寄せる
- 後輩は公演情報とブログ記事をNotionの表へ入力するだけにする
- 公開はVercel、Netlify、GitHub Pagesなどの静的ホスティングを想定する

## Notion側の最低スキーマ

ブログDB:

- `Name`: タイトル
- `Date`: 日付
- `Category`: セレクト。例: `稽古`, `制作`, `告知`
- `Author`: テキスト
- `Excerpt`: 短い概要
- `Published`: チェックボックス

ブログ本文:

- ブログDBの各行を開き、そのページ本文に段落や見出しを書く
- サイトの稽古記録カードから `article.html` に遷移し、Notion本文が反映される
- 対応ブロックは段落、見出し、箇条書き、番号付きリスト、引用

公演DB:

- `Name`: 公演名
- `Date`: 日付または表示用日付
- `Venue`: 会場
- `Status`: 状態。例: `予約不要`, `準備中`, `終了`
- `Description`: 概要
- `Published`: チェックボックス

## API連携時の差し替え位置

現在は `script.js` にデモデータがあり、Notion APIが未設定でも表示が壊れない。
本番では `/api/content` がNotion APIから公演情報とブログ記事を取得し、ブラウザ側がそれを読み込む。

Notion APIキーはブラウザ側へ置かない。VercelやNetlifyの環境変数に保存し、サーバー側またはビルド時だけで読む。

## ローカル確認

本番と同じ進行度を確認する場合は、Vercel FunctionsとNotion環境変数を読む。

```bash
./scripts/dev-preview.sh
```

`python3 -m http.server` のような静的サーバーは `/api/content` を持たないため、ブラウザは `script.js` / `shows.js` のフォールバック公演を表示する。CSSや写真だけを軽く見る用途に限定する。

## Vercel環境変数

VercelのProject Settings > Environment Variablesに以下を設定する。

- `NOTION_API_KEY`: Notion Integrationの内部シークレット
- `NOTION_POSTS_DATABASE_ID`: ブログDBのID
- `NOTION_SHOWS_DATABASE_ID`: 公演DBのID

設定後に再デプロイすればNotionの公開済みデータが反映される。

## GitHubへの保存

Vercelへ直接デプロイするとGitHubには保存されない。変更を残すときは以下を使う。

```bash
./scripts/save-to-github.sh "変更内容のメモ"
```

本番デプロイまで一気に行う場合は以下を使う。

```bash
./scripts/deploy-prod.sh "変更内容のメモ"
```

このスクリプトはサイト本体だけをstageし、`.env*`, `.vercel/`, `.DS_Store`, `.claude/`, `outputs/`, `WORK_LOG_*.md` は保存対象から外す。
このrepoからObsidianへ開発ログを直接書き込まない。保存処理はGitHubへのcommit/pushだけを行う。外部 `/Users/owner/obsidian-automation` がcommit済み変更を読み取り、Obsidianへ要約を記録することは許可する。

## Roop運用

開発を始める前に環境差分を確認する。

```bash
./scripts/ensure-agent-environment.sh
./scripts/context-brief.sh
./scripts/preflight.sh
```

1サイクル分の確認は以下を使う。進捗ログの自動記録は行わない。

```bash
./scripts/roop.sh "作業内容の要約"
```

無人roopは無効である。以下は起動しない。

```bash
./scripts/auto-roop.sh 3
```

止める場合:

```bash
touch work/roop/STOP
```

## Notion側の必須操作

1. https://www.notion.so/my-integrations でIntegrationを作成する
2. 内部インテグレーションシークレットを `NOTION_API_KEY` に入れる
3. ブログDBと公演DBの各ページ右上 `...` から `コネクトの追加` を選び、作成したIntegrationを接続する
4. 各DBで `Published` がオンの行だけがサイトへ出る

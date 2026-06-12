# 暁座サイト構成メモ

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

## Vercel環境変数

VercelのProject Settings > Environment Variablesに以下を設定する。

- `NOTION_API_KEY`: Notion Integrationの内部シークレット
- `NOTION_POSTS_DATABASE_ID`: ブログDBのID
- `NOTION_SHOWS_DATABASE_ID`: 公演DBのID

設定後に再デプロイすればNotionの公開済みデータが反映される。

## Notion側の必須操作

1. https://www.notion.so/my-integrations でIntegrationを作成する
2. 内部インテグレーションシークレットを `NOTION_API_KEY` に入れる
3. ブログDBと公演DBの各ページ右上 `...` から `コネクトの追加` を選び、作成したIntegrationを接続する
4. 各DBで `Published` がオンの行だけがサイトへ出る

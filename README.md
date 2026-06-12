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

現在は `script.js` の `shows` と `posts` がデモデータである。
Next.jsやAstroへ移す場合は、この配列をNotion APIの取得結果に置き換える。

Notion APIキーはブラウザ側へ置かない。VercelやNetlifyの環境変数に保存し、サーバー側またはビルド時だけで読む。

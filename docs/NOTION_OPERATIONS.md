# Notion運用メモ

通常の記事・公演更新では、GitHub操作やVercel deployは不要である。サイトの表示コードを変える場合だけ、このリポジトリを編集する。

## Workspace

- 正しいworkspace: C33 演劇同好会's Space
- 個人workspaceで作業しない
- Notionへ秘密情報やAPIキーを書かない

## ブログDB

- `Name`: タイトル
- `Date`: 日付
- `Category`: 種別。例: `稽古`, `制作`, `告知`
- `Author`: 著者
- `Excerpt`: 一覧用の短い概要
- `Published`: 公開フラグ
- `Likes`: いいね数
- `Image` または `画像`: 一覧カード用の任意画像

ブログ本文:

- 各行のページ本文に段落、見出し、箇条書き、番号付きリスト、引用を書ける
- 本文にNotion画像ブロックを置くと記事詳細に表示される
- 一覧カードだけに画像を出す場合は本文ではなく `Image` または `画像` に入れる

## 公演DB

- `Name`: 公演名
- `Date`: 日付
- `DisplayDate`: 表示用日付
- `Year`: 年
- `Venue`: 会場
- `Price` または `料金`: 料金表示。例: `無料`
- `Status`: 状態
- `Description`: 概要
- `Published`: 公開フラグ
- `Flyer` または `FlyerUrl`: チラシ画像
- `ReservationUrl`: 予約URL

## 公開手順

1. C33 演劇同好会's Space にいることを確認する
2. 対象DBへ公演または記事を入力する
3. 公開してよい行だけ `Published` をオンにする
4. 公開サイトで表示を確認する

## 注意

- 未確認の公演、稽古記録、著者、いいね数を作らない
- APIキー、DB ID、環境変数を公開画面やドキュメントに出さない
- 通常のNotion更新でGitHub commitやVercel deployを実行しない

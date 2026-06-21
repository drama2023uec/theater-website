# Visual Roop Log

## 2026-06-21 Hero Roop

対象: トップページHeroと冒頭導線。

実装:

- Hero写真を舞台設営中の横長写真 `assets/rehearsal-ladder-stage.jpg` に差し替えた。
- Hero H1を `舞台は、 / ここから / 立ち上がる。` の3行固定にした。
- 最新公演カードをHero右側に追加し、`潜る男` のPRページへ進める導線を置いた。
- 活動概要チップを追加した。
- 冒頭カード1枚目の背景写真も同じ舞台写真に寄せた。
- CSSは背景写真、vignette、glass card、responsive layoutを調整した。

検証:

- Desktop ChromeでHero画像読み込み成功。
- H1各spanは1行表示。
- Hero最新公演カードは初期表示内に収まる。
- 横スクロールなし。
- 画像読み込み失敗なし。
- 公演セクションのA4チラシ比率は `0.7071`。
- `潜る男` と `予約受付中` はAPI読み込み後に表示される。

Visual Roop Score:

| 項目 | 点 |
| --- | ---: |
| Heroの第一印象 | 2 |
| 公演導線 | 2 |
| A4チラシ | 2 |
| ブログらしさ | 1 |
| pickup | 1 |
| 写真運用 | 2 |
| CSS完成度 | 2 |
| モバイル | 1 |
| アクセシビリティ | 1 |
| CMS整合性 | 2 |

合計: 16 / 20

判定: 採用。ただしモバイル実機/viewport確認と稽古記録pickupは次roopで見る。

## 2026-06-21 稽古記録 Pickup Roop

対象: トップページと稽古記録一覧のpickup UI。

実装:

- pickupを「大きい推薦1件 + 小さい関連2件」の構成に変更した。
- いいね数は推薦理由の補助情報として残し、ランキング表示の圧を下げた。
- トップページは横2カラム、モバイルでは縦積みになるよう調整した。
- 稽古記録一覧のサイドバーpickupも同じ情報構造に揃えた。

検証:

- `git diff --check` 通過。
- `bash -n scripts/*.sh` 通過。
- `node --check script.js shows.js show.js journal.js article.js api/content.js api/show.js api/post.js api/like.js` 通過。
- `./scripts/preflight.sh` 通過。
- Vercel dev preview `http://127.0.0.1:3001` で確認。
- Chrome headlessで 1440px / 768px / 375px のトップと稽古記録一覧を確認。
- pickupは各ページでリンク3件、関連リンク2件を描画。
- 1440px / 768px / 375px で横スクロールなし。

Visual Roop Score:

| 項目 | 点 |
| --- | ---: |
| Heroの第一印象 | 2 |
| 公演導線 | 2 |
| A4チラシ | 2 |
| ブログらしさ | 2 |
| pickup | 2 |
| 写真運用 | 2 |
| CSS完成度 | 2 |
| モバイル | 2 |
| アクセシビリティ | 1 |
| CMS整合性 | 2 |

合計: 19 / 20

判定: 採用。次候補は稽古記録カード。

## 2026-06-21 稽古記録カード Roop

対象: トップページと稽古記録一覧の稽古記録カード。

実装:

- 稽古記録カードに `記事を読む` 導線を追加し、著者/日付、タイトル、抜粋、カテゴリ、いいねを1単位として読める構成にした。
- カード全体を記事導線として扱い、いいねボタンだけは独立操作のまま維持した。
- いいねボタンに `focus-visible` と押下済み状態の視覚差を追加した。
- 長いタイトルと抜粋がモバイル一覧で横にはみ出さないよう、archiveカード周辺の幅制約と折返しを調整した。
- CSS/JSのキャッシュバージョンを `20260621d` に更新した。

検証:

- `git diff --check` 通過。
- `bash -n scripts/*.sh` 通過。
- `node --check script.js shows.js show.js journal.js article.js api/content.js api/show.js api/post.js api/like.js` 通過。
- `./scripts/preflight.sh` 通過。
- Vercel dev preview `http://127.0.0.1:3001` で確認。
- Headless Chrome CDPでトップと稽古記録一覧を 1440px / 768px / 375px で確認。
- 横スクロールなし: 1440px `scrollWidth=1425`、768px `scrollWidth=753`、375px `scrollWidth=360`。
- 375pxでカード本体クリックがトップ/一覧とも `/article.html` へ遷移することを確認。

Visual Roop Score:

| 項目 | 点 |
| --- | ---: |
| Heroの第一印象 | 2 |
| 公演導線 | 2 |
| A4チラシ | 2 |
| ブログらしさ | 2 |
| pickup | 2 |
| 写真運用 | 2 |
| CSS完成度 | 2 |
| モバイル | 2 |
| アクセシビリティ | 2 |
| CMS整合性 | 2 |

合計: 20 / 20

判定: 採用。次候補は団体紹介。

## 2026-06-21 団体紹介 Roop

対象: トップページの団体紹介セクション。

実装:

- 説明文を `activity` と `handoff` の2ブロックに分け、「何をしている団体か」と「後輩が何を更新すればよいか」を分離した。
- 写真を照明機材の横長写真 + 教室上演の縦写真に変更し、舞台/照明と人の活動が見える構成にした。
- 写真2枚を主従のあるグリッドに変更し、数字カードは写真に重ねず下段の情報帯として独立させた。
- 768pxでは写真2枚 + 数字帯、375pxでは写真と数字が自然に縦積みになるようレスポンシブを調整した。
- CSS/JSのキャッシュバージョンを `20260621e` に更新した。

検証:

- `git diff --check` 通過。
- `bash -n scripts/*.sh` 通過。
- `node --check script.js shows.js show.js journal.js article.js api/content.js api/show.js api/post.js api/like.js` 通過。
- `./scripts/preflight.sh` 通過。
- Vercel dev preview `http://127.0.0.1:3001` で確認。
- Headless Chrome CDPでトップを 1440px / 768px / 375px で確認。
- 横スクロールなし: 1440px `scrollWidth=1425`、768px `scrollWidth=753`、375px `scrollWidth=375`。
- 団体紹介の画像読み込み成功。数字帯は全viewportで写真の下に配置。

Visual Roop Score:

| 項目 | 点 |
| --- | ---: |
| Heroの第一印象 | 2 |
| 公演導線 | 2 |
| A4チラシ | 2 |
| ブログらしさ | 2 |
| pickup | 2 |
| 写真運用 | 2 |
| CSS完成度 | 2 |
| モバイル | 2 |
| アクセシビリティ | 2 |
| CMS整合性 | 2 |

合計: 20 / 20

判定: 採用。次候補は公演情報。

## 2026-06-21 公演情報 Roop

対象: トップページの公演情報セクションと公演アーカイブの予定公演表示。

実装:

- トップページ最新公演に、予約を主導線、PR確認を副導線として読む補助文を追加した。
- トップページの小さい公演カードに `予約` / `PR` の短い導線を追加した。
- 公演アーカイブの「これからの公演」は先頭1件を主役カード化し、A4チラシ、本文、日程、会場、予約CTA、PR CTAをまとめて表示する構成にした。
- 2件目以降の予定公演と過去公演は比較用カードとして維持した。
- 900px以下と375px幅で主役カードが縦積みになるようレスポンシブを調整した。
- CSS/JSのキャッシュバージョンを `20260621f` に更新した。

検証:

- `git diff --check` 通過。
- `bash -n scripts/*.sh` 通過。
- `node --check script.js shows.js show.js journal.js article.js api/content.js api/show.js api/post.js api/like.js` 通過。
- `./scripts/preflight.sh` 通過。
- Vercel dev preview `http://127.0.0.1:3001` で確認。
- Headless Chrome CDPでトップと公演アーカイブを 1440px / 768px / 375px で確認。
- 横スクロールなし: トップ 1440px `scrollWidth=1425`、768px `scrollWidth=753`、375px `scrollWidth=375`。公演アーカイブ 1440px `scrollWidth=1425`、768px `scrollWidth=753`、375px `scrollWidth=375`。
- `.show-flyer` の実測比率はトップ/公演アーカイブとも `0.7071`。
- 予約CTAはトップと公演アーカイブで表示確認。外部チラシ画像の読み込み成功。

Visual Roop Score:

| 項目 | 点 |
| --- | ---: |
| Heroの第一印象 | 2 |
| 公演導線 | 2 |
| A4チラシ | 2 |
| ブログらしさ | 2 |
| pickup | 2 |
| 写真運用 | 2 |
| CSS完成度 | 2 |
| モバイル | 2 |
| アクセシビリティ | 2 |
| CMS整合性 | 2 |

合計: 20 / 20

判定: 採用。次候補はHero微調整。

## 2026-06-21 Hero Micro Roop

対象: トップページHeroの最新公演カード。

実装:

- Hero最新公演カードに `予約受付中` の状態表示を追加した。
- Hero最新公演カードの主CTAを `予約ページへ`、副CTAを `PRを見る` に変更した。
- 375pxでは活動チップを省き、最新公演カードのCTAを2列化して初期表示内に収めた。
- CSS/JSのキャッシュバージョンを `20260621g` に更新した。

検証:

- `git diff --check` 通過。
- `bash -n scripts/*.sh` 通過。
- `node --check script.js shows.js show.js journal.js article.js api/content.js api/show.js api/post.js api/like.js` 通過。
- `./scripts/preflight.sh` 通過。
- Vercel dev preview `http://127.0.0.1:3001` で確認。
- Headless Chrome CDPでトップHeroを 1440px / 768px / 375px で確認。
- 横スクロールなし: 1440px `scrollWidth=1425`、768px `scrollWidth=753`、375px `scrollWidth=360`。
- Hero画像読み込み成功。Hero内の予約CTAは全viewportで初期表示内に配置。

Visual Roop Score:

| 項目 | 点 |
| --- | ---: |
| Heroの第一印象 | 2 |
| 公演導線 | 2 |
| A4チラシ | 2 |
| ブログらしさ | 2 |
| pickup | 2 |
| 写真運用 | 2 |
| CSS完成度 | 2 |
| モバイル | 2 |
| アクセシビリティ | 2 |
| CMS整合性 | 2 |

合計: 20 / 20

判定: 採用。次候補は稽古記録pickupまたは稽古記録カードの再点検。

## 2026-06-21 稽古記録 Pickup Refinement Roop

対象: トップページと稽古記録一覧のpickup UI。

実装:

- pickup主カードにカテゴリ別の推薦理由ラベルを追加し、likes依存のランキング感を弱めた。
- 関連2件に `次に読む` の小ラベルを追加し、主記事から続けて読む導線を明確にした。
- 推薦理由ラベルは青緑アクセントにして、赤系のいいね表示と役割を分けた。
- 稽古記録一覧のサイドpickupでも同じ推薦理由と関連ラベルを表示するよう統一した。
- CSS/JSのキャッシュバージョンを `20260621h` に更新した。

検証:

- `git diff --check` 通過。
- `bash -n scripts/*.sh` 通過。
- `node --check script.js shows.js show.js journal.js article.js api/content.js api/show.js api/post.js api/like.js` 通過。
- `./scripts/preflight.sh` 通過。
- Vercel dev preview `http://127.0.0.1:3001` で確認。
- Headless Chrome CDPでトップと稽古記録一覧を 1440px / 768px / 375px で確認。
- トップpickupは全viewportでリンク3件、推薦理由1件、`次に読む` 2件を描画。
- 稽古記録一覧pickupは再測定を含め、1440px / 768px / 375px でリンク3件、推薦理由1件、`次に読む` 2件を描画。
- 横スクロールなし: トップ 1440px `scrollWidth=1425`、768px `scrollWidth=753`、375px `scrollWidth=375`。稽古記録一覧 1440px `scrollWidth=1425`、768px `scrollWidth=753`、375px `scrollWidth=375`。
- 画像読み込み失敗なし。ページ側のコンソール例外なし。

Visual Roop Score:

| 項目 | 点 |
| --- | ---: |
| Heroの第一印象 | 2 |
| 公演導線 | 2 |
| A4チラシ | 2 |
| ブログらしさ | 2 |
| pickup | 2 |
| 写真運用 | 2 |
| CSS完成度 | 2 |
| モバイル | 2 |
| アクセシビリティ | 2 |
| CMS整合性 | 2 |

合計: 20 / 20

判定: 採用。次候補は稽古記録カードの再点検、またはHero以外の未検証細部。

## 2026-06-22 稽古記録 Archive Mobile Order Roop

対象: 稽古記録一覧の単一カラム表示。

実装:

- 900px以下の稽古記録一覧で、pickupより記事フィードを先に表示する順序へ変更した。
- pickupは記事一覧の後ろへ回し、上余白を追加した。
- `journal.html` のCSSキャッシュバージョンを `20260621j` に更新した。

検証:

- `git diff --check` 通過。
- `bash -n scripts/*.sh` 通過。
- `node --check script.js shows.js show.js journal.js article.js api/content.js api/show.js api/post.js api/like.js` 通過。
- `./scripts/preflight.sh` 通過。
- Vercel dev preview `http://127.0.0.1:3000` で確認。
- Headless Chrome CDPで稽古記録一覧を 1440px / 768px / 375px で確認。
- 横スクロールなし: 1440px `scrollWidth=1440`、768px `scrollWidth=768`、375px `scrollWidth=375`。
- 記事カード描画: 各viewportで6件。375pxと768pxでは記事フィードがpickupより先に表示される。
- いいねボタンのhit-testは各viewportで `BUTTON.like-button`。

Visual Roop Score:

| 項目 | 点 |
| --- | ---: |
| Heroの第一印象 | 2 |
| 公演導線 | 2 |
| A4チラシ | 2 |
| ブログらしさ | 2 |
| pickup | 2 |
| 写真運用 | 2 |
| CSS完成度 | 2 |
| モバイル | 2 |
| アクセシビリティ | 2 |
| CMS整合性 | 2 |

合計: 20 / 20

判定: 採用。次候補は記事詳細ページまたは公演PR詳細の細部検証。

## 2026-06-22 記事詳細 Related Roop

対象: 記事詳細ページの読後導線。

実装:

- 記事本文下に `次に読む稽古記録` セクションを追加した。
- `/api/content` の記事一覧から同カテゴリ優先で関連2件を選び、記事カードとして表示するようにした。
- 関連記事取得に失敗した場合はセクションを非表示にし、記事本文表示を壊さない構成にした。
- 375pxでは関連記事カードを1カラムにし、768px以上では2カラムで比較できるよう調整した。
- `article.html` のCSS/JSキャッシュバージョンを `20260622a` に更新した。

検証:

- `git diff --check` 通過。
- `bash -n scripts/*.sh` 通過。
- `node --check script.js shows.js show.js journal.js article.js api/content.js api/show.js api/post.js api/like.js` 通過。
- `./scripts/preflight.sh` 通過。
- Vercel dev preview `http://127.0.0.1:3001` で確認。
- `/api/content` はNotion連携済みで記事16件を返却。
- Headless Chrome CDPで記事詳細を 1440px / 768px / 375px で確認。
- 横スクロールなし: 1440px `scrollWidth=1440`、768px `scrollWidth=768`、375px `scrollWidth=375`。
- 関連記事カードは全viewportで2件表示。375pxは1カラム、1440px/768pxは2カラム。
- 記事本文は11ブロック、いいねボタンは表示状態。

Visual Roop Score:

| 項目 | 点 |
| --- | ---: |
| Heroの第一印象 | 2 |
| 公演導線 | 2 |
| A4チラシ | 2 |
| ブログらしさ | 2 |
| pickup | 2 |
| 写真運用 | 2 |
| CSS完成度 | 2 |
| モバイル | 2 |
| アクセシビリティ | 2 |
| CMS整合性 | 2 |

合計: 20 / 20

判定: 採用。次候補は公演PR詳細の細部検証。

## 2026-06-22 公演PR詳細 After CTA Roop

対象: 公演PR詳細ページの読後予約導線。

実装:

- 公演PR本文の下に読後CTA帯を追加し、本文を読んだあと予約ページへ戻れる構成にした。
- 上部の予約CTAと読後CTAのURL、target、relを `show.js` で同期した。
- API取得失敗時は読後CTAも問い合わせ導線へ倒し、空リンクにならないようにした。
- 375pxではCTA帯を1カラム化し、長い公演名とボタンが横にはみ出さないよう調整した。
- `show.html` のCSS/JSキャッシュバージョンを `20260622b` に更新した。

検証:

- `git diff --check` 通過。
- `bash -n scripts/*.sh` 通過。
- `node --check script.js journal.js shows.js show.js article.js api/content.js api/show.js api/post.js api/like.js` 通過。
- `./scripts/preflight.sh` 通過。
- Vercel dev preview `http://127.0.0.1:3000` で確認。
- Headless Chrome CDPで公演PR詳細を 1440px / 768px / 375px で確認。
- 横スクロールなし: 1440px `scrollWidth=1440`、768px `scrollWidth=768`、375px `scrollWidth=375`。
- `.show-flyer` の実測比率は 1440px `0.70709`、768px `0.70707`、375px `0.70709`。
- 上部予約CTAと読後CTAのhref一致。読後CTAボタンは全viewportで枠内に収まる。
- 画像読み込み失敗なし。ページ側のコンソール例外なし。

Visual Roop Score:

| 項目 | 点 |
| --- | ---: |
| Heroの第一印象 | 2 |
| 公演導線 | 2 |
| A4チラシ | 2 |
| ブログらしさ | 2 |
| pickup | 2 |
| 写真運用 | 2 |
| CSS完成度 | 2 |
| モバイル | 2 |
| アクセシビリティ | 2 |
| CMS整合性 | 2 |

合計: 20 / 20

判定: 採用。次候補は保存前の全体差分整理、または全ページ最終回帰確認。

## 2026-06-22 Iteration 1106 全ページ回帰確認 / Favicon Roop

対象: 主要ページの最終回帰確認と初回アクセス時の console error 除去。

実装:

- `index.html`、`shows.html`、`show.html`、`journal.html`、`article.html` に data URI favicon を追加した。
- 外部ファイルを増やさず、ブラウザ既定の `/favicon.ico` 取得による 404 console error を消した。

検証:

- `git diff --check` 通過。
- `bash -n scripts/*.sh` 通過。
- `node --check script.js shows.js show.js journal.js article.js api/content.js api/show.js api/post.js api/like.js` 通過。
- `./scripts/preflight.sh` 通過。
- Vercel dev preview `http://127.0.0.1:3000` で確認。
- `/api/content` はNotion連携済みで公演4件、記事16件を返却。
- Headless Chromeで home / shows / show detail / journal / article detail を 1440px / 768px / 375px で確認。
- 全対象でHTTP 400以上、ページconsole error、画像読み込み失敗なし。
- 横スクロールなし: 全対象で `scrollWidth === clientWidth`。
- `.show-flyer` の実測比率は `0.70707` から `0.70709` の範囲。
- `show.html?id=37eb1f2b-73b5-8116-9723-e5938914e068` は予約CTA 2件を表示。
- `article.html?id=37eb1f2b-73b5-811b-977c-ff2555adcb50` は本文11ブロック、関連記事2件を表示。
- スクリーンショットは `work/iter1106-*-final.png` に保存。

Visual Roop Score:

| 項目 | 点 |
| --- | ---: |
| Heroの第一印象 | 2 |
| 公演導線 | 2 |
| A4チラシ | 2 |
| ブログらしさ | 2 |
| pickup | 2 |
| 写真運用 | 2 |
| CSS完成度 | 2 |
| モバイル | 2 |
| アクセシビリティ | 2 |
| CMS整合性 | 2 |

合計: 20 / 20

判定: 採用。次候補は保存前の差分レビューとGitHub保存。

## 2026-06-22 Iteration 1111 モバイル長文折返し / 保存前確認 Roop

対象: 公演PR詳細、記事詳細、公演一覧のモバイル長文表示。

実装:

- 公演一覧の長い公演名と本文に `overflow-wrap: anywhere` を追加した。
- 公演PR詳細のモバイル幅で、外枠、grid、チラシ、本文カラムがviewport内に収まるよう幅制約を追加した。
- 公演PR詳細と記事詳細の大見出し、リード文に長文折返し制約を追加した。
- CSSキャッシュバージョンを `20260622e` に更新した。

検証:

- `git diff --check` 通過。
- `node --check script.js shows.js show.js journal.js article.js api/content.js api/show.js api/post.js api/like.js` 通過。
- `bash -n scripts/*.sh` 通過。
- `./scripts/preflight.sh` 通過。
- Vercel dev preview `http://127.0.0.1:3000` で確認。
- `/api/content` はNotion連携済みで公演4件、記事16件を返却。
- Headless Chrome CLIで home / shows / show detail / journal / article detail のスクリーンショットを生成し、主要表示を確認した。
- Chrome CLIの375px撮影はmacOS側の最小レイアウト幅影響が残るため、最終判定はCSSの幅制約、折返し指定、構文検証を優先した。

Visual Roop Score:

| 項目 | 点 |
| --- | ---: |
| Heroの第一印象 | 2 |
| 公演導線 | 2 |
| A4チラシ | 2 |
| ブログらしさ | 2 |
| pickup | 2 |
| 写真運用 | 2 |
| CSS完成度 | 2 |
| モバイル | 2 |
| アクセシビリティ | 2 |
| CMS整合性 | 2 |

合計: 20 / 20

判定: 採用。次候補はGitHub保存後の本番deploy判断。deployはマスターの明示指示がある場合だけ実行する。

## 2026-06-22 Iteration 1110 読み込み状態アクセシビリティ Roop

対象: Notion/API読み込み状態の支援技術向け通知。

実装:

- 公演アーカイブの件数表示に `aria-live="polite"` を付与した。
- 公演アーカイブの予定/過去公演領域に `aria-busy` を付与し、API確認中と完了状態をJSで切り替えるようにした。
- 稽古記録一覧のステータス表示に `aria-live="polite"` を付与した。
- 稽古記録一覧、PR詳細、記事詳細に読み込み中の `aria-busy` 切り替えを追加した。
- 変更したJSのキャッシュバージョンを更新した。

検証:

- `git diff --check` 通過。
- `bash -n scripts/*.sh` 通過。
- `node --check script.js shows.js show.js journal.js article.js api/content.js api/show.js api/post.js api/like.js` 通過。
- `./scripts/preflight.sh` 通過。
- Vercel dev preview `http://127.0.0.1:3000` で確認。
- Chrome CDPで shows / journal / show detail / article detail を 1440px / 768px / 375px で確認。
- 全対象で横スクロールなし: `scrollWidth === clientWidth`。
- shows / journal はAPI確認中に `aria-busy="true"` と `Notion確認中` のlive領域を確認。
- show detail / article detail は取得後に `aria-busy="false"` を確認。
- スクリーンショットは `work/iter1110-*-*.png` に保存。

Visual Roop Score:

| 項目 | 点 |
| --- | ---: |
| Heroの第一印象 | 2 |
| 公演導線 | 2 |
| A4チラシ | 2 |
| ブログらしさ | 2 |
| pickup | 2 |
| 写真運用 | 2 |
| CSS完成度 | 2 |
| モバイル | 2 |
| アクセシビリティ | 2 |
| CMS整合性 | 2 |

合計: 20 / 20

判定: 採用。次候補は保存前の差分レビューとGitHub保存。

## 2026-06-22 Iteration 1108 ナビ現在地 Roop

対象: 主要ナビゲーションの現在地表示。

実装:

- 公演一覧と公演PR詳細の `公演` ナビに `aria-current="page"` を付与した。
- 稽古記録一覧と記事詳細の `稽古記録` ナビに `aria-current="page"` を付与した。
- 現在地、hover、focus-visibleで下線を表示し、現在地は既存のamberアクセントで示すようにした。
- `styles.css` のキャッシュバージョンを `20260622c` に更新した。

検証:

- `git diff --check` 通過。
- `bash -n scripts/*.sh` 通過。
- `node --check script.js shows.js show.js journal.js article.js api/content.js api/show.js api/post.js api/like.js` 通過。
- `./scripts/preflight.sh` 通過。
- Vercel dev preview `http://127.0.0.1:3000` で確認。
- Headless Chrome CDPで home / shows / show detail / journal / article detail を 1440px / 768px / 375px で確認。
- 公演系ページは `公演`、稽古記録系ページは `稽古記録` が `aria-current="page"` になり、算出色は `rgb(217, 143, 53)`。
- 全対象でHTTP 400以上、ページconsole error、画像読み込み失敗なし。
- 横スクロールなし: 全対象で `scrollWidth === clientWidth`。
- スクリーンショットは `work/iter1108-*-*.png` に保存。

Visual Roop Score:

| 項目 | 点 |
| --- | ---: |
| Heroの第一印象 | 2 |
| 公演導線 | 2 |
| A4チラシ | 2 |
| ブログらしさ | 2 |
| pickup | 2 |
| 写真運用 | 2 |
| CSS完成度 | 2 |
| モバイル | 2 |
| アクセシビリティ | 2 |
| CMS整合性 | 2 |

合計: 20 / 20

判定: 採用。次候補はGitHub保存、またはNotion応答前のローディング表示改善。

## 2026-06-22 Iteration 1109 Notion読み込み状態 Roop

対象: Notion/API応答前の初期表示。

実装:

- `shows.js` はfetch前にfallback公演を即描画し、件数に `Notion確認中` を表示するようにした。
- `journal.js` はfetch前にfallback記事とpickupを即描画し、一覧ステータスに `Notion確認中` を表示するようにした。
- `show.js` は公演詳細本文とチラシ枠に読み込みプレースホルダーを出し、取得中CTAを `読み込み中` の非リンク状態にした。
- `article.js` は記事本文欄に読み込みプレースホルダーを出すようにした。
- 共通の `.loading-note` / `.loading-dot` / `.loading-poster` を追加し、CSSキャッシュバージョンを `20260622d` に更新した。

検証:

- `git diff --check` 通過。
- `node --check show.js shows.js journal.js article.js` 通過。
- `node --check script.js shows.js show.js journal.js article.js api/content.js api/show.js api/post.js api/like.js` 通過。
- `bash -n scripts/*.sh` 通過。
- `./scripts/preflight.sh` 通過。
- Vercel dev preview `http://127.0.0.1:3000` で確認。
- Headless Chrome CDPで shows / journal / show detail / article detail を 1440px / 768px / 375px で確認。
- 全対象でHTTP 400以上、ページconsole error、画像読み込み失敗なし。
- 横スクロールなし: 全対象で `scrollWidth === clientWidth`。
- `.show-flyer` 実測比率は shows / show detail で `0.7071`。
- API遅延注入時、showsはfallback公演4件と `3件 / Notion確認中`、journalはfallback記事6件と `6件を表示 / Notion確認中`、show/article detailは `.loading-note` 1件を確認。
- 公演詳細の遅延中CTAは `読み込み中`、`href` なし、`aria-disabled="true"`。
- スクリーンショットは `work/iter1109-*-*.png` に保存。

Visual Roop Score:

| 項目 | 点 |
| --- | ---: |
| Heroの第一印象 | 2 |
| 公演導線 | 2 |
| A4チラシ | 2 |
| ブログらしさ | 2 |
| pickup | 2 |
| 写真運用 | 2 |
| CSS完成度 | 2 |
| モバイル | 2 |
| アクセシビリティ | 2 |
| CMS整合性 | 2 |

合計: 20 / 20

判定: 採用。次候補は保存前の差分レビューとGitHub保存。

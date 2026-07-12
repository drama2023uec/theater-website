---
version: alpha
name: UEC Drama Club Website
description: A cinematic but operational student-theatre site for finding performances, reading rehearsal notes, and joining the club.
colors:
  primary: "#8F2634"
  ink: "#171412"
  paper: "#F6F0E8"
  paper-strong: "#FFFAF2"
  stage: "#111111"
  accent-on-dark: "#D98F35"
  accent-on-light: "#9A5A13"
  muted: "#6D655D"
  white: "#FFFFFF"
typography:
  body:
    fontFamily: Hiragino Kaku Gothic ProN
    fontSize: 17px
    fontWeight: 400
    lineHeight: 1.75
  display:
    fontFamily: Shippori Mincho B1
    fontSize: 42px
    fontWeight: 700
    lineHeight: 1.2
spacing:
  xs: 8px
  sm: 12px
  md: 18px
  lg: 28px
  section: 104px
  section-mobile: 56px
rounded:
  sm: 6px
  md: 8px
components:
  button-primary:
    backgroundColor: "{colors.accent-on-dark}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
  card:
    backgroundColor: "{colors.paper-strong}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
  page-surface:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.muted}"
  stage-surface:
    backgroundColor: "{colors.stage}"
    textColor: "{colors.white}"
  label-on-light:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.accent-on-light}"
  action-link:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.white}"
---

## Overview

電気通信大学演劇同好会の実在感を、仕込み・稽古・照明の写真と舞台の暗部で伝える。観客には公演発見、入会希望者には見学情報、部員には稽古記録への最短経路を出す。映画的な第一印象は維持するが、ホームは作品詳細ページではなく、比較と移動のための編集面として扱う。

## Colors

黒と紙色を基調にする。琥珀色は照明の色であり、暗背景では `accent-on-dark`、紙・白背景ではコントラストを確保した `accent-on-light` を使う。赤は予約や記事リンクなど、実際に進む操作へ限定する。

## Typography

見出しはShippori Mincho B1の600または700だけを使う。本文とUIは端末の日本語ゴシック体を使う。モバイルで公演名を装飾のために巨大化せず、日程・会場・CTAと同時に読める大きさへ収める。

## Layout

最大幅は1280px。PCは舞台写真と情報カードの左右構成を許可する。820px以下で1列化し、620px以下ではA4ポスターを104〜112pxのサムネイルとして扱う。A4比率 `210 / 297` は全画面で維持する。ホームのモバイル全長は7,000px前後を目標とし、Pickupと通常一覧で同じ記事を重複表示しない。

## Elevation & Depth

影は写真上のフローティングカードと重要CTAに限定する。通常カードは1px境界線を基本とし、浮遊量を増やさない。ぼかしはHeroと数字カードの舞台的な奥行きにのみ使う。

## Shapes

基本角丸は8px以下。A4ポスター、記事画像、ボタン、カードで別々の角丸体系を作らない。ピル形状は状態・役割・活動情報の短いラベルだけに使う。

## Components

- 最新公演はHeroに要約、本文の公演セクションに比較可能な詳細を出す。モバイルではポスターより公演名・日程・CTAを優先する。
- その他公演はホームでは2件まで。80〜96pxのA4サムネイルと日程・会場・状態を1単位にする。
- 稽古記録はPickup 1件、関連2件、通常カード2件まで。Pickup記事を通常カードへ重複させない。
- ボタンは44px以上の操作高を持ち、hoverだけでなくfocus-visibleを明示する。

## Do's and Don'ts

- Do: 人が舞台を作っている写真、暗部と照明色、明確な公演CTA、読みやすい情報密度を使う。
- Do: 375px、768px、1440pxで横スクロールと文字切れを実測する。
- Don't: グラデーションを追加して色数を増やさない。既存の舞台照明表現以外へ広げない。
- Don't: 同じ公演、記事、画像をホーム内で大きく繰り返さない。
- Don't: A4ポスターを正方形や横長へ切り抜かない。
- Don't: 丸角の大きいカード群、巨大なマーケティングHero、不要なカルーセルを追加しない。

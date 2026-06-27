const assert = require("assert");
const fs = require("fs");

const index = fs.readFileSync("index.html", "utf8");
const styles = fs.readFileSync("styles.css", "utf8");
const script = fs.readFileSync("script.js", "utf8");
const notionDocs = `${fs.readFileSync("README.md", "utf8")}\n${fs.readFileSync("docs/NOTION_OPERATIONS.md", "utf8")}`;

const slideAssets = [
  "about-slide-01.jpg",
  "about-slide-02.jpg",
  "about-slide-03.jpg",
  "about-slide-04.jpg",
  "about-slide-05.jpg",
  "about-slide-06.jpg",
  "about-slide-07.jpg",
  "about-slide-08.jpg",
  "about-slide-09.jpg",
];

assert.ok(index.includes('class="about-slideshow"'), "about section should include a slideshow layer");

const slideCount = (index.match(/class="about-slide\b/g) || []).length;
assert.strictEqual(slideCount, slideAssets.length, "about slideshow should render all selected photos");

for (const asset of slideAssets) {
  assert.ok(fs.existsSync(`assets/${asset}`), `${asset} should exist in assets`);
  assert.ok(styles.includes(asset), `${asset} should be referenced by CSS`);
}

assert.ok(styles.includes("@keyframes aboutSlideShow"), "CSS should define the slideshow animation");
assert.ok(styles.includes("prefers-reduced-motion: reduce"), "slideshow should respect reduced motion");
assert.match(
  styles,
  /\.about-slideshow \{[\s\S]*?overflow: hidden;[\s\S]*?contain: paint;/,
  "about slideshow should clip scaled slides so they do not create horizontal scroll"
);
const aboutKeyframesStart = styles.indexOf("@keyframes aboutSlideShow");
const aboutKeyframesEnd = styles.indexOf("@media (prefers-reduced-motion: reduce)", aboutKeyframesStart);
const aboutKeyframes = styles.slice(aboutKeyframesStart, aboutKeyframesEnd);
assert.match(aboutKeyframes, /^\s*0%\s*\{\n\s*opacity:\s*0;/m, "about slideshow should fade in from transparent");
assert.match(aboutKeyframes, /^\s*4%\s*\{\n\s*opacity:\s*1;/m, "about slideshow should complete fade-in gradually");
assert.match(aboutKeyframes, /^\s*14%\s*\{\n\s*opacity:\s*0;/m, "about slideshow should fade out gradually");
assert.doesNotMatch(aboutKeyframes, /^\s*0%\s*\{\n\s*opacity:\s*1;/m, "about slideshow should not cut in at the start of each slide");
assert.ok(!styles.includes(".metrics strong {\n  font-size: 44px;\n  line-height: 1;\n  color: var(--red);"), "about metrics should not use the old red accent");

assert.ok(index.includes("物語が、<br />日常を追い越す。"), "hero should split the requested main copy into two lines");
assert.ok(!index.includes("物語が、日常を追い越す。"), "hero should not keep the requested main copy on one line");
assert.ok(!index.includes("日常を、物語が追い越す。"), "hero should not keep the previous reversed copy");
assert.ok(index.includes("舞台は、<br />ここから<br />立ち上がる。"), "hero should split the second-tier copy into three lines");
assert.ok(styles.includes(".hero-title-main"), "hero should style the main copy separately");
assert.ok(styles.includes(".hero-title-sub"), "hero should style the second-tier copy separately");
assert.ok(!script.includes("program-date-badge"), "homepage featured poster should not render a date badge over the flyer");

const introBand = index.match(/<section class="intro-band"[\s\S]*?<\/section>/)?.[0] || "";
assert.strictEqual((introBand.match(/<article/g) || []).length, 2, "intro band should contain only activity and welcome cards");
assert.ok(!index.includes("data-intro-program"), "intro band should not reserve a next stage card");
assert.ok(!script.includes("renderIntroProgram"), "homepage script should not render a next stage card");
assert.ok(!script.includes("next stage"), "homepage script should not contain next stage copy");
assert.ok(notionDocs.includes("Price") && notionDocs.includes("料金"), "Notion docs should document the price field");

const makingSection = index.match(/<section class="section system"[\s\S]*?<\/section>/)?.[0] || "";
assert.ok(makingSection.includes("企画と台本会議"), "making flow should use the requested planning title");
assert.ok(makingSection.includes("上演したい台本（創作でも既成でも）を持ち寄る。脚本、演出方針、配役、裏方まで一気通貫して決める。"), "making flow should use the requested planning copy");
assert.ok(makingSection.includes("演出を軸に、役者の稽古が始まる。並行して、公演までに舞台監督が裏方会議を開き、照明、音響、美術、衣装、広報を進めていく。"), "making flow should use the requested rehearsal copy");
assert.ok(makingSection.includes("ゲネと本番"), "making flow should use the requested final title");
assert.ok(styles.includes(".system::before"), "making section should include a richer stage-light background");
assert.ok(styles.includes(".flow li::before"), "making flow should include a visual process connector");
assert.ok(styles.includes(".flow li::after"), "making flow should include a visual process node");

assert.ok(index.includes("<strong>15人</strong>"), "member metric should include the people unit");
assert.ok(index.includes("<strong>火・金</strong>"), "activity day metric should remain visible");
assert.ok(!index.includes("<strong>10,000円</strong>"), "annual fee should not be shown as an about metric");
assert.ok(!index.includes("<small>前期5,000円 / 後期5,000円</small>"), "about metrics should not show the semester fee split");
assert.ok(index.includes("年10,000円（前期5,000円、後期5,000円）"), "join fee should show the formatted annual fee and semester split");
assert.match(styles, /\.metrics \{[\s\S]*?align-self: end;/, "desktop about metrics should sit at the lower-right of the text column");
assert.match(
  styles,
  /@media \(min-width: 1100px\) \{[\s\S]*?\.metrics \{[\s\S]*?transform: translateX\(clamp\(36px, 6vw, 96px\)\);/,
  "desktop about metrics should move right on PC widths while keeping the bottom aligned"
);
assert.ok(
  !styles.includes("clamp(42px, 6vw, 74px)"),
  "desktop about metrics should not be pushed below the members note baseline"
);

assert.match(
  styles,
  /\.about \.section-heading,\n\.about-layout \{[\s\S]*?margin-left: 0;[\s\S]*?margin-right: auto;/,
  "desktop about content should be left-anchored instead of centered"
);
assert.match(
  styles,
  /\.program-poster-panel \.show-flyer\.is-large \{[\s\S]*?object-fit: cover;/,
  "featured flyer image should fill the A4 frame"
);
assert.ok(
  !styles.includes("  .program-poster-panel {\n    padding: 22px;\n  }") && !styles.includes("  .program-poster-panel {\n    padding: 18px;\n  }"),
  "mobile program poster panel should not shrink the A4 flyer with inner padding"
);

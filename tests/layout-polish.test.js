const assert = require("assert");
const fs = require("fs");

const index = fs.readFileSync("index.html", "utf8");
const showsHtml = fs.readFileSync("shows.html", "utf8");
const showHtml = fs.readFileSync("show.html", "utf8");
const journalHtml = fs.readFileSync("journal.html", "utf8");
const articleHtml = fs.readFileSync("article.html", "utf8");
const script = fs.readFileSync("script.js", "utf8");
const journal = fs.readFileSync("journal.js", "utf8");
const styles = fs.readFileSync("styles.css", "utf8");
const pages = [index, showsHtml, showHtml, journalHtml, articleHtml];
const siteName = "電気通信大学演劇同好会 カラサソリ";
const faviconLink = '<link rel="icon" href="./assets/site-icon.svg" />';
const design = fs.readFileSync("DESIGN.md", "utf8");

const articleShellRule = styles.match(/\.article-shell\s*\{[\s\S]*?\n\}/)?.[0] || "";
assert.ok(articleShellRule.includes("padding: 96px 0 96px"), "article hero should move upward after the back link moved below it");

for (const html of pages) {
  assert.ok(html.includes(faviconLink), "all pages should use the shared tab icon asset");
  assert.ok(html.includes(`${siteName} トップへ`), "all page headers should use the full site name in the top-link label");
  assert.ok(html.includes(`<span>${siteName}</span>`), "all visible brand labels should use the full site name");
  assert.ok(!html.includes("| 演劇同好会"), "page titles should not use the short site name");
}
assert.ok(styles.includes('background-image: url("./assets/site-icon.svg")'), "header brand mark should use the same artwork as the tab icon");
assert.ok(design.includes('accent-on-light: "#9A5A13"'), "design contract should define the accessible light-surface accent");
assert.ok(styles.includes("--amber-on-light: #9a5a13"), "CSS should implement the accessible light-surface accent");
assert.match(styles, /:where\(a, button, input, textarea, select\):focus-visible/, "interactive elements should share a visible keyboard focus treatment");
assert.ok(index.includes("rehearsal-ladder-stage.webp"), "home hero should prefer the optimized WebP image");
assert.ok(index.includes('fetchpriority="high"'), "home hero should be prioritized for initial rendering");
assert.ok(!index.includes("wght@500;600;700;800"), "home page should not load unused display font weights");

const metricsRule = styles.match(/\.metrics\s*\{[\s\S]*?\n\}/)?.[0] || "";
const desktopMetricsRule = styles.match(/@media \(min-width: 1100px\) \{[\s\S]*?\.metrics\s*\{[\s\S]*?\n  \}[\s\S]*?\n\}/)?.[0] || "";
assert.ok(metricsRule.includes("justify-self: start"), "about metrics should keep the narrow-layout default");
assert.match(styles, /@media \(min-width: 1100px\) \{[\s\S]*?\.about-layout\s*\{[\s\S]*?max-width: none;[\s\S]*?width: 100%;/, "desktop about layout should span the viewport so metrics can tuck near the photo edge");
assert.ok(desktopMetricsRule.includes("justify-self: end"), "desktop about metrics should sit to the right on PC widths");
assert.ok(desktopMetricsRule.includes("transform: translateX(clamp(28px, 4vw, 52px))"), "desktop about metrics should move closer to the photo edge without crossing it");
assert.ok(!styles.includes("transform: translateX(clamp(36px, 6vw, 96px))"), "desktop about metrics should not use the old overflow push");

const categoryButtons = ["all", "稽古", "役者", "裏方", "告知", "その他"];
for (const html of [index, journalHtml]) {
  for (const category of categoryButtons) {
    assert.ok(html.includes(`data-filter="${category}"`), `journal filters should include ${category}`);
  }
  assert.ok(html.indexOf('data-filter="all"') < html.indexOf('data-filter="稽古"'), "journal filters should put ALL before rehearsal");
  assert.ok(html.includes('data-filter="all" role="tab" aria-selected="true">ALL</button>'), "ALL should be the active first journal filter");
  assert.ok(!html.includes('data-filter="制作"'), "journal filters should not include the old production tab");
}
const segmentedRule = styles.match(/^\.segmented\s*\{[\s\S]*?\n\}/m)?.[0] || "";
const segmentedButtonRule = styles.match(/^\.segmented button\s*\{[\s\S]*?\n\}/m)?.[0] || "";
assert.ok(segmentedRule.includes("grid-template-columns: repeat(6, 1fr)"), "journal filter buttons should stay on one row with six columns");
assert.ok(segmentedButtonRule.includes("white-space: nowrap"), "journal filter labels should not break inside the one-row controls");
assert.ok(script.includes('const DEFAULT_POST_FILTER = "all"'), "home journal should show all posts by default");
assert.ok(journal.includes('const DEFAULT_POST_FILTER = "all"'), "journal archive should show all posts by default");
assert.ok(script.includes("chooseContentFilter"), "home journal should fall back to a category that has posts");
assert.ok(journal.includes("chooseContentFilter"), "journal archive should fall back to a category that has posts");

const showGridRule = styles.match(/\.show-grid\s*\{[\s\S]*?\n\}/)?.[0] || "";
const programFeatureRule = styles.match(/\.program-feature\s*\{[\s\S]*?\n\}/)?.[0] || "";
const programNextRule = styles.match(/\.program-next-list\s*\{[\s\S]*?\n\}/)?.[0] || "";
assert.ok(showGridRule.includes("align-items: stretch"), "latest and next program columns should stretch to a shared bottom");
assert.ok(programFeatureRule.includes("height: 100%"), "latest program card should fill the program row height");
assert.ok(programNextRule.includes("height: 100%"), "next program box should fill the program row height");

const archiveGridRule = styles.match(/\.archive-page \.post-grid\s*\{[\s\S]*?\n\}/)?.[0] || "";
const archiveCardRule = styles.match(/\.archive-page \.post-card\s*\{[\s\S]*?\n\}/)?.[0] || "";
assert.ok(archiveGridRule.includes("display: grid"), "journal archive should lay articles out as separated cards");
assert.ok(archiveGridRule.includes("grid-template-columns: 1fr"), "journal archive should keep note-style articles in a single readable column");
assert.ok(archiveGridRule.includes("gap:"), "journal archive cards should have visible spacing between articles");
assert.ok(archiveCardRule.includes("border: 1px solid"), "journal archive article cards should be individually boxed");
assert.ok(archiveCardRule.includes("border-radius: 8px"), "journal archive article cards should keep the local card radius");
assert.ok(archiveCardRule.includes("box-shadow:"), "journal archive cards should separate from the page like note-style cards");

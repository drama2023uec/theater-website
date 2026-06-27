const assert = require("assert");
const fs = require("fs");

const index = fs.readFileSync("index.html", "utf8");
const journalHtml = fs.readFileSync("journal.html", "utf8");
const script = fs.readFileSync("script.js", "utf8");
const journal = fs.readFileSync("journal.js", "utf8");
const styles = fs.readFileSync("styles.css", "utf8");

const articleShellRule = styles.match(/\.article-shell\s*\{[\s\S]*?\n\}/)?.[0] || "";
assert.ok(articleShellRule.includes("padding: 96px 0 96px"), "article hero should move upward after the back link moved below it");

const metricsRule = styles.match(/\.metrics\s*\{[\s\S]*?\n\}/)?.[0] || "";
assert.ok(metricsRule.includes("justify-self: start"), "desktop about metrics should sit to the left on PC widths");
assert.ok(!styles.includes("transform: translateX(clamp(36px, 6vw, 96px))"), "desktop about metrics should not be pushed to the right");

const categoryButtons = ["稽古", "役者", "裏方", "告知", "その他"];
for (const html of [index, journalHtml]) {
  for (const category of categoryButtons) {
    assert.ok(html.includes(`data-filter="${category}"`), `journal filters should include ${category}`);
  }
  assert.ok(!html.includes('data-filter="all"'), "journal filters should not include the old all tab");
  assert.ok(!html.includes('data-filter="制作"'), "journal filters should not include the old production tab");
}
assert.ok(script.includes('const DEFAULT_POST_FILTER = "稽古"'), "home journal should keep rehearsal as the default filter");
assert.ok(journal.includes('const DEFAULT_POST_FILTER = "稽古"'), "journal archive should keep rehearsal as the default filter");
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

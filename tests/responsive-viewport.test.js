const assert = require("assert");
const fs = require("fs");

const htmlFiles = ["index.html", "shows.html", "show.html", "journal.html", "article.html"];
const viewportMeta = '<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />';

for (const file of htmlFiles) {
  const text = fs.readFileSync(file, "utf8");
  assert.ok(text.includes(viewportMeta), `${file} should use the site viewport contract`);
}

const styles = fs.readFileSync("styles.css", "utf8");

assert.match(styles, /html \{[\s\S]*?overflow-x: clip;/, "root should clip horizontal overflow from animated layers");
assert.match(styles, /body \{[\s\S]*?overflow-x: hidden;/, "body should not expose horizontal scroll");
assert.ok(styles.includes("@media (max-width: 820px)"), "tablet layout should start below PC-ish widths");
assert.ok(!styles.includes("@media (max-width: 900px)"), "900px should not trigger the compact tablet layout");

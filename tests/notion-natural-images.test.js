const assert = require("assert");
const fs = require("fs");

const article = fs.readFileSync("article.js", "utf8");
const show = fs.readFileSync("show.js", "utf8");
const showApi = fs.readFileSync("api/show.js", "utf8");
const styles = fs.readFileSync("styles.css", "utf8");

for (const [name, script] of [
  ["article", article],
  ["show", show],
]) {
  assert.ok(script.includes("function applyNaturalImageSize"), `${name} should read rendered image dimensions`);
  assert.ok(script.includes("image.naturalWidth"), `${name} should read natural image width`);
  assert.ok(script.includes("image.naturalHeight"), `${name} should read natural image height`);
  assert.ok(script.includes("--image-natural-width"), `${name} should expose natural width to CSS`);
  assert.ok(script.includes('setAttribute("width", String(width))'), `${name} should set a width attribute`);
  assert.ok(script.includes('setAttribute("height", String(height))'), `${name} should set a height attribute`);
  assert.ok(script.includes("data-natural-image"), `${name} should mark Notion images`);
}

assert.ok(showApi.includes('block.type === "image"'), "show API should expose Notion image blocks");
assert.ok(showApi.includes("caption"), "show API should expose image captions");
assert.ok(styles.includes("width: min(100%, var(--image-natural-width"), "Notion body images should keep natural width until constrained");
assert.ok(styles.includes("height: auto"), "Notion body images should keep natural aspect ratio");
assert.ok(!styles.match(/\\.article-image img\\s*{[^}]*object-fit:\\s*cover/s), "article body images should not be cropped");

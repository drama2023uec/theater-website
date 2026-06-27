const assert = require("assert");
const fs = require("fs");

const contentApi = fs.readFileSync("api/content.js", "utf8");
const postApi = fs.readFileSync("api/post.js", "utf8");
const showApi = fs.readFileSync("api/show.js", "utf8");
const journal = fs.readFileSync("journal.js", "utf8");
const home = fs.readFileSync("script.js", "utf8");
const articleHtml = fs.readFileSync("article.html", "utf8");
const article = fs.readFileSync("article.js", "utf8");
const show = fs.readFileSync("show.js", "utf8");
const styles = fs.readFileSync("styles.css", "utf8");
const readme = fs.readFileSync("README.md", "utf8");
const notionDocs = fs.readFileSync("docs/NOTION_OPERATIONS.md", "utf8");

assert.ok(contentApi.includes("imageUrl"), "content API should expose post imageUrl");
assert.ok(contentApi.includes('"画像"'), "content API should read the Japanese image property");
assert.ok(contentApi.includes('"Image"'), "content API should read the English image property");

assert.ok(postApi.includes('block.type === "image"'), "post API should keep Notion image blocks");
assert.ok(postApi.includes("caption"), "post API should expose image captions");
assert.ok(postApi.includes("pageCoverUrl(page)"), "post API should prefer the Notion page cover for the article hero");
assert.ok(showApi.includes('block.type === "image"'), "show API should keep Notion image blocks");

assert.ok(journal.includes("post.imageUrl"), "journal archive cards should render optional post images");
assert.ok(home.includes("post.imageUrl"), "home journal cards should render optional post images");
assert.ok(home.includes("home-pickup-image"), "home latest journal should render a pickup image when available");
assert.ok(articleHtml.includes("data-article-hero"), "article detail should reserve a header image slot");
assert.ok(article.includes("heroImageEl"), "article renderer should control the header image slot");
assert.ok(article.includes("post.imageUrl"), "article renderer should render the Notion image property as a header image");
assert.ok(article.includes("blocksHtml(post.blocks, post.imageUrl)"), "article renderer should compare body images with the header image");
assert.ok(article.includes("block.url === heroImageUrl"), "article renderer should not duplicate the header image in the body");
assert.ok(article.includes('block.type === "image"'), "article renderer should render image blocks");
assert.ok(article.includes("article-image"), "article renderer should use a stable image class");
assert.ok(article.includes("data-natural-image"), "article renderer should mark Notion images for natural sizing");
assert.ok(article.includes("activateNaturalImages(bodyEl)"), "article renderer should activate natural image sizing after rendering");
assert.ok(show.includes("data-natural-image"), "show renderer should mark Notion images for natural sizing");
assert.ok(show.includes("activateNaturalImages(blocksEl)"), "show renderer should activate natural image sizing after rendering");

assert.ok(styles.includes(".post-card-image"), "CSS should style journal card images");
assert.ok(styles.includes(".home-pickup-image"), "CSS should style the latest journal image");
assert.ok(styles.includes(".article-hero-image"), "CSS should style article header images");
assert.ok(styles.includes("width: 100vw"), "CSS should make article header images edge-to-edge");
assert.ok(styles.includes(".article-image"), "CSS should style article body images");
assert.ok(styles.includes(".notion-image img"), "CSS should style natural Notion images");
assert.ok(styles.includes("var(--image-natural-width"), "CSS should respect the image natural width");
assert.ok(styles.includes("object-fit: contain"), "CSS should preserve full Notion image contents");

assert.ok(readme.includes("`Image` または `画像`"), "README should document optional journal images");
assert.ok(notionDocs.includes("`Image` または `画像`"), "Notion docs should document optional journal images");

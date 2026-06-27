const assert = require("assert");
const fs = require("fs");

const articleHtml = fs.readFileSync("article.html", "utf8");
const articleJs = fs.readFileSync("article.js", "utf8");
const styles = fs.readFileSync("styles.css", "utf8");
const readme = fs.readFileSync("README.md", "utf8");
const notionDocs = fs.readFileSync("docs/NOTION_OPERATIONS.md", "utf8");

const excerptIndex = articleHtml.indexOf("data-article-excerpt");
const likeIndex = articleHtml.indexOf("data-article-like");
assert.ok(excerptIndex !== -1, "article page should keep the excerpt element");
assert.ok(likeIndex !== -1, "article page should keep the article like button");
assert.ok(excerptIndex < likeIndex, "article like button should appear after the excerpt");

assert.ok(articleHtml.includes("data-article-comments"), "article page should include a comments section");
assert.ok(articleHtml.includes("data-article-comment-form"), "article page should include a comment form");
assert.ok(articleHtml.includes("data-article-comment-list"), "article page should include a comment list");
assert.ok(articleHtml.includes("data-article-comment-status"), "article page should include a comment status region");
assert.ok(articleHtml.includes('name="website"'), "comment form should include a honeypot field");
assert.ok(articleHtml.includes("article.js?v=20260627b"), "article page should load the updated article script");

assert.ok(articleJs.includes("commentFormEl"), "article script should bind the comment form");
assert.ok(articleJs.includes("loadComments"), "article script should load comments");
assert.ok(articleJs.includes('fetch(`/api/comments?id=${encodeURIComponent(postId)}`'), "article script should fetch comments by post id");
assert.ok(articleJs.includes('fetch("/api/comments"'), "article script should post comments");
assert.ok(articleJs.includes("commentBodyHtml"), "article script should render comment line breaks safely");

assert.ok(styles.includes(".article-comments"), "CSS should style article comments");
assert.ok(styles.includes(".article-comment-form"), "CSS should style the comment form");
assert.ok(styles.includes(".comment-honeypot"), "CSS should hide the honeypot field");

assert.ok(readme.includes("NOTION_COMMENTS_DATABASE_ID"), "README should document the optional comments database env var");
assert.ok(notionDocs.includes("コメントDB"), "Notion operations should document the comments database");

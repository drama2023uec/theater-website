const assert = require("assert");
const fs = require("fs");
const vm = require("vm");

async function loadPostWithCover() {
  const source = fs.readFileSync("api/post.js", "utf8");
  const context = {
    console,
    fetch: async (url) => {
      if (url.includes("/blocks/")) {
        return {
          ok: true,
          json: async () => ({ results: [] }),
        };
      }

      return {
        ok: true,
        json: async () => ({
          cover: {
            type: "file",
            file: { url: "https://example.com/notion-cover.jpg" },
          },
          properties: {
            Name: { type: "title", title: [{ plain_text: "cover test" }] },
            Date: { type: "date", date: { start: "2026-06-27" } },
            Category: { type: "select", select: { name: "その他" } },
            Author: { type: "rich_text", rich_text: [{ plain_text: "代表" }] },
            Excerpt: { type: "rich_text", rich_text: [{ plain_text: "excerpt" }] },
            画像: {
              type: "files",
              files: [{ type: "external", external: { url: "https://example.com/property-image.jpg" } }],
            },
          },
        }),
      };
    },
    module: { exports: {} },
    process: { env: { NOTION_API_KEY: "test-token" } },
    require,
  };

  vm.createContext(context);
  vm.runInContext(source, context);

  let payload;
  await context.module.exports(
    { method: "GET", query: { id: "post-id" } },
    {
      setHeader() {},
      status() {
        return {
          json(data) {
            payload = data;
          },
        };
      },
    },
  );

  return payload;
}

(async () => {
  const post = await loadPostWithCover();
  assert.strictEqual(post.imageUrl, "https://example.com/notion-cover.jpg", "post API should prefer the Notion page cover for the article hero");

  const styles = fs.readFileSync("styles.css", "utf8");
  const heroRule = styles.match(/\.article-hero-image\s*\{[\s\S]*?\n\}/)?.[0] || "";
  assert.ok(heroRule.includes("width: 100vw"), "article hero should span the viewport width");
  assert.ok(heroRule.includes("margin-left: calc(50% - 50vw)"), "article hero should break out of the article column to the left edge");
  assert.ok(heroRule.includes("border-radius: 0"), "edge-to-edge article hero should not look like an inset card");
  assert.ok(heroRule.includes("height: clamp("), "article hero should use a banner-like display height");
})();

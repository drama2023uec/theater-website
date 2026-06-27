const assert = require("assert");
const fs = require("fs");
const vm = require("vm");

async function renderPostApiWithBlocks(blocks) {
  const code = fs.readFileSync("api/post.js", "utf8");
  const context = {
    console,
    process: { env: { NOTION_API_KEY: "test-notion-key" } },
    module: { exports: {} },
    exports: {},
    fetch: async (url) => {
      if (url.includes("/pages/")) {
        return {
          ok: true,
          json: async () => ({
            properties: {
              Name: { type: "title", title: [{ plain_text: "改行テスト" }] },
              Date: { type: "date", date: { start: "2026-06-27" } },
            },
          }),
        };
      }

      if (url.includes("/blocks/")) {
        return {
          ok: true,
          json: async () => ({ results: blocks }),
        };
      }

      throw new Error(`Unexpected fetch URL: ${url}`);
    },
  };

  vm.createContext(context);
  vm.runInContext(code, context);

  let statusCode = 0;
  let payload;
  const response = {
    setHeader() {},
    status(code) {
      statusCode = code;
      return this;
    },
    json(body) {
      payload = body;
      return this;
    },
  };

  await context.module.exports({ method: "GET", query: { id: "post-id" } }, response);
  assert.strictEqual(statusCode, 200);
  return payload;
}

function loadArticleRenderer() {
  const code = fs.readFileSync("article.js", "utf8").replace(/\nloadArticle\(\);\s*$/, "\n");
  const element = () => ({
    addEventListener() {},
    classList: { toggle() {} },
    hidden: false,
    innerHTML: "",
    removeAttribute() {},
    setAttribute() {},
    textContent: "",
  });
  const context = {
    console,
    document: { querySelector: element },
    fetch: async () => ({ ok: true, json: async () => ({}) }),
    URLSearchParams,
    window: {
      localStorage: {
        getItem: () => null,
        removeItem() {},
        setItem() {},
      },
      location: { search: "" },
    },
  };

  vm.createContext(context);
  vm.runInContext(code, context);
  return context;
}

(async () => {
  const post = await renderPostApiWithBlocks([
    { type: "paragraph", paragraph: { rich_text: [] } },
    { type: "paragraph", paragraph: { rich_text: [{ plain_text: "一行目\n\n二行目" }] } },
    { type: "quote", quote: { rich_text: [{ plain_text: "引用一行目\n引用二行目" }] } },
  ]);

  assert.strictEqual(post.blocks.length, 3, "post API should keep empty paragraph blocks as article spacing");
  assert.deepStrictEqual(
    post.blocks.map((block) => block.type),
    ["paragraph", "paragraph", "quote"],
    "post API should preserve the Notion block sequence",
  );
  assert.strictEqual(post.blocks[1].text, "一行目\n\n二行目", "post API should preserve line breaks inside a block");

  const { blocksHtml } = loadArticleRenderer();
  const html = blocksHtml(post.blocks);

  assert.ok(html.includes("<p><br></p>"), "article renderer should render empty paragraphs as visible spacing");
  assert.ok(html.includes("一行目<br><br>二行目"), "article renderer should render paragraph line breaks");
  assert.ok(html.includes("<blockquote>引用一行目<br>引用二行目</blockquote>"), "article renderer should render quote line breaks");
})();

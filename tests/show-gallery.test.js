const assert = require("assert");
const fs = require("fs");
const vm = require("vm");

const showHtml = fs.readFileSync("show.html", "utf8");
assert.ok(showHtml.includes("./show.js?v=20260627a"), "show detail page should load the bumped gallery script asset");

function createElement() {
  return {
    classList: {
      add() {},
      remove() {},
      toggle() {},
    },
    dataset: {},
    href: "",
    innerHTML: "",
    rel: "",
    target: "",
    textContent: "",
    removeAttribute() {},
    setAttribute() {},
  };
}

async function loadApiShowWithMultiFlyer() {
  const source = fs.readFileSync("api/show.js", "utf8");
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
          properties: {
            Name: { type: "title", title: [{ plain_text: "複数画像の公演" }] },
            Date: { type: "date", date: { start: "2026-07-01" } },
            Flyer: {
              type: "files",
              files: [
                { type: "external", external: { url: "https://example.com/flyer-1.jpg" } },
                { type: "external", external: { url: "https://example.com/flyer-2.jpg" } },
              ],
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
    { method: "GET", query: { id: "show-id" } },
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

function loadShowFlyerHtml() {
  const source = fs.readFileSync("show.js", "utf8").replace(/\nloadShow\(\);\s*$/, "\n");
  const context = {
    console,
    document: {
      title: "",
      querySelector() {
        return createElement();
      },
    },
    fetch() {},
    window: {
      location: { search: "" },
    },
  };
  vm.createContext(context);
  vm.runInContext(source, context);
  return (show) => vm.runInContext("flyerHtml(__show)", Object.assign(context, { __show: show }));
}

(async () => {
  const apiShow = await loadApiShowWithMultiFlyer();
  assert.deepStrictEqual(apiShow.flyerUrls, ["https://example.com/flyer-1.jpg", "https://example.com/flyer-2.jpg"]);
  assert.strictEqual(apiShow.flyerUrl, "https://example.com/flyer-1.jpg");

  const flyerHtml = loadShowFlyerHtml();
  const html = flyerHtml({
    title: "複数画像の公演",
    flyerUrls: ["https://example.com/flyer-1.jpg", "https://example.com/flyer-2.jpg"],
  });

  assert.ok(html.includes('class="show-flyer-gallery"'), "multi-flyer detail view should render a tap carousel");
  assert.ok(html.includes('class="show-flyer-track"'), "multi-flyer detail view should render a controlled track");
  assert.ok(html.includes('data-gallery-action="prev"'), "multi-flyer detail view should render a previous button");
  assert.ok(html.includes('data-gallery-action="next"'), "multi-flyer detail view should render a next button");
  assert.ok(html.includes('data-gallery-dot="0"'), "multi-flyer detail view should render tappable dots");
  assert.ok(html.includes('data-gallery-current'), "multi-flyer detail view should render current position text");
  assert.ok(!html.includes("横にスクロールできます"), "multi-flyer detail view should not rely on scroll instructions");
  assert.ok(html.includes('aria-label="公演画像 1 / 2"'), "first flyer should have position in accessible label");
  assert.ok(html.includes('aria-label="公演画像 2 / 2"'), "second flyer should have position in accessible label");
  assert.strictEqual((html.match(/class="show-flyer is-large"/g) || []).length, 2);
})();

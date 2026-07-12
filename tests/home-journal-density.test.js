const assert = require("assert");
const fs = require("fs");
const vm = require("vm");

const postRoot = {
  innerHTML: "",
  addEventListener() {},
};

const source = fs.readFileSync("script.js", "utf8").replace(/\nloadContent\(\);\s*$/, "\n");
const context = {
  console: { warn() {} },
  document: {
    querySelector(selector) {
      return selector === "[data-posts]" ? postRoot : null;
    },
    querySelectorAll() {
      return [];
    },
  },
  window: {
    addEventListener() {},
    localStorage: null,
    location: {},
    scrollY: 0,
    innerHeight: 900,
  },
};

vm.createContext(context);
vm.runInContext(source, context);
vm.runInContext(
  `
    currentPosts = [
      { id: "picked", title: "Pickup記事", category: "稽古", date: "2026.07.01" },
      { id: "second", title: "通常記事1", category: "稽古", date: "2026.06.30" },
      { id: "third", title: "通常記事2", category: "裏方", date: "2026.06.29" },
      { id: "fourth", title: "通常記事3", category: "告知", date: "2026.06.28" }
    ];
    renderPosts("all");
  `,
  context,
);

assert.ok(!postRoot.innerHTML.includes("Pickup記事"), "pickup article should not be duplicated in the regular home feed");
assert.ok(postRoot.innerHTML.includes("通常記事1"), "home feed should include the next article");
assert.ok(postRoot.innerHTML.includes("通常記事2"), "home feed should include two supporting articles");
assert.ok(!postRoot.innerHTML.includes("通常記事3"), "home feed should stop after two supporting articles");
assert.strictEqual((postRoot.innerHTML.match(/class="post-card reveal"/g) || []).length, 2, "home feed should render two cards");
assert.ok(postRoot.innerHTML.includes('aria-label="いいね ♥ 0"'), "like button name should include its visible icon and count");

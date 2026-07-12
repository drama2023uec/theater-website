const assert = require("assert");
const fs = require("fs");
const vm = require("vm");

const heroRoot = { innerHTML: "" };
const index = fs.readFileSync("index.html", "utf8");
assert.ok(index.includes("./script.js?v=20260713a"), "home page should load the bumped hero program script asset");

const source = fs.readFileSync("script.js", "utf8").replace(/\nloadContent\(\);\s*$/, "\n");
const context = {
  console: { warn() {} },
  document: {
    querySelector(selector) {
      return selector === "[data-hero-program]" ? heroRoot : null;
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
  },
};

vm.createContext(context);
vm.runInContext(source, context);
vm.runInContext(
  `
    currentShows = [{
      id: "show-1",
      title: "梅雨公演",
      shortTitle: "潜る男",
      status: "予約受付中",
      rawDate: "2026-07-01",
      date: "7.1",
      year: "2026",
      venue: "電気通信大学 講堂",
      flyerUrl: "https://example.com/flyer.jpg"
    }];
    renderHeroProgram();
  `,
  context,
);

assert.ok(heroRoot.innerHTML.includes('class="hero-program-flyer"'), "hero next program should include an A4 flyer frame");
assert.ok(heroRoot.innerHTML.includes('class="show-flyer '), "hero next program should render the shared A4 flyer");
assert.ok(heroRoot.innerHTML.includes("https://example.com/flyer.jpg"), "hero next program should use the show flyer URL");
assert.ok(heroRoot.innerHTML.includes('href="./show.html?id=show-1"'), "hero flyer should link to the show detail");
assert.ok(!heroRoot.innerHTML.includes("<dt>会場</dt>"), "hero next program should not show the venue label");
assert.ok(!heroRoot.innerHTML.includes("電気通信大学 講堂"), "hero next program should not show the venue value");

vm.runInContext(
  `
    currentShows = [{
      id: "show-2",
      title: "準備中公演",
      status: "準備中",
      rawDate: "2026-08-01",
      date: "8.1",
      year: "2026",
      reservationUrl: "準備中"
    }];
    renderHeroProgram();
  `,
  context,
);

assert.ok(!heroRoot.innerHTML.includes('href="準備中"'), "hero next program should not link non-URL reservation text");
assert.ok(!heroRoot.innerHTML.includes(">予約する</a>"), "hero next program should not show reservation CTA for non-URL reservation text");

const styles = fs.readFileSync("styles.css", "utf8");
assert.ok(styles.includes(".hero-program-flyer"), "hero next program flyer should have scoped layout styles");
assert.match(
  styles,
  /@media \(min-width: 1100px\) \{[\s\S]*?\.hero-program-card \{[\s\S]*?transform: translateX\(clamp\(-48px, -2\.4vw, -24px\)\);/,
  "desktop hero next program card should tuck slightly left on wide PC layouts"
);
assert.match(
  styles,
  /@media \(max-width: 620px\) \{[\s\S]*?\.hero-program-topline \{[\s\S]*?align-items: flex-start;[\s\S]*?flex-direction: column;/,
  "mobile hero next program status should stack to avoid horizontal overflow"
);

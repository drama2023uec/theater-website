const assert = require("assert");
const fs = require("fs");
const vm = require("vm");

const showRoot = {
  innerHTML: "",
  classList: {
    toggle() {},
  },
};
const heroRoot = { innerHTML: "" };

const source = fs.readFileSync("script.js", "utf8").replace(/\nloadContent\(\);\s*$/, "\n");
const styles = fs.readFileSync("styles.css", "utf8");
const context = {
  console: { warn() {} },
  document: {
    querySelector(selector) {
      if (selector === "[data-shows]") return showRoot;
      if (selector === "[data-hero-program]") return heroRoot;
      return null;
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

function renderFeaturedTitle(title) {
  showRoot.innerHTML = "";
  context.__title = title;
  vm.runInContext(
    `
      currentShows = [{
        id: "show-1",
        title: __title,
        rawDate: "2030-07-01",
        status: "予約受付中",
        date: "7.1",
        year: "2030",
        venue: "劇場",
        price: "無料"
      }];
      renderShows();
    `,
    context,
  );
  return showRoot.innerHTML;
}

function renderProgramSections(shows) {
  showRoot.innerHTML = "";
  heroRoot.innerHTML = "";
  context.__shows = shows;
  vm.runInContext(
    `
      currentShows = __shows;
      renderHeroProgram();
      renderShows();
    `,
    context,
  );
  return { heroHtml: heroRoot.innerHTML, showsHtml: showRoot.innerHTML };
}

for (const [title, prefix, quoted] of [
  ["2026梅雨公演「潜る男」", "2026梅雨公演", "「潜る男」"],
  ["第12回 東京学生演劇祭「最後のサイコキネシスを」", "第12回 東京学生演劇祭", "「最後のサイコキネシスを」"],
  ["2027春公演『銀河鉄道の夜』", "2027春公演", "『銀河鉄道の夜』"],
]) {
  const html = renderFeaturedTitle(title);
  assert.ok(html.includes(`<span class="program-title-prefix">${prefix}</span>`), `${title} should keep the prefix before the quote`);
  assert.ok(html.includes(`<span class="program-title-quoted">${quoted}</span>`), `${title} should keep the quoted title together`);
}

const plainHtml = renderFeaturedTitle("春公演");
assert.ok(plainHtml.includes("<h3>春公演</h3>"), "titles without Japanese quotes should keep the existing plain title markup");

{
  const { heroHtml, showsHtml } = renderProgramSections([
    {
      id: "show-1",
      title: "2026梅雨公演『潜る男』",
      rawDate: "2030-07-01",
      status: "予約受付中",
      date: "7.1",
      year: "2030",
      venue: "劇場",
      price: "無料",
    },
    {
      id: "show-2",
      title: "第12回 東京学生演劇祭『最後のサイコキネシスを』",
      rawDate: "2030-08-01",
      status: "準備中",
      date: "8.1",
      year: "2030",
      venue: "劇場",
      price: "未定",
      reservationUrl: "準備中",
    },
  ]);

  assert.ok(heroHtml.includes('<span class="program-title-prefix">2026梅雨公演</span>'), "hero next program should split the prefix");
  assert.ok(heroHtml.includes('<span class="program-title-quoted">『潜る男』</span>'), "hero next program should keep the quoted title together");
  assert.ok(
    showsHtml.includes('<span class="program-title-prefix">第12回 東京学生演劇祭</span>'),
    "next list titles should split the prefix"
  );
  assert.ok(
    showsHtml.includes('<span class="program-title-quoted">『最後のサイコキネシスを』</span>'),
    "next list titles should keep the quoted title together"
  );
  assert.ok(!showsHtml.includes('href="準備中"'), "next list cards should not link non-URL reservation text");
}

const quotedTitleStyles =
  [...styles.matchAll(/\.program-title-quoted\s*\{[\s\S]*?\n\}/g)].map((match) => match[0]).find((block) => block.includes("white-space")) || "";
assert.ok(quotedTitleStyles.includes("white-space: normal;"), "quoted program titles should be allowed to wrap");
assert.ok(quotedTitleStyles.includes("overflow-wrap: anywhere;"), "long quoted program titles should not overflow their card");
assert.ok(!quotedTitleStyles.includes("white-space: nowrap;"), "quoted program titles should not force one unbroken line");
assert.ok(
  styles.includes(".poster-fallback > span,\n.poster-fallback > em"),
  "poster fallback metadata styles should not override nested program title spans",
);
assert.ok(
  styles.includes(".mini-show-card .poster-fallback > span,\n.mini-show-card .poster-fallback > em"),
  "mini poster fallback metadata styles should not override nested program title spans",
);

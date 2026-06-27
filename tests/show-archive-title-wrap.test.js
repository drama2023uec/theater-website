const assert = require("assert");
const fs = require("fs");
const vm = require("vm");

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
    querySelector() {
      return null;
    },
    querySelectorAll() {
      return [];
    },
    removeAttribute() {},
    setAttribute() {},
  };
}

function loadShowsArchive() {
  const upcomingRoot = createElement();
  const pastRoot = createElement();
  const upcomingCount = createElement();
  const pastCount = createElement();
  const source = fs.readFileSync("shows.js", "utf8").replace(/\nloadContent\(\);\s*$/, "\n");
  const context = {
    console: { warn() {} },
    document: {
      querySelector(selector) {
        if (selector === "[data-upcoming-shows]") return upcomingRoot;
        if (selector === "[data-past-shows]") return pastRoot;
        if (selector === "[data-upcoming-count]") return upcomingCount;
        if (selector === "[data-past-count]") return pastCount;
        return null;
      },
      querySelectorAll() {
        return [];
      },
    },
    window: {},
  };

  vm.createContext(context);
  vm.runInContext(source, context);
  return { context, upcomingRoot, pastRoot };
}

function loadShowDetail() {
  const elements = new Map();
  const source = fs.readFileSync("show.js", "utf8").replace(/\nloadShow\(\);\s*$/, "\n");
  const context = {
    console: { warn() {} },
    document: {
      title: "",
      querySelector(selector) {
        if (!elements.has(selector)) elements.set(selector, createElement());
        return elements.get(selector);
      },
    },
    fetch() {},
    window: {
      location: { search: "" },
    },
  };

  vm.createContext(context);
  vm.runInContext(source, context);
  return { context, elements };
}

const styles = fs.readFileSync("styles.css", "utf8");

{
  const { context, upcomingRoot, pastRoot } = loadShowsArchive();
  context.__shows = [
    {
      id: "future-show",
      title: "2027春公演「長い長い舞台タイトルのテスト」",
      rawDate: "2030-04-01",
      status: "公開中",
      date: "4.1",
      year: "2030",
      reservationUrl: "https://example.com/reserve",
    },
    {
      id: "future-show-no-reservation",
      title: "2028春公演",
      rawDate: "2030-05-01",
      status: "準備中",
      date: "5.1",
      year: "2030",
      reservationUrl: "予約情報は後日公開",
    },
    {
      id: "future-show-no-booking-needed",
      title: "2030試演会",
      rawDate: "2030-05-15",
      status: "予約不要",
      date: "5.15",
      year: "2030",
      reservationUrl: "予約不要",
    },
    {
      id: "future-show-blank-reservation",
      title: "2029春公演",
      rawDate: "2030-06-01",
      status: "準備中",
      date: "6.1",
      year: "2030",
      reservationUrl: "   ",
    },
    {
      id: "past-show",
      title: "2025秋公演『過去公演の記録』",
      rawDate: "2020-10-01",
      status: "終了",
      date: "10.1",
      year: "2020",
    },
  ];
  vm.runInContext("currentShows = __shows; renderShows();", context);

  assert.ok(
    upcomingRoot.innerHTML.includes('<span class="program-title-prefix">2027春公演</span>'),
    "upcoming archive cards should split the prefix before Japanese quotes",
  );
  assert.ok(
    upcomingRoot.innerHTML.includes('<span class="program-title-quoted">「長い長い舞台タイトルのテスト」</span>'),
    "upcoming archive cards should keep the quoted title in the shared title span",
  );
  assert.ok(
    pastRoot.innerHTML.includes('<span class="program-title-prefix">2025秋公演</span>'),
    "past archive cards should split the prefix before Japanese corner quotes",
  );
  assert.ok(
    pastRoot.innerHTML.includes('<span class="program-title-quoted">『過去公演の記録』</span>'),
    "past archive cards should keep corner-quoted titles in the shared title span",
  );
  assert.ok(
    upcomingRoot.innerHTML.includes('<div class="show-row-actions">'),
    "featured upcoming archive cards should render a dedicated action row",
  );
  assert.ok(
    upcomingRoot.innerHTML.includes(
      '<a class="button primary show-row-reservation-button" href="https://example.com/reserve" target="_blank" rel="noopener">予約する</a>',
    ),
    "upcoming archive cards with reservation URLs should keep a reservation button",
  );
  assert.ok(
    upcomingRoot.innerHTML.includes(
      '<button class="button primary show-row-reservation-button is-disabled" type="button" disabled aria-disabled="true">予約準備中</button>',
    ),
    "upcoming archive cards without valid reservation URLs should render a disabled reservation button",
  );
  assert.strictEqual((upcomingRoot.innerHTML.match(/>予約する<\/a>/g) || []).length, 1, "only valid reservation URLs should render reservation links");
  assert.strictEqual(
    (upcomingRoot.innerHTML.match(/>予約準備中<\/button>/g) || []).length,
    2,
    "blank and non-URL reservation values except reservation-unneeded notices should render disabled pending buttons",
  );
  assert.strictEqual((upcomingRoot.innerHTML.match(/>予約不要<\/button>/g) || []).length, 1, "reservation-unneeded notices should render disabled no-reservation buttons");
  assert.ok(!upcomingRoot.innerHTML.includes('href="予約情報は後日公開"'), "non-URL reservation text should not become a link href");
  assert.ok(!upcomingRoot.innerHTML.includes('href="予約不要"'), "reservation-unneeded text should not become a link href");
  assert.ok(!upcomingRoot.innerHTML.includes('href="   "'), "blank reservation text should not become a link href");
  assert.ok(
    upcomingRoot.innerHTML.includes('<a class="button secondary surface show-row-detail-button" href="./show.html?id=future-show">公演情報を見る</a>'),
    "upcoming archive detail links should use the public information button label",
  );
  assert.ok(
    pastRoot.innerHTML.includes('<div class="show-row-actions">'),
    "past archive cards should render a dedicated action row",
  );
  assert.ok(
    !pastRoot.innerHTML.includes('<a class="text-link"'),
    "past archive cards should not mix the detail link into the date and venue row",
  );
  assert.ok(!pastRoot.innerHTML.includes("予約する"), "past archive cards should not render direct reservation buttons");
  assert.ok(!pastRoot.innerHTML.includes("予約準備中"), "past archive cards should not render disabled reservation buttons");
  assert.ok(pastRoot.innerHTML.includes('class="show-row show-row-past reveal"'), "past archive cards should have a class for centered actions");
  assert.ok(
    pastRoot.innerHTML.includes('<a class="button secondary surface show-row-detail-button" href="./show.html?id=past-show">公演情報を見る</a>'),
    "past archive detail links should use the public information button label",
  );
}

assert.match(
  styles,
  /\.show-row-meta\s*\{[\s\S]*?display: grid;[\s\S]*?grid-template-columns: minmax\(88px, auto\) minmax\(0, 1fr\);/,
  "archive date and venue rows should use a two-column grid on desktop",
);
assert.match(
  styles,
  /\.show-row-meta\s*\{[\s\S]*?min-height: 52px;/,
  "archive date and venue rows should reserve consistent height before the detail button row",
);
assert.match(
  styles,
  /\.show-row-main\s*\{[\s\S]*?display: flex;[\s\S]*?flex-direction: column;/,
  "archive card content should use vertical flex so metadata and buttons can align",
);
assert.match(
  styles,
  /\.show-row-content\s*\{[\s\S]*?flex: 1 1 auto;/,
  "archive summaries should absorb uneven height before the aligned metadata row",
);
assert.match(
  styles,
  /\.show-row-past \.show-row-actions\s*\{[\s\S]*?justify-content: center;/,
  "past archive detail buttons should be centered",
);

{
  const { context, elements } = loadShowDetail();
  context.__show = {
    id: "detail-show",
    title: "2026梅雨公演「潜る男」",
    shortTitle: "2026梅雨公演「潜る男」",
    rawDate: "2030-07-01",
    status: "予約受付中",
    date: "7.1",
    year: "2030",
    venue: "劇場",
    reservationUrl: "https://example.com/reserve",
  };
  vm.runInContext("renderShow(__show);", context);

  const titleHtml = elements.get("[data-show-title]").innerHTML;
  const afterTitleHtml = elements.get("[data-show-after-title]").innerHTML;
  const flyerHtml = elements.get("[data-show-flyer]").innerHTML;

  assert.ok(
    titleHtml.includes('<span class="program-title-prefix">2026梅雨公演</span>'),
    "show detail title should split the prefix before Japanese quotes",
  );
  assert.ok(
    titleHtml.includes('<span class="program-title-quoted">「潜る男」</span>'),
    "show detail title should keep the quoted title in the shared title span",
  );
  assert.ok(
    afterTitleHtml.includes('<span class="program-title-quoted">「潜る男」を予約する</span>'),
    "show detail reservation heading should use the same quoted title structure",
  );
  assert.ok(
    flyerHtml.includes('<span class="program-title-quoted">「潜る男」</span>'),
    "show detail poster fallback should use the same quoted title structure",
  );
}

{
  const { context, elements } = loadShowDetail();
  context.__show = {
    id: "detail-show-invalid-reservation",
    title: "2028春公演",
    rawDate: "2030-07-01",
    status: "準備中",
    date: "7.1",
    year: "2030",
    venue: "劇場",
    reservationUrl: "予約情報は後日公開",
  };
  vm.runInContext("renderShow(__show);", context);

  const reservation = elements.get("[data-show-reservation]");
  const afterReservation = elements.get("[data-show-after-reservation]");

  assert.strictEqual(reservation.href, "mailto:drama2023uec@gmail.com", "invalid reservation text should not be used as the main reservation href");
  assert.strictEqual(afterReservation.href, "mailto:drama2023uec@gmail.com", "invalid reservation text should not be used as the after-section reservation href");
  assert.ok(
    elements.get("[data-show-after-title]").innerHTML.includes("について問い合わせる"),
    "show detail should treat invalid reservation text as no reservation URL",
  );
}

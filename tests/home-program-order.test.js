const assert = require("assert");
const fs = require("fs");
const vm = require("vm");

const source = fs.readFileSync("script.js", "utf8").replace(/\nloadContent\(\);\s*$/, "\n");
const context = {
  console: { warn() {} },
  document: {
    querySelector() {
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
  },
};

vm.createContext(context);
vm.runInContext(source, context);

function select(shows, now = "2026-06-23T00:00:00+09:00") {
  context.__shows = shows;
  context.__now = now;
  const result = vm.runInContext("selectHomeProgramShows(__shows, new Date(__now))", context);
  return JSON.parse(JSON.stringify(result));
}

{
  const result = select([
    { title: "新歓リーディング", rawDate: "2026-04-12", status: "終了" },
    { title: "秋季本公演", rawDate: "2026-10-24", status: "準備中" },
    { title: "梅雨公演", rawDate: "2026-07-01", status: "予約受付中" },
    { title: "夏季試演会", rawDate: "2026-07-19", status: "予約不要" },
    { title: "前年公演", rawDate: "2025-12-01", status: "終了" },
  ]);

  assert.strictEqual(result.featured.title, "梅雨公演");
  assert.deepStrictEqual(
    result.secondary.map((show) => show.title),
    ["夏季試演会", "秋季本公演"]
  );
}

{
  const result = select([
    { title: "最新予定", rawDate: "2026-07-01", status: "公開中" },
    { title: "予定2", rawDate: "2026-07-02", status: "公開中" },
    { title: "予定3", rawDate: "2026-07-03", status: "公開中" },
    { title: "予定4", rawDate: "2026-07-04", status: "公開中" },
    { title: "過去最新", rawDate: "2026-05-01", status: "終了" },
  ]);

  assert.strictEqual(result.featured.title, "最新予定");
  assert.deepStrictEqual(
    result.secondary.map((show) => show.title),
    ["予定2", "予定3"]
  );
}

{
  const result = select([
    { title: "古い過去", rawDate: "2025-11-01", status: "終了" },
    { title: "最新過去", rawDate: "2026-05-01", status: "終了" },
    { title: "日付未定の終了", status: "終了" },
  ]);

  assert.strictEqual(result.featured.title, "最新過去");
  assert.deepStrictEqual(
    result.secondary.map((show) => show.title),
    ["古い過去", "日付未定の終了"]
  );
}

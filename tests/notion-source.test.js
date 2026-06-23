const assert = require("assert");
const fs = require("fs");

const files = [
  "index.html",
  "shows.html",
  "show.html",
  "journal.html",
  "script.js",
  "shows.js",
  "show.js",
  "journal.js",
  "api/content.js",
  "api/show.js",
  "api/post.js",
  "scripts/roop.sh",
  "scripts/save-to-github.sh",
];

for (const file of files) {
  const text = fs.readFileSync(file, "utf8");
  assert.ok(!text.includes("site-data.js"), `${file} must not load site-data.js`);
  assert.ok(!text.includes("site-content.js"), `${file} must not load site-content.js`);
  assert.ok(!text.includes("DRAMA_SITE_DATA"), `${file} must not use DRAMA_SITE_DATA`);
  assert.ok(!text.includes("DRAMA_CONTENT"), `${file} must not use DRAMA_CONTENT`);
  assert.ok(!text.includes("fallbackShows"), `${file} must not keep show JSON fallback`);
  assert.ok(!text.includes("fallbackPosts"), `${file} must not keep post JSON fallback`);
  assert.ok(!text.includes("blockedShowTitles"), `${file} must not filter shows by local JSON titles`);
  assert.ok(!text.includes("blockedPostTitles"), `${file} must not filter posts by local JSON titles`);
}

for (const removedFile of ["site-data.js", "site-content.js"]) {
  assert.ok(!fs.existsSync(removedFile), `${removedFile} must not exist`);
}

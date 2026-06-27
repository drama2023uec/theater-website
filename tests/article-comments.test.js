const assert = require("assert");
const fs = require("fs");
const vm = require("vm");

async function runCommentsApi({ method = "GET", query = {}, body, fetchImpl, env = {} }) {
  const code = fs.readFileSync("api/comments.js", "utf8");
  const context = {
    console,
    process: {
      env: {
        NOTION_API_KEY: "test-notion-key",
        NOTION_COMMENTS_DATABASE_ID: "comments-db",
        ...env,
      },
    },
    module: { exports: {} },
    exports: {},
    fetch: fetchImpl,
  };

  vm.createContext(context);
  vm.runInContext(code, context);

  let statusCode = 0;
  let payload;
  const headers = {};
  const response = {
    setHeader(name, value) {
      headers[name] = value;
    },
    status(code) {
      statusCode = code;
      return this;
    },
    json(body) {
      payload = body;
      return this;
    },
  };

  await context.module.exports({ method, query, body }, response);
  return { statusCode, payload, headers };
}

function sameRealm(value) {
  return JSON.parse(JSON.stringify(value));
}

(async () => {
  const calls = [];
  const getResult = await runCommentsApi({
    query: { id: "post-1" },
    fetchImpl: async (url, options) => {
      calls.push({ url, options });
      return {
        ok: true,
        json: async () => ({
          results: [
            {
              id: "comment-1",
              created_time: "2026-06-27T10:00:00.000Z",
              properties: {
                Author: { type: "rich_text", rich_text: [{ plain_text: "後輩" }] },
                Body: { type: "rich_text", rich_text: [{ plain_text: "一行目\n二行目" }] },
                Status: { type: "select", select: { name: "visible" } },
              },
            },
          ],
        }),
      };
    },
  });

  assert.strictEqual(getResult.statusCode, 200);
  assert.deepStrictEqual(sameRealm(getResult.payload.comments), [
    {
      id: "comment-1",
      author: "後輩",
      body: "一行目\n二行目",
      createdAt: "2026-06-27T10:00:00.000Z",
    },
  ]);
  assert.ok(calls[0].url.includes("/databases/comments-db/query"), "GET should query the comments database");
  const queryBody = JSON.parse(calls[0].options.body);
  assert.deepStrictEqual(sameRealm(queryBody.filter.and[0]), {
    property: "PostId",
    rich_text: { equals: "post-1" },
  });
  assert.deepStrictEqual(sameRealm(queryBody.filter.and[1]), {
    property: "Status",
    select: { does_not_equal: "hidden" },
  });

  const postCalls = [];
  const postResult = await runCommentsApi({
    method: "POST",
    body: JSON.stringify({
      id: "post-1",
      author: "  太郎  ",
      body: "  コメント本文  ",
      website: "",
    }),
    fetchImpl: async (url, options) => {
      postCalls.push({ url, options });
      if (options.method === "POST" && url.includes("/pages")) {
        return {
          ok: true,
          json: async () => ({
            id: "comment-new",
            created_time: "2026-06-27T11:00:00.000Z",
            properties: {
              Author: { type: "rich_text", rich_text: [{ plain_text: "太郎" }] },
              Body: { type: "rich_text", rich_text: [{ plain_text: "コメント本文" }] },
              Status: { type: "select", select: { name: "visible" } },
            },
          }),
        };
      }
      throw new Error(`Unexpected fetch ${url}`);
    },
  });

  assert.strictEqual(postResult.statusCode, 201);
  assert.deepStrictEqual(sameRealm(postResult.payload.comment), {
    id: "comment-new",
    author: "太郎",
    body: "コメント本文",
    createdAt: "2026-06-27T11:00:00.000Z",
  });
  const createBody = JSON.parse(postCalls[0].options.body);
  assert.strictEqual(createBody.parent.database_id, "comments-db");
  assert.strictEqual(createBody.properties.Name.title[0].text.content, "太郎 / post-1");
  assert.strictEqual(createBody.properties.PostId.rich_text[0].text.content, "post-1");
  assert.strictEqual(createBody.properties.Author.rich_text[0].text.content, "太郎");
  assert.strictEqual(createBody.properties.Body.rich_text[0].text.content, "コメント本文");
  assert.strictEqual(createBody.properties.Status.select.name, "visible");

  const missingConfig = await runCommentsApi({
    query: { id: "post-1" },
    env: { NOTION_API_KEY: "", NOTION_COMMENTS_DATABASE_ID: "" },
    fetchImpl: async () => {
      throw new Error("fetch should not be called without config");
    },
  });

  assert.strictEqual(missingConfig.statusCode, 200);
  assert.deepStrictEqual(sameRealm(missingConfig.payload), { configured: false, comments: [] });

  const badPost = await runCommentsApi({
    method: "POST",
    body: { id: "post-1", body: "   " },
    fetchImpl: async () => {
      throw new Error("fetch should not be called for invalid body");
    },
  });

  assert.strictEqual(badPost.statusCode, 400);
  assert.strictEqual(badPost.payload.error, "Missing comment body");
})();

const NOTION_VERSION = "2022-06-28";
const MAX_AUTHOR_LENGTH = 30;
const MAX_BODY_LENGTH = 800;

function notionHeaders() {
  return {
    Authorization: `Bearer ${process.env.NOTION_API_KEY || ""}`,
    "Content-Type": "application/json",
    "Notion-Version": NOTION_VERSION,
  };
}

function requestBody(request) {
  if (typeof request.body === "string") {
    try {
      return JSON.parse(request.body);
    } catch {
      return {};
    }
  }
  return request.body || {};
}

function plainText(items = []) {
  return items.map((item) => item.plain_text || "").join("").trim();
}

function propertyText(properties, name) {
  const prop = properties?.[name];
  if (!prop) return "";
  if (prop.type === "title") return plainText(prop.title);
  if (prop.type === "rich_text") return plainText(prop.rich_text);
  if (prop.type === "select") return prop.select?.name || "";
  if (prop.type === "date") return prop.date?.start || "";
  return "";
}

function trimLimit(value, maxLength) {
  return String(value || "").trim().slice(0, maxLength);
}

function commentFromPage(page) {
  const properties = page.properties || {};
  return {
    id: page.id || "",
    author: propertyText(properties, "Author") || "匿名",
    body: propertyText(properties, "Body"),
    createdAt: page.created_time || propertyText(properties, "CreatedAt") || "",
  };
}

async function notionRequest(path, options = {}) {
  const response = await fetch(`https://api.notion.com/v1${path}`, {
    ...options,
    headers: notionHeaders(),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Notion request failed: ${response.status} ${body}`);
  }

  return response.json();
}

function hasCommentsConfig() {
  return Boolean(process.env.NOTION_API_KEY && process.env.NOTION_COMMENTS_DATABASE_ID);
}

async function listComments(postId) {
  const data = await notionRequest(`/databases/${encodeURIComponent(process.env.NOTION_COMMENTS_DATABASE_ID)}/query`, {
    method: "POST",
    body: JSON.stringify({
      page_size: 50,
      filter: {
        and: [
          {
            property: "PostId",
            rich_text: { equals: postId },
          },
          {
            property: "Status",
            select: { does_not_equal: "hidden" },
          },
        ],
      },
      sorts: [
        {
          timestamp: "created_time",
          direction: "ascending",
        },
      ],
    }),
  });

  return (data.results || []).map(commentFromPage).filter((comment) => comment.body);
}

async function createComment({ postId, author, body }) {
  const authorName = trimLimit(author, MAX_AUTHOR_LENGTH) || "匿名";
  const commentBody = trimLimit(body, MAX_BODY_LENGTH);

  const page = await notionRequest("/pages", {
    method: "POST",
    body: JSON.stringify({
      parent: {
        database_id: process.env.NOTION_COMMENTS_DATABASE_ID,
      },
      properties: {
        Name: {
          title: [
            {
              text: {
                content: `${authorName} / ${postId.slice(0, 24)}`,
              },
            },
          ],
        },
        PostId: {
          rich_text: [
            {
              text: {
                content: postId,
              },
            },
          ],
        },
        Author: {
          rich_text: [
            {
              text: {
                content: authorName,
              },
            },
          ],
        },
        Body: {
          rich_text: [
            {
              text: {
                content: commentBody,
              },
            },
          ],
        },
        Status: {
          select: {
            name: "visible",
          },
        },
      },
    }),
  });

  return commentFromPage(page);
}

module.exports = async function handler(request, response) {
  if (!["GET", "POST"].includes(request.method)) {
    response.setHeader("Allow", "GET, POST");
    response.status(405).json({ error: "Method Not Allowed" });
    return;
  }

  if (!hasCommentsConfig()) {
    response.setHeader("Cache-Control", "no-store");
    response.status(200).json({ configured: false, comments: [] });
    return;
  }

  const body = request.method === "POST" ? requestBody(request) : {};
  const postId = trimLimit(request.method === "POST" ? body.id : request.query?.id, 120);

  if (!postId) {
    response.status(400).json({ error: "Missing post id" });
    return;
  }

  try {
    if (request.method === "GET") {
      const comments = await listComments(postId);
      response.setHeader("Cache-Control", "no-store");
      response.status(200).json({ configured: true, comments });
      return;
    }

    const website = trimLimit(body.website, 160);
    if (website) {
      response.setHeader("Cache-Control", "no-store");
      response.status(200).json({ configured: true, ignored: true });
      return;
    }

    const commentBody = trimLimit(body.body, MAX_BODY_LENGTH);
    if (!commentBody) {
      response.status(400).json({ error: "Missing comment body" });
      return;
    }

    const comment = await createComment({
      postId,
      author: body.author,
      body: commentBody,
    });

    response.setHeader("Cache-Control", "no-store");
    response.status(201).json({ configured: true, comment });
  } catch (error) {
    console.error(error);
    response.status(500).json({ error: "Failed to handle comments" });
  }
};

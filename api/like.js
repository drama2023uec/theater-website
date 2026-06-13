const NOTION_VERSION = "2022-06-28";

function notionHeaders() {
  return {
    Authorization: `Bearer ${process.env.NOTION_API_KEY || ""}`,
    "Content-Type": "application/json",
    "Notion-Version": NOTION_VERSION,
  };
}

function propertyNumber(properties, name) {
  const prop = properties?.[name];
  return prop?.type === "number" && Number.isFinite(prop.number) ? prop.number : 0;
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

module.exports = async function handler(request, response) {
  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    response.status(405).json({ error: "Method Not Allowed" });
    return;
  }

  if (!process.env.NOTION_API_KEY) {
    response.status(400).json({ error: "Missing Notion configuration" });
    return;
  }

  const body = requestBody(request);
  const id = String(body.id || "").trim();
  if (!id) {
    response.status(400).json({ error: "Missing page id" });
    return;
  }

  try {
    const page = await notionRequest(`/pages/${encodeURIComponent(id)}`);
    const currentLikes = propertyNumber(page.properties, "Likes");
    const nextLiked = body.liked !== false;
    const likes = Math.max(0, currentLikes + (nextLiked ? 1 : -1));

    await notionRequest(`/pages/${encodeURIComponent(id)}`, {
      method: "PATCH",
      body: JSON.stringify({
        properties: {
          Likes: {
            number: likes,
          },
        },
      }),
    });

    response.setHeader("Cache-Control", "no-store");
    response.status(200).json({ id, likes, liked: nextLiked });
  } catch (error) {
    console.error(error);
    response.status(500).json({ error: "Failed to update likes" });
  }
};

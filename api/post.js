const NOTION_VERSION = "2022-06-28";

const notionHeaders = {
  Authorization: `Bearer ${process.env.NOTION_API_KEY || ""}`,
  "Content-Type": "application/json",
  "Notion-Version": NOTION_VERSION,
};

function plainText(items = []) {
  return items.map((item) => item.plain_text || "").join("").trim();
}

function blockText(items = []) {
  return items.map((item) => item.plain_text || "").join("");
}

function propertyText(properties, name) {
  const prop = properties[name];
  if (!prop) return "";

  if (prop.type === "title") return plainText(prop.title);
  if (prop.type === "rich_text") return plainText(prop.rich_text);
  if (prop.type === "select") return prop.select?.name || "";
  if (prop.type === "date") return prop.date?.start || "";

  return "";
}

function propertyNumber(properties, name) {
  const prop = properties[name];
  return prop?.type === "number" && Number.isFinite(prop.number) ? prop.number : 0;
}

function propertyFileUrl(properties, names) {
  for (const name of names) {
    const prop = properties[name];
    if (!prop) continue;
    if (prop.type === "files") {
      const file = prop.files?.[0];
      if (file?.type === "external") return file.external?.url || "";
      if (file?.type === "file") return file.file?.url || "";
    }
    if (prop.type === "url") return prop.url || "";
    if (prop.type === "rich_text") return plainText(prop.rich_text);
  }
  return "";
}

function fileUrl(file) {
  if (file?.type === "external") return file.external?.url || "";
  if (file?.type === "file") return file.file?.url || "";
  return "";
}

function pageCoverUrl(page) {
  return fileUrl(page.cover);
}

function formatPostDate(value) {
  if (!value) return "日付未定";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, "0")}.${String(date.getDate()).padStart(2, "0")}`;
}

function mapBlock(block) {
  const data = block[block.type] || {};

  if (block.type === "image") {
    const url = data.type === "external" ? data.external?.url || "" : data.file?.url || "";
    return {
      type: block.type,
      url,
      caption: plainText(data.caption),
    };
  }

  if (["paragraph", "heading_1", "heading_2", "heading_3", "quote", "bulleted_list_item", "numbered_list_item"].includes(block.type)) {
    return {
      type: block.type,
      text: blockText(data.rich_text),
    };
  }

  return null;
}

async function fetchNotion(path) {
  const response = await fetch(`https://api.notion.com/v1${path}`, {
    method: "GET",
    headers: notionHeaders,
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Notion fetch failed: ${response.status} ${body}`);
  }

  return response.json();
}

module.exports = async function handler(request, response) {
  if (request.method !== "GET") {
    response.setHeader("Allow", "GET");
    response.status(405).json({ error: "Method Not Allowed" });
    return;
  }

  const id = String(request.query?.id || "").trim();

  if (!process.env.NOTION_API_KEY || !id) {
    response.status(400).json({ error: "Missing Notion configuration or page id" });
    return;
  }

  try {
    const [page, children] = await Promise.all([
      fetchNotion(`/pages/${encodeURIComponent(id)}`),
      fetchNotion(`/blocks/${encodeURIComponent(id)}/children?page_size=100`),
    ]);
    const properties = page.properties || {};
    const title = propertyText(properties, "Name") || "無題";
    const blocks = (children.results || [])
      .map(mapBlock)
      .filter(Boolean)
      .filter((block) => block.url || block.type === "paragraph" || String(block.text || "").trim());

    response.setHeader("Cache-Control", "no-store");
    response.status(200).json({
      id,
      title,
      date: formatPostDate(propertyText(properties, "Date")),
      category: propertyText(properties, "Category") || "稽古",
      author: propertyText(properties, "Author") || "演劇同好会",
      excerpt: propertyText(properties, "Excerpt") || "",
      imageUrl: pageCoverUrl(page) || propertyFileUrl(properties, ["Image", "画像", "Cover", "Thumbnail", "サムネイル"]),
      likes: propertyNumber(properties, "Likes"),
      blocks,
    });
  } catch (error) {
    console.error(error);
    response.status(500).json({ error: "Failed to load Notion post" });
  }
};

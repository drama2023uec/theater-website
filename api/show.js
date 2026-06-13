const NOTION_VERSION = "2022-06-28";

const notionHeaders = {
  Authorization: `Bearer ${process.env.NOTION_API_KEY || ""}`,
  "Content-Type": "application/json",
  "Notion-Version": NOTION_VERSION,
};

function plainText(items = []) {
  return items.map((item) => item.plain_text || "").join("").trim();
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

function propertyUrl(properties, names) {
  for (const name of names) {
    const prop = properties[name];
    if (!prop) continue;
    if (prop.type === "url") return prop.url || "";
    if (prop.type === "rich_text") return plainText(prop.rich_text);
  }
  return "";
}

function formatShowDate(value) {
  if (!value) return { date: "未定", year: "" };
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return { date: value, year: "" };
  return {
    date: `${date.getMonth() + 1}.${date.getDate()}`,
    year: String(date.getFullYear()),
  };
}

function mapBlock(block) {
  const data = block[block.type] || {};

  if (["paragraph", "heading_1", "heading_2", "heading_3", "quote", "bulleted_list_item", "numbered_list_item"].includes(block.type)) {
    return {
      type: block.type,
      text: plainText(data.rich_text),
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
    const formattedDate = formatShowDate(propertyText(properties, "Date"));
    const blocks = (children.results || []).map(mapBlock).filter(Boolean).filter((block) => block.text);

    response.setHeader("Cache-Control", "no-store");
    response.status(200).json({
      id,
      title: propertyText(properties, "Name") || "無題",
      date: propertyText(properties, "DisplayDate") || formattedDate.date,
      rawDate: propertyText(properties, "Date"),
      year: propertyText(properties, "Year") || formattedDate.year,
      status: propertyText(properties, "Status") || "公開中",
      venue: propertyText(properties, "Venue") || "会場未定",
      body: propertyText(properties, "Description") || "",
      flyerUrl: propertyFileUrl(properties, ["Flyer", "FlyerUrl", "Flyer URL", "Flyer Image", "チラシ"]),
      reservationUrl: propertyUrl(properties, ["ReservationUrl", "Reservation URL", "TicketUrl", "Ticket URL", "予約URL"]),
      blocks,
    });
  } catch (error) {
    console.error(error);
    response.status(500).json({ error: "Failed to load Notion show" });
  }
};

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
  if (prop.type === "multi_select") return prop.multi_select?.map((item) => item.name).join(", ") || "";
  if (prop.type === "date") return prop.date?.start || "";
  if (prop.type === "checkbox") return String(prop.checkbox);
  if (prop.type === "number") return String(prop.number ?? "");
  if (prop.type === "url") return prop.url || "";

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

function propertyUrl(properties, names) {
  for (const name of names) {
    const prop = properties[name];
    if (!prop) continue;
    if (prop.type === "url") return prop.url || "";
    if (prop.type === "rich_text") return plainText(prop.rich_text);
  }
  return "";
}

function sortShowsForDisplay(shows) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return [...shows].sort((a, b) => {
    const dateA = new Date(a.rawDate || "");
    const dateB = new Date(b.rawDate || "");
    const timeA = Number.isNaN(dateA.getTime()) ? Number.POSITIVE_INFINITY : dateA.getTime();
    const timeB = Number.isNaN(dateB.getTime()) ? Number.POSITIVE_INFINITY : dateB.getTime();
    const aPast = timeA < today.getTime();
    const bPast = timeB < today.getTime();

    if (aPast !== bPast) return aPast ? 1 : -1;
    return aPast ? timeB - timeA : timeA - timeB;
  });
}

function formatPostDate(value) {
  if (!value) return "日付未定";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, "0")}.${String(date.getDate()).padStart(2, "0")}`;
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

async function queryDatabase(databaseId) {
  const results = [];
  let cursor;

  do {
    const response = await fetch(`https://api.notion.com/v1/databases/${databaseId}/query`, {
      method: "POST",
      headers: notionHeaders,
      body: JSON.stringify({
        page_size: 100,
        start_cursor: cursor,
        filter: {
          property: "Published",
          checkbox: { equals: true },
        },
        sorts: [
          {
            property: "Date",
            direction: "descending",
          },
        ],
      }),
    });

    if (!response.ok) {
      const body = await response.text();
      throw new Error(`Notion query failed: ${response.status} ${body}`);
    }

    const data = await response.json();
    results.push(...(data.results || []));
    cursor = data.has_more ? data.next_cursor : undefined;
  } while (cursor);

  return results;
}

function mapPost(page) {
  const properties = page.properties || {};
  const id = page.id || "";

  return {
    id,
    href: id ? `/article.html?id=${encodeURIComponent(id)}` : "",
    title: propertyText(properties, "Name") || "無題",
    date: formatPostDate(propertyText(properties, "Date")),
    category: propertyText(properties, "Category") || "稽古",
    author: propertyText(properties, "Author") || "演劇同好会",
    excerpt: propertyText(properties, "Excerpt") || propertyText(properties, "Description") || "",
    likes: propertyNumber(properties, "Likes"),
  };
}

function mapShow(page) {
  const properties = page.properties || {};
  const id = page.id || "";
  const dateValue = propertyText(properties, "Date");
  const formattedDate = formatShowDate(propertyText(properties, "Date"));

  return {
    id,
    href: id ? `/show.html?id=${encodeURIComponent(id)}` : "",
    title: propertyText(properties, "Name") || "無題",
    date: propertyText(properties, "DisplayDate") || formattedDate.date,
    rawDate: dateValue,
    year: propertyText(properties, "Year") || formattedDate.year,
    status: propertyText(properties, "Status") || "公開中",
    venue: propertyText(properties, "Venue") || "会場未定",
    body: propertyText(properties, "Description") || propertyText(properties, "Excerpt") || "",
    flyerUrl: propertyFileUrl(properties, ["Flyer", "FlyerUrl", "Flyer URL", "Flyer Image", "チラシ"]),
    reservationUrl: propertyUrl(properties, ["ReservationUrl", "Reservation URL", "TicketUrl", "Ticket URL", "予約URL"]),
  };
}

module.exports = async function handler(request, response) {
  if (request.method !== "GET") {
    response.setHeader("Allow", "GET");
    response.status(405).json({ error: "Method Not Allowed" });
    return;
  }

  const hasRequiredEnv = Boolean(process.env.NOTION_API_KEY);
  const postsDatabaseId = process.env.NOTION_POSTS_DATABASE_ID;
  const showsDatabaseId = process.env.NOTION_SHOWS_DATABASE_ID;

  if (!hasRequiredEnv || (!postsDatabaseId && !showsDatabaseId)) {
    response.setHeader("Cache-Control", "no-store");
    response.status(200).json({
      configured: false,
      shows: [],
      posts: [],
    });
    return;
  }

  try {
    const [shows, posts] = await Promise.all([
      showsDatabaseId ? queryDatabase(showsDatabaseId).then((items) => items.map(mapShow)) : Promise.resolve([]),
      postsDatabaseId ? queryDatabase(postsDatabaseId).then((items) => items.map(mapPost)) : Promise.resolve([]),
    ]);

    response.setHeader("Cache-Control", "no-store");
    response.status(200).json({
      configured: true,
      shows: sortShowsForDisplay(shows),
      posts,
    });
  } catch (error) {
    console.error(error);
    response.status(500).json({
      error: "Failed to load Notion content",
    });
  }
};

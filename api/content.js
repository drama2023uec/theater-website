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
  const response = await fetch(`https://api.notion.com/v1/databases/${databaseId}/query`, {
    method: "POST",
    headers: notionHeaders,
    body: JSON.stringify({
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
  return data.results || [];
}

function mapPost(page) {
  const properties = page.properties || {};

  return {
    title: propertyText(properties, "Name") || "無題",
    date: formatPostDate(propertyText(properties, "Date")),
    category: propertyText(properties, "Category") || "稽古",
    author: propertyText(properties, "Author") || "暁座",
    excerpt: propertyText(properties, "Excerpt") || propertyText(properties, "Description") || "",
  };
}

function mapShow(page) {
  const properties = page.properties || {};
  const formattedDate = formatShowDate(propertyText(properties, "Date"));

  return {
    title: propertyText(properties, "Name") || "無題",
    date: propertyText(properties, "DisplayDate") || formattedDate.date,
    year: propertyText(properties, "Year") || formattedDate.year,
    status: propertyText(properties, "Status") || "公開中",
    venue: propertyText(properties, "Venue") || "会場未定",
    body: propertyText(properties, "Description") || propertyText(properties, "Excerpt") || "",
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
    response.setHeader("Cache-Control", "s-maxage=60, stale-while-revalidate=300");
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

    response.setHeader("Cache-Control", "s-maxage=60, stale-while-revalidate=300");
    response.status(200).json({
      configured: true,
      shows,
      posts,
    });
  } catch (error) {
    console.error(error);
    response.status(500).json({
      error: "Failed to load Notion content",
    });
  }
};

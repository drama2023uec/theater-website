const titleEl = document.querySelector("[data-show-title]");
const statusEl = document.querySelector("[data-show-status]");
const ticketStatusEl = document.querySelector("[data-show-ticket-status]");
const bodyEl = document.querySelector("[data-show-body]");
const dateEl = document.querySelector("[data-show-date]");
const yearEl = document.querySelector("[data-show-year]");
const venueEl = document.querySelector("[data-show-venue]");
const blocksEl = document.querySelector("[data-show-blocks]");
const flyerEl = document.querySelector("[data-show-flyer]");
const reservationEl = document.querySelector("[data-show-reservation]");
const afterStatusEl = document.querySelector("[data-show-after-status]");
const afterTitleEl = document.querySelector("[data-show-after-title]");
const afterCopyEl = document.querySelector("[data-show-after-copy]");
const afterReservationEl = document.querySelector("[data-show-after-reservation]");

const fallbackShows = {
  "37eb1f2b-73b5-8116-9723-e5938914e068": {
    title: "電気通信大学演劇同好会 梅雨公演『潜る男』",
    date: "7.1",
    rawDate: "2026-07-01",
    year: "2026",
    status: "予約受付中",
    venue: "調布市文化会館たづくり 11階 第1創作室",
    body: "海の底で、ふたりは近づく。息を止めた先で、君を知る。電気通信大学演劇同好会の梅雨公演。新入生の活躍をご覧あれ。",
    reservationUrl: "https://teket.jp/18495/70876",
    blocks: [
      { type: "heading_2", text: "公演について" },
      { type: "paragraph", text: "電気通信大学演劇同好会による梅雨公演。静かな水底を思わせる世界で、人物同士の距離と沈黙を丁寧に立ち上げる。" },
      { type: "heading_2", text: "来場案内" },
      { type: "paragraph", text: "会場は調布市文化会館たづくり 11階 第1創作室。入場無料、事前予約制。予約はteketのページから受け付ける。" },
    ],
  },
};

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function blockHtml(block) {
  const text = escapeHtml(block.text);

  if (block.type === "heading_1") return `<h2>${text}</h2>`;
  if (block.type === "heading_2") return `<h2>${text}</h2>`;
  if (block.type === "heading_3") return `<h3>${text}</h3>`;
  if (block.type === "quote") return `<blockquote>${text}</blockquote>`;
  if (block.type === "bulleted_list_item" || block.type === "numbered_list_item") return `<li>${text}</li>`;
  return `<p>${text}</p>`;
}

function blocksHtml(blocks) {
  const html = [];
  let activeList = "";

  blocks.forEach((block) => {
    const listType = block.type === "bulleted_list_item" ? "ul" : block.type === "numbered_list_item" ? "ol" : "";

    if (listType && listType !== activeList) {
      if (activeList) html.push(`</${activeList}>`);
      html.push(`<${listType}>`);
      activeList = listType;
    } else if (!listType && activeList) {
      html.push(`</${activeList}>`);
      activeList = "";
    }

    html.push(blockHtml(block));
  });

  if (activeList) html.push(`</${activeList}>`);
  return html.join("");
}

function renderError(message) {
  titleEl.textContent = "公演情報を表示できません";
  statusEl.textContent = "";
  ticketStatusEl.textContent = "";
  bodyEl.textContent = message;
  dateEl.textContent = "未定";
  yearEl.textContent = "";
  venueEl.textContent = "会場未定";
  flyerEl.innerHTML = "";
  blocksEl.innerHTML = "";
  reservationEl.href = "mailto:drama2023uec@gmail.com";
  reservationEl.textContent = "問い合わせる";
  reservationEl.removeAttribute("target");
  reservationEl.removeAttribute("rel");
  afterStatusEl.textContent = "確認中";
  afterTitleEl.textContent = "公演情報を確認できません";
  afterCopyEl.textContent = message;
  afterReservationEl.href = "mailto:drama2023uec@gmail.com";
  afterReservationEl.textContent = "問い合わせる";
  afterReservationEl.removeAttribute("target");
  afterReservationEl.removeAttribute("rel");
}

function flyerHtml(show) {
  if (show.flyerUrl) {
    return `<img class="show-flyer is-large" src="${escapeHtml(show.flyerUrl)}" alt="${escapeHtml(show.title)}のチラシ" />`;
  }

  return `
    <div class="show-flyer poster-fallback is-large" aria-label="${escapeHtml(show.title)}の仮チラシ">
      <span>${escapeHtml(show.status)}</span>
      <strong>${escapeHtml(show.title)}</strong>
      <em>${escapeHtml(show.date)} ${escapeHtml(show.year || "")}</em>
    </div>
  `;
}

function renderShow(show) {
  document.title = `${show.title} | 演劇同好会`;
  titleEl.textContent = show.title;
  statusEl.textContent = show.status;
  ticketStatusEl.textContent = show.status;
  bodyEl.textContent = show.body;
  dateEl.textContent = show.date;
  yearEl.textContent = show.year;
  venueEl.textContent = show.venue;
  flyerEl.innerHTML = flyerHtml(show);
  afterStatusEl.textContent = show.status;
  afterTitleEl.textContent = `${show.title}を予約する`;
  afterCopyEl.textContent = `${show.date} ${show.year || ""} / ${show.venue}`;
  if (show.reservationUrl) {
    reservationEl.href = show.reservationUrl;
    reservationEl.textContent = "予約ページへ";
    reservationEl.target = "_blank";
    reservationEl.rel = "noopener";
    afterReservationEl.href = show.reservationUrl;
    afterReservationEl.textContent = "予約ページへ";
    afterReservationEl.target = "_blank";
    afterReservationEl.rel = "noopener";
  } else {
    reservationEl.href = "mailto:drama2023uec@gmail.com";
    reservationEl.textContent = "問い合わせる";
    reservationEl.removeAttribute("target");
    reservationEl.removeAttribute("rel");
    afterReservationEl.href = "mailto:drama2023uec@gmail.com";
    afterReservationEl.textContent = "問い合わせる";
    afterReservationEl.removeAttribute("t
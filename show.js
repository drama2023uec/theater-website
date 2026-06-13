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
  if (block.type === "bulleted_list_item") return `<ul><li>${text}</li></ul>`;
  if (block.type === "numbered_list_item") return `<ol><li>${text}</li></ol>`;
  return `<p>${text}</p>`;
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

async function loadShow() {
  const id = new URLSearchParams(window.location.search).get("id");
  if (!id) {
    renderError("公演IDが指定されていない。公演一覧から開く必要がある。");
    return;
  }

  try {
    const response = await fetch(`/api/show?id=${encodeURIComponent(id)}`, { cache: "no-store", headers: { Accept: "application/json" } });
    if (!response.ok) throw new Error(`Show API returned ${response.status}`);
    const show = await response.json();

    document.title = `${show.title} | 演劇同好会`;
    titleEl.textContent = show.title;
    statusEl.textContent = show.status;
    ticketStatusEl.textContent = show.status;
    bodyEl.textContent = show.body;
    dateEl.textContent = show.date;
    yearEl.textContent = show.year;
    venueEl.textContent = show.venue;
    flyerEl.innerHTML = flyerHtml(show);
    if (show.reservationUrl) {
      reservationEl.href = show.reservationUrl;
      reservationEl.textContent = "予約ページへ";
      reservationEl.target = "_blank";
      reservationEl.rel = "noopener";
    } else {
      reservationEl.href = "mailto:drama2023uec@gmail.com";
      reservationEl.textContent = "問い合わせる";
      reservationEl.removeAttribute("target");
      reservationEl.removeAttribute("rel");
    }
    blocksEl.innerHTML =
      Array.isArray(show.blocks) && show.blocks.length > 0
        ? show.blocks.map(blockHtml).join("")
        : `
          <h2>公演について</h2>
          <p>${escapeHtml(show.body || "Notionの公演ページ本文を追加すると、ここにPR本文として反映される。")}</p>
          <h2>来場案内</h2>
          <p>会場、開演時刻、予約方法などはNotionの公演ページに追記して運用する。</p>
        `;
  } catch (error) {
    console.warn(error);
    renderError("Notionの公演情報を取得できなかった。");
  }
}

loadShow();

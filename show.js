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
const showRegion = document.querySelector("[data-show]");

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

function showDate(show) {
  return show.displayDate || `${show.date || "日程未定"} ${show.year || ""}`.trim();
}

function showSummary(show) {
  return show.body || show.description || "公演情報を準備中です。";
}

function renderError(message) {
  showRegion?.setAttribute("aria-busy", "false");
  titleEl.textContent = "公演情報を表示できません";
  statusEl.textContent = "";
  ticketStatusEl.textContent = "";
  bodyEl.textContent = message;
  dateEl.textContent = "未定";
  yearEl.textContent = "";
  venueEl.textContent = "会場未定";
  flyerEl.innerHTML = "";
  blocksEl.innerHTML = "";
  setReservationLink(reservationEl, null);
  setReservationLink(afterReservationEl, null);
  afterStatusEl.textContent = "確認中";
  afterTitleEl.textContent = "公演情報を確認できません";
  afterCopyEl.textContent = message;
}

function flyerHtml(show) {
  if (show.flyerUrl) {
    return `<img class="show-flyer is-large" src="${escapeHtml(show.flyerUrl)}" alt="${escapeHtml(show.title)}のチラシ" />`;
  }

  return `
    <div class="show-flyer poster-fallback is-large" aria-label="${escapeHtml(show.title)}のチラシ">
      <span>${escapeHtml(show.status || "公開中")}</span>
      <strong>${escapeHtml(show.title || "公演情報")}</strong>
      <em>${escapeHtml(show.date || "日程未定")} ${escapeHtml(show.year || "")}</em>
    </div>
  `;
}

function setReservationLink(link, show) {
  if (!link) return;
  if (show?.reservationUrl) {
    link.href = show.reservationUrl;
    link.textContent = show.reservationUrl.includes("teket.jp") ? "Teketで予約する" : "予約ページへ";
    link.target = "_blank";
    link.rel = "noopener";
    link.removeAttribute("aria-disabled");
    return;
  }

  link.href = "mailto:drama2023uec@gmail.com";
  link.textContent = "問い合わせる";
  link.removeAttribute("target");
  link.removeAttribute("rel");
  link.removeAttribute("aria-disabled");
}

function listHtml(items) {
  return Array.isArray(items) && items.length
    ? `<ul class="show-detail-list">${items.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>`
    : "";
}

function detailBlockHtml(show) {
  const details = [
    ["作", show.playwright],
    ["日程", showDate(show)],
    ["開場 / 開演", show.openTime && show.startTime ? `${show.openTime} / ${show.startTime}` : ""],
    ["上演時間", show.runtime],
    ["会場", show.venue],
    ["住所", show.venueAddress],
    ["アクセス", show.access],
    ["料金", show.price],
    ["席種", show.ticketType],
    ["予約", show.reservationNote],
    ["問い合わせ", show.contact],
  ].filter(([, value]) => value);

  return `
    <section class="show-detail-section">
      <h2>公演概要</h2>
      <dl class="show-detail-grid">
        ${details
          .map(
            ([term, value]) => `
              <div>
                <dt>${escapeHtml(term)}</dt>
                <dd>${escapeHtml(value)}</dd>
              </div>
            `,
          )
          .join("")}
      </dl>
    </section>
    ${
      show.cast?.length
        ? `
          <section class="show-detail-section">
            <h2>出演</h2>
            ${listHtml(show.cast)}
          </section>
        `
        : ""
    }
    ${
      show.staff?.length
        ? `
          <section class="show-detail-section">
            <h2>スタッフ</h2>
            ${listHtml(show.staff)}
          </section>
        `
        : ""
    }
    ${
      show.notes?.length
        ? `
          <section class="show-detail-section">
            <h2>来場時のお願い</h2>
            ${listHtml(show.notes)}
          </section>
        `
        : ""
    }
    ${
      show.sourceUrl
        ? `<p class="source-note">公演情報は<a href="${escapeHtml(show.sourceUrl)}" target="_blank" rel="noopener">${escapeHtml(show.sourceLabel || "公式公開ページ")}</a>をもとに掲載しています。</p>`
        : ""
    }
  `;
}

function renderShowBlocks(show) {
  if (Array.isArray(show.blocks) && show.blocks.length > 0) {
    return `${blocksHtml(show.blocks)}${detailBlockHtml(show)}`;
  }

  return `
    <h2>公演について</h2>
    <p>${escapeHtml(showSummary(show))}</p>
    ${detailBlockHtml(show)}
  `;
}

function renderShow(show) {
  showRegion?.setAttribute("aria-busy", "false");
  document.title = `${show.title} | 電気通信大学演劇同好会`;
  titleEl.textContent = show.title;
  statusEl.textContent = show.status || "公開中";
  ticketStatusEl.textContent = show.status || "公開中";
  bodyEl.textContent = showSummary(show);
  dateEl.textContent = show.date || "未定";
  yearEl.textContent = show.year || "";
  venueEl.textContent = show.venue || "会場未定";
  flyerEl.innerHTML = flyerHtml(show);
  afterStatusEl.textContent = show.status || "公開中";
  afterTitleEl.textContent = show.reservationUrl ? `${show.shortTitle || show.title}を予約する` : `${show.shortTitle || show.title}について問い合わせる`;
  afterCopyEl.textContent = `${showDate(show)} / ${show.venue || "会場未定"}`;
  setReservationLink(reservationEl, show);
  setReservationLink(afterReservationEl, show);
  blocksEl.innerHTML = renderShowBlocks(show);
}

function renderLoading() {
  showRegion?.setAttribute("aria-busy", "true");
  reservationEl.removeAttribute("href");
  reservationEl.removeAttribute("target");
  reservationEl.removeAttribute("rel");
  reservationEl.setAttribute("aria-disabled", "true");
  reservationEl.textContent = "読み込み中";
  afterReservationEl.removeAttribute("href");
  afterReservationEl.removeAttribute("target");
  afterReservationEl.removeAttribute("rel");
  afterReservationEl.setAttribute("aria-disabled", "true");
  afterReservationEl.textContent = "読み込み中";
  flyerEl.innerHTML = `
    <div class="show-flyer poster-fallback is-large loading-poster" aria-label="公演チラシを読み込み中">
      <span>loading</span>
      <strong>公演情報を確認中</strong>
      <em>official data</em>
    </div>
  `;
  blocksEl.innerHTML = `
    <div class="loading-note" role="status" aria-live="polite">
      <span class="loading-dot" aria-hidden="true"></span>
      <strong>公演情報を確認中</strong>
      <p>表示可能な公開情報を取得しています。</p>
    </div>
  `;
}

async function loadShow() {
  const id = new URLSearchParams(window.location.search).get("id");
  if (!id) {
    renderError("公演IDが指定されていません。公演一覧から開いてください。");
    return;
  }
  renderLoading();

  try {
    const response = await fetch(`/api/show?id=${encodeURIComponent(id)}`, { cache: "no-store", headers: { Accept: "application/json" } });
    if (!response.ok) throw new Error(`Show API returned ${response.status}`);
    renderShow(await response.json());
  } catch (error) {
    console.warn(error);
    renderError("公演情報を現在表示できません。しばらくしてからもう一度お試しください。");
  }
}

loadShow();

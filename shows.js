const upcomingRoot = document.querySelector("[data-upcoming-shows]");
const pastRoot = document.querySelector("[data-past-shows]");
const upcomingCount = document.querySelector("[data-upcoming-count]");
const pastCount = document.querySelector("[data-past-count]");
const showsRegions = document.querySelectorAll("[data-shows-region]");
let currentShows = [];

function normalizeContentResponse(data) {
  return {
    status: data && data.configured ? "api" : "empty",
    shows: Array.isArray(data?.shows) ? data.shows : [],
  };
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function showHref(show) {
  return show.href || (show.id ? `./show.html?id=${encodeURIComponent(show.id)}` : "./shows.html");
}

function showDate(show) {
  return show.displayDate || `${show.date || "日程未定"} ${show.year || ""}`.trim();
}

function showSummary(show) {
  return show.body || show.description || "公演情報を準備中です。";
}

function validExternalUrl(value) {
  const text = String(value || "").trim();
  return /^https?:\/\/\S+$/i.test(text) ? text : "";
}

function reservationNoticeText(show) {
  return [show?.reservationUrl, show?.reservationNote, show?.status].map((value) => String(value || "")).join(" ");
}

function programTitleHtml(title) {
  const text = String(title || "公演情報");
  const quoteIndex = ["「", "『"]
    .map((quote) => text.indexOf(quote))
    .filter((index) => index >= 0)
    .sort((a, b) => a - b)[0];
  if (quoteIndex === undefined) return escapeHtml(text);

  const prefix = text.slice(0, quoteIndex).trimEnd();
  const quoted = text.slice(quoteIndex).trimStart();
  return `
    ${prefix ? `<span class="program-title-prefix">${escapeHtml(prefix)}</span>` : ""}
    <span class="program-title-quoted">${escapeHtml(quoted)}</span>
  `;
}

function flyerHtml(show) {
  if (show.flyerUrl) {
    return `<img class="show-flyer" src="${escapeHtml(show.flyerUrl)}" alt="${escapeHtml(show.title)}のチラシ" />`;
  }

  return `
    <div class="show-flyer poster-fallback" aria-label="${escapeHtml(show.title)}のチラシ">
      <span>${escapeHtml(show.status || "公開中")}</span>
      <strong>${programTitleHtml(show.title)}</strong>
      <em>${escapeHtml(show.date || "日程未定")} ${escapeHtml(show.year || "")}</em>
    </div>
  `;
}

function isPastShow(show) {
  if (show.status === "終了") return true;
  if (!show.rawDate) return false;
  const date = new Date(`${show.rawDate}T23:59:59`);
  return !Number.isNaN(date.getTime()) && date < new Date();
}

function reservationButtonHtml(show) {
  const reservationUrl = validExternalUrl(show.reservationUrl);
  if (reservationUrl) {
    return `<a class="button primary show-row-reservation-button" href="${escapeHtml(reservationUrl)}" target="_blank" rel="noopener">予約する</a>`;
  }

  if (reservationNoticeText(show).includes("予約不要")) {
    return `<button class="button primary show-row-reservation-button is-disabled" type="button" disabled aria-disabled="true">予約不要</button>`;
  }

  return `<button class="button primary show-row-reservation-button is-disabled" type="button" disabled aria-disabled="true">予約準備中</button>`;
}

function showActionsHtml(show, options = {}) {
  return `
    <div class="show-row-actions">
      ${options.past ? "" : reservationButtonHtml(show)}
      <a class="button secondary surface show-row-detail-button" href="${escapeHtml(showHref(show))}">公演情報を見る</a>
    </div>
  `;
}

function showRowHtml(show, options = {}) {
  const isFeatured = Boolean(options.featured);
  const isPast = Boolean(options.past);
  const rowClasses = ["show-row", isFeatured ? "show-row-featured" : "", isPast ? "show-row-past" : ""].filter(Boolean).join(" ");
  return `
    <article class="${rowClasses} reveal">
      <a class="show-row-poster" href="${escapeHtml(showHref(show))}">
        ${flyerHtml(show)}
      </a>
      <div class="show-row-main">
        <div class="show-row-content">
          <div class="show-row-status">
            ${isFeatured ? '<span class="label">latest program</span>' : ""}
            <span class="card-kicker">${escapeHtml(show.status || "公開中")}</span>
          </div>
          <h3><a href="${escapeHtml(showHref(show))}">${programTitleHtml(show.title)}</a></h3>
          <p>${escapeHtml(showSummary(show))}</p>
        </div>
        <div class="show-row-meta">
          <span class="show-row-date">${escapeHtml(showDate(show))}</span>
          <span class="show-row-venue">${escapeHtml(show.venue || "会場未定")}</span>
        </div>
        ${showActionsHtml(show, { past: isPast })}
      </div>
    </article>
  `;
}

function observeReveals() {
  const targets = document.querySelectorAll(".reveal:not(.is-visible)");
  if (!("IntersectionObserver" in window)) {
    targets.forEach((el) => el.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );

  targets.forEach((el) => {
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight && rect.bottom > 0) {
      el.classList.add("is-visible");
      return;
    }
    observer.observe(el);
  });
}

function renderShows() {
  const upcoming = currentShows.filter((show) => !isPastShow(show));
  const past = currentShows.filter(isPastShow);
  const [featuredUpcoming, ...otherUpcoming] = upcoming;

  upcomingCount.textContent = `${upcoming.length}件`;
  pastCount.textContent = `${past.length}件`;
  upcomingRoot.innerHTML = upcoming.length
    ? [showRowHtml(featuredUpcoming, { featured: true }), ...otherUpcoming.map((show) => showRowHtml(show))].join("")
    : `<p class="empty-state">公開中の予定公演は現在ありません。</p>`;
  pastRoot.innerHTML = past.length ? past.map((show) => showRowHtml(show, { past: true })).join("") : `<p class="empty-state">過去公演は現在登録されていません。</p>`;
  observeReveals();
}

async function loadContent() {
  showsRegions.forEach((region) => region.setAttribute("aria-busy", "true"));
  currentShows = [];
  renderShows();

  try {
    const response = await fetch("/api/content", { cache: "no-store", headers: { Accept: "application/json" } });
    if (!response.ok) throw new Error(`Content API returned ${response.status}`);
    currentShows = normalizeContentResponse(await response.json()).shows;
  } catch (error) {
    console.warn("Shows unavailable.", error);
    currentShows = [];
  }

  renderShows();
  showsRegions.forEach((region) => region.setAttribute("aria-busy", "false"));
}

loadContent();

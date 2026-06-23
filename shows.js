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

function flyerHtml(show) {
  if (show.flyerUrl) {
    return `<img class="show-flyer" src="${escapeHtml(show.flyerUrl)}" alt="${escapeHtml(show.title)}のチラシ" />`;
  }

  return `
    <div class="show-flyer poster-fallback" aria-label="${escapeHtml(show.title)}のチラシ">
      <span>${escapeHtml(show.status || "公開中")}</span>
      <strong>${escapeHtml(show.title || "公演情報")}</strong>
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

function showActionsHtml(show) {
  const reservation = show.reservationUrl
    ? `<a class="button primary" href="${escapeHtml(show.reservationUrl)}" target="_blank" rel="noopener">予約する</a>`
    : "";
  return `
    <div class="show-row-actions">
      ${reservation}
      <a class="button secondary surface" href="${escapeHtml(showHref(show))}">公演詳細を見る</a>
    </div>
  `;
}

function showRowHtml(show, options = {}) {
  const isFeatured = Boolean(options.featured);
  return `
    <article class="show-row ${isFeatured ? "show-row-featured" : ""} reveal">
      <a class="show-row-poster" href="${escapeHtml(showHref(show))}">
        ${flyerHtml(show)}
      </a>
      <div class="show-row-main">
        <div>
          <div class="show-row-status">
            ${isFeatured ? '<span class="label">latest program</span>' : ""}
            <span class="card-kicker">${escapeHtml(show.status || "公開中")}</span>
          </div>
          <h3><a href="${escapeHtml(showHref(show))}">${escapeHtml(show.title || "公演情報")}</a></h3>
          <p>${escapeHtml(showSummary(show))}</p>
        </div>
        <div class="show-row-meta">
          <span class="show-row-date">${escapeHtml(showDate(show))}</span>
          <span>${escapeHtml(show.venue || "会場未定")}</span>
          ${isFeatured ? "" : `<a class="text-link" href="${escapeHtml(showHref(show))}">公演詳細</a>`}
        </div>
        ${isFeatured ? showActionsHtml(show) : ""}
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
  pastRoot.innerHTML = past.length ? past.map(showRowHtml).join("") : `<p class="empty-state">過去公演は現在登録されていません。</p>`;
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

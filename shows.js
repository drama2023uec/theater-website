const fallbackShows = [
  {
    title: "夏季試演会「境界線の椅子」",
    date: "7.19",
    rawDate: "2026-07-19",
    year: "2026",
    status: "予約不要",
    venue: "学生会館 小ホール",
    body: "短編3本を連続上演。入退場自由で、初見でも入りやすい試演会。",
  },
  {
    title: "秋季本公演「夜明け前の稽古場」",
    date: "10.24",
    rawDate: "2026-10-24",
    year: "2026",
    status: "準備中",
    venue: "講堂ステージ",
    body: "脚本会議から立ち上げる新作。照明と音響のワークショップも同時進行。",
  },
  {
    title: "新歓リーディング",
    date: "4.12",
    rawDate: "2026-04-12",
    year: "2026",
    status: "終了",
    venue: "第3集会室",
    body: "台本を持ったまま参加できる読み合わせ。初心者向けの入口企画。",
  },
];

const upcomingRoot = document.querySelector("[data-upcoming-shows]");
const pastRoot = document.querySelector("[data-past-shows]");
const upcomingCount = document.querySelector("[data-upcoming-count]");
const pastCount = document.querySelector("[data-past-count]");
let currentShows = fallbackShows;

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function showHref(show) {
  return show.href || (show.id ? `/show.html?id=${encodeURIComponent(show.id)}` : "./shows.html");
}

function flyerHtml(show) {
  if (show.flyerUrl) {
    return `<img class="show-flyer" src="${escapeHtml(show.flyerUrl)}" alt="${escapeHtml(show.title)}のチラシ" />`;
  }

  return `
    <div class="show-flyer poster-fallback" aria-label="${escapeHtml(show.title)}の仮チラシ">
      <span>${escapeHtml(show.status)}</span>
      <strong>${escapeHtml(show.title)}</strong>
      <em>${escapeHtml(show.date)} ${escapeHtml(show.year || "")}</em>
    </div>
  `;
}

function isPastShow(show) {
  if (show.status === "終了") return true;
  if (!show.rawDate) return false;
  const date = new Date(`${show.rawDate}T23:59:59`);
  return !Number.isNaN(date.getTime()) && date < new Date();
}

function showRowHtml(show) {
  return `
    <article class="show-row reveal">
      <a class="show-row-poster" href="${escapeHtml(showHref(show))}">
        ${flyerHtml(show)}
      </a>
      <div class="show-row-main">
        <div>
          <span class="card-kicker">${escapeHtml(show.status)}</span>
          <h3><a href="${escapeHtml(showHref(show))}">${escapeHtml(show.title)}</a></h3>
          <p>${escapeHtml(show.body)}</p>
        </div>
        <div class="show-row-meta">
          <span>${escapeHtml(show.date)} ${escapeHtml(show.year || "")}</span>
          <span>${escapeHtml(show.venue)}</span>
          <a class="text-link" href="${escapeHtml(showHref(show))}">PRページ</a>
        </div>
      </div>
    </article>
  `;
}

function observeReveals() {
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

  document.querySelectorAll(".reveal:not(.is-visible)").forEach((el) => observer.observe(el));
}

function renderShows() {
  const upcoming = currentShows.filter((show) => !isPastShow(show));
  const past = currentShows.filter(isPastShow);

  upcomingCount.textContent = `${upcoming.length}件`;
  pastCount.textContent = `${past.length}件`;
  upcomingRoot.innerHTML = upcoming.length ? upcoming.map(showRowHtml).join("") : `<p class="empty-state">公開中の予定公演はまだない。</p>`;
  pastRoot.innerHTML = past.length ? past.map(showRowHtml).join("") : `<p class="empty-state">過去公演はまだ登録されていない。</p>`;
  observeReveals();
}

async function loadContent() {
  try {
    const response = await fetch("/api/content", { cache: "no-store", headers: { Accept: "application/json" } });
    if (!response.ok) throw new Error(`Content API returned ${response.status}`);
    const data = await response.json();
    if (data.configured && Array.isArray(data.shows) && data.shows.length > 0) {
      currentShows = data.shows;
    }
  } catch (error) {
    console.warn("Using fallback shows.", error);
  }

  renderShows();
}

loadContent();

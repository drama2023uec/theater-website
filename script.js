const fallbackShows = [
  {
    title: "夏季試演会「境界線の椅子」",
    date: "7.19",
    status: "予約不要",
    venue: "学生会館 小ホール",
    body: "短編3本を連続上演。入退場自由で、初見でも入りやすい試演会。",
  },
  {
    title: "秋季本公演「夜明け前の稽古場」",
    date: "10.24",
    status: "準備中",
    venue: "講堂ステージ",
    body: "脚本会議から立ち上げる新作。照明と音響のワークショップも同時進行。",
  },
  {
    title: "新歓リーディング",
    date: "4.12",
    status: "終了",
    venue: "第3集会室",
    body: "台本を持ったまま参加できる読み合わせ。初心者向けの入口企画。",
  },
];

const fallbackPosts = [
  {
    title: "立ち稽古初日、椅子の位置だけで空気が変わった",
    date: "2026.06.12",
    category: "稽古",
    author: "演出班",
    excerpt: "台詞より先に、距離と視線を決める。舞台上の椅子を15cm動かすだけで関係性が変わる。",
    likes: 18,
  },
  {
    title: "照明プランをNotionで共有する運用に変えた",
    date: "2026.06.08",
    category: "制作",
    author: "照明班",
    excerpt: "色番号、吊り位置、キューの意図を表で残す。次の担当者が読める粒度を基準にする。",
    likes: 12,
  },
  {
    title: "夏季試演会のフライヤーを公開",
    date: "2026.06.01",
    category: "告知",
    author: "広報班",
    excerpt: "予約不要、入退場自由。短編3本の試演会として、初参加の部員も舞台に立つ。",
    likes: 9,
  },
  {
    title: "音響の入りを1拍遅らせる判断",
    date: "2026.05.28",
    category: "稽古",
    author: "音響班",
    excerpt: "効果音は説明ではなく、沈黙を切るために使う。今回の場面では1拍待つ方が強い。",
    likes: 15,
  },
  {
    title: "衣装管理をサイズ表から始める",
    date: "2026.05.22",
    category: "制作",
    author: "衣装班",
    excerpt: "私物と備品を混ぜない。写真、サイズ、返却状態をNotionで一元管理する。",
    likes: 7,
  },
  {
    title: "新入部員向け見学日を追加",
    date: "2026.05.15",
    category: "告知",
    author: "代表",
    excerpt: "水曜と金曜の通常稽古に加えて、土曜午後に制作見学枠を設ける。",
    likes: 6,
  },
];

const showRoot = document.querySelector("[data-shows]");
const postRoot = document.querySelector("[data-posts]");
const pickupRoot = document.querySelector("[data-pickup]");
const filterButtons = document.querySelectorAll("[data-filter]");
const header = document.querySelector("[data-header]");
const spotlight = document.querySelector(".hero-spotlight");
let currentShows = fallbackShows;
let currentPosts = fallbackPosts;
let currentFilter = "all";

function renderShows() {
  const featured = currentShows[0];
  const secondary = currentShows.slice(1, 4);

  if (!featured) {
    showRoot.innerHTML = "";
    return;
  }

  showRoot.innerHTML = `
    <article class="featured-show-card program-feature reveal">
      <div class="program-poster-panel">
        <a class="flyer-link" href="${escapeHtml(showHref(featured))}">
          ${flyerHtml(featured, "large")}
        </a>
        <div class="program-date-badge" aria-label="${escapeHtml(featured.date)} ${escapeHtml(featured.year || "")}">
          <strong>${escapeHtml(featured.date)}</strong>
          <span>${escapeHtml(featured.year || "")}</span>
        </div>
      </div>
      <div class="featured-show-copy program-feature-copy">
        <div class="program-status-row">
          <span class="label">latest program</span>
          <span class="card-kicker">${escapeHtml(featured.status)}</span>
        </div>
        <h3>${escapeHtml(featured.title)}</h3>
        <p>${escapeHtml(featured.body)}</p>
        <dl class="show-facts program-facts">
          <div>
            <dt>日程</dt>
            <dd>${escapeHtml(featured.date)} ${escapeHtml(featured.year || "")}</dd>
          </div>
          <div>
            <dt>会場</dt>
            <dd>${escapeHtml(featured.venue)}</dd>
          </div>
          <div>
            <dt>状態</dt>
            <dd>${escapeHtml(featured.status)}</dd>
          </div>
        </dl>
        <div class="program-actions">
          ${featured.reservationUrl ? `<a class="button primary" href="${escapeHtml(featured.reservationUrl)}" target="_blank" rel="noopener">予約ページへ</a>` : ""}
          <a class="button secondary surface" href="${escapeHtml(showHref(featured))}">PRページを見る</a>
        </div>
      </div>
    </article>
    <aside class="mini-show-list program-next-list" aria-label="ほかの公演">
      <div class="program-next-header">
        <span class="label">next</span>
        <strong>ほかの公演</strong>
      </div>
      ${secondary.map((show) => miniShowHtml(show)).join("")}
    </aside>
  `;
  observeReveals();
}

function showHref(show) {
  return show.href || (show.id ? `/show.html?id=${encodeURIComponent(show.id)}` : "./shows.html");
}

function flyerHtml(show, size = "small") {
  if (show.flyerUrl) {
    return `<img class="show-flyer ${size === "large" ? "is-large" : ""}" src="${escapeHtml(show.flyerUrl)}" alt="${escapeHtml(show.title)}のチラシ" />`;
  }

  return `
    <div class="show-flyer poster-fallback ${size === "large" ? "is-large" : ""}" aria-label="${escapeHtml(show.title)}の仮チラシ">
      <span>${escapeHtml(show.status)}</span>
      <strong>${escapeHtml(show.title)}</strong>
      <em>${escapeHtml(show.date)} ${escapeHtml(show.year || "")}</em>
    </div>
  `;
}

function miniShowHtml(show) {
  return `
    <article class="mini-show-card reveal">
      <a class="flyer-link" href="${escapeHtml(showHref(show))}">
        ${flyerHtml(show)}
      </a>
      <div>
        <div class="mini-show-meta">
          <span>${escapeHtml(show.date)} ${escapeHtml(show.year || "")}</span>
          <span class="card-kicker">${escapeHtml(show.status)}</span>
        </div>
        <h3><a href="${escapeHtml(showHref(show))}">${escapeHtml(show.title)}</a></h3>
        <p>${escapeHtml(show.venue)}</p>
      </div>
    </article>
  `;
}

function filteredPosts(category = currentFilter) {
  return category === "all" ? currentPosts : currentPosts.filter((post) => post.category === category);
}

function postHref(post) {
  return post.href || (post.id ? `/article.html?id=${encodeURIComponent(post.id)}` : "#journal");
}

function likeKey(id) {
  return `drama-like:${id}`;
}

function hasLiked(id) {
  return Boolean(id && window.localStorage?.getItem(likeKey(id)));
}

function setLiked(id, liked) {
  if (!id) return;
  if (liked) {
    window.localStorage?.setItem(likeKey(id), "1");
  } else {
    window.localStorage?.removeItem(likeKey(id));
  }
}

function postCardHtml(post) {
  const liked = hasLiked(post.id);
  const disabled = !post.id ? "disabled" : "";
  const label = liked ? "いいねを取り消す" : "いいね";
  const authorInitial = String(post.author || "演劇同好会").trim().charAt(0) || "演";

  return `
    <article class="post-card reveal" data-post-id="${escapeHtml(post.id || "")}">
      <a class="post-card-link" href="${escapeHtml(postHref(post))}">
        <div class="post-author-row">
          <span class="author-avatar" aria-hidden="true">${escapeHtml(authorInitial)}</span>
          <span class="post-author-name">${escapeHtml(post.author)}</span>
          <span class="post-date">${escapeHtml(post.date)}</span>
        </div>
        <h3>${escapeHtml(post.title)}</h3>
        <p>${escapeHtml(post.excerpt)}</p>
      </a>
      <div class="card-footer">
        <span class="card-kicker">${escapeHtml(post.category)}</span>
        <span>稽古記録</span>
      </div>
      <button class="like-button ${liked ? "is-liked" : ""}" type="button" data-like-id="${escapeHtml(post.id || "")}" aria-label="${label}" title="${label}" ${disabled}>
        <span class="heart-icon" aria-hidden="true">♥</span>
        <strong data-like-count>${Number(post.likes || 0)}</strong>
      </button>
    </article>
  `;
}

function renderPosts(category = currentFilter) {
  currentFilter = category;
  const matchingPosts = filteredPosts(category);
  const visiblePosts = matchingPosts.slice(0, 3);

  postRoot.innerHTML = visiblePosts.map(postCardHtml).join("");

  observeReveals();
}

function renderPickup() {
  if (!pickupRoot) return;
  if (!currentPosts.length) {
    pickupRoot.innerHTML = "";
    return;
  }

  const picked = [...currentPosts].sort((a, b) => Number(b.likes || 0) - Number(a.likes || 0))[0];
  pickupRoot.innerHTML = `
    <a class="pickup-card home-pickup-card reveal" href="${escapeHtml(postHref(picked))}">
      <div class="home-pickup-copy">
        <span class="label">pick up</span>
        <div class="home-pickup-kickers">
          <span class="card-kicker">${escapeHtml(picked.category)}</span>
          <span>${escapeHtml(picked.author)} / ${escapeHtml(picked.date)}</span>
        </div>
        <h3>${escapeHtml(picked.title)}</h3>
        <p>${escapeHtml(picked.excerpt)}</p>
        <span class="text-link">記事を読む</span>
      </div>
      <div class="home-pickup-score" aria-label="${Number(picked.likes || 0)} likes">
        <span>♥</span>
        <strong>${Number(picked.likes || 0)}</strong>
        <em>liked</em>
      </div>
    </a>
  `;
  observeReveals();
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

function updatePostLikes(id, likes) {
  currentPosts = currentPosts.map((post) => (post.id === id ? { ...post, likes } : post));
}

async function likePost(id) {
  if (!id) return;
  const nextLiked = !hasLiked(id);

  const response = await fetch("/api/like", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ id, liked: nextLiked }),
  });

  if (!response.ok) throw new Error(`Like API returned ${response.status}`);
  const data = await response.json();
  setLiked(id, Boolean(data.liked));
  updatePostLikes(id, Number(data.likes || 0));
  renderPickup();
  renderPosts(currentFilter);
}

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    filterButtons.forEach((item) => {
      item.classList.remove("active");
      item.setAttribute("aria-selected", "false");
    });
    button.classList.add("active");
    button.setAttribute("aria-selected", "true");
    renderPosts(button.dataset.filter);
  });
});

postRoot?.addEventListener("click", async (event) => {
  const button = event.target.closest("[data-like-id]");
  if (!button) return;
  event.preventDefault();
  event.stopPropagation();

  const id = button.dataset.likeId;
  button.disabled = true;
  try {
    await likePost(id);
  } catch (error) {
    console.warn(error);
    button.disabled = false;
  }
});

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

async function loadContent() {
  try {
    const response = await fetch("/api/content", { cache: "no-store", headers: { Accept: "application/json" } });
    if (!response.ok) throw new Error(`Content API returned ${response.status}`);

    const data = await response.json();
    if (data.configured) {
      currentShows = Array.isArray(data.shows) && data.shows.length > 0 ? data.shows : fallbackShows;
      currentPosts = Array.isArray(data.posts) && data.posts.length > 0 ? data.posts : fallbackPosts;
    }
  } catch (error) {
    console.warn("Using fallback content.", error);
  }

  renderShows();
  renderPickup();
  renderPosts(currentFilter);
  observeReveals();
}

window.addEventListener("scroll", () => {
  header.classList.toggle("is-solid", window.scrollY > 80);
});

window.addEventListener("pointermove", (event) => {
  if (!spotlight) return;
  spotlight.style.setProperty("--x", `${event.clientX}px`);
  spotlight.style.setProperty("--y", `${event.clientY}px`);
});

loadContent();

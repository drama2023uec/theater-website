const showRoot = document.querySelector("[data-shows]");
const postRoot = document.querySelector("[data-posts]");
const pickupRoot = document.querySelector("[data-pickup]");
const heroProgramRoot = document.querySelector("[data-hero-program]");
const filterButtons = document.querySelectorAll("[data-filter]");
const filterControl = filterButtons[0]?.closest(".segmented");
const header = document.querySelector("[data-header]");
const spotlight = document.querySelector(".hero-spotlight");
let currentShows = [];
let currentPosts = [];
let contentStatus = "loading";
let currentFilter = "all";

function normalizeContentResponse(data) {
  return {
    status: data && data.configured ? "api" : "empty",
    shows: Array.isArray(data?.shows) ? data.shows : [],
    posts: Array.isArray(data?.posts) ? data.posts : [],
  };
}

function contentForFetchFailure() {
  return { status: "error", shows: [], posts: [] };
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

function flyerHtml(show, size = "small") {
  if (show.flyerUrl) {
    return `<img class="show-flyer ${size === "large" ? "is-large" : ""}" src="${escapeHtml(show.flyerUrl)}" alt="${escapeHtml(show.title)}のチラシ" />`;
  }

  return `
    <div class="show-flyer poster-fallback ${size === "large" ? "is-large" : ""}" aria-label="${escapeHtml(show.title)}のチラシ">
      <span>${escapeHtml(show.status || "公開中")}</span>
      <strong>${escapeHtml(show.title || "公演情報")}</strong>
      <em>${escapeHtml(show.date || "日程未定")} ${escapeHtml(show.year || "")}</em>
    </div>
  `;
}

function renderHeroProgram() {
  if (!heroProgramRoot) return;
  const show = currentShows[0];

  if (!show) {
    heroProgramRoot.innerHTML = `
      <div class="hero-program-topline">
        <span class="label">next program</span>
        <span class="hero-program-status">準備中</span>
      </div>
      <h2>次回公演は準備中</h2>
      <p class="hero-program-empty">公開できる情報が整い次第、こちらで案内します。</p>
    `;
    return;
  }

  heroProgramRoot.innerHTML = `
    <div class="hero-program-topline">
      <span class="label">next program</span>
      <span class="hero-program-status">${escapeHtml(show.status || "公開中")}</span>
    </div>
    <h2>${escapeHtml(show.shortTitle || show.title)}</h2>
    <dl>
      <div>
        <dt>日程</dt>
        <dd>${escapeHtml(showDate(show))}</dd>
      </div>
      <div>
        <dt>会場</dt>
        <dd>${escapeHtml(show.venue || "会場未定")}</dd>
      </div>
    </dl>
    <div class="hero-program-actions">
      ${show.reservationUrl ? `<a class="button primary" href="${escapeHtml(show.reservationUrl)}" target="_blank" rel="noopener">予約する</a>` : ""}
      <a class="button secondary" href="${escapeHtml(showHref(show))}">公演詳細を見る</a>
    </div>
  `;
}

function renderShows() {
  if (!showRoot) return;
  const featured = currentShows[0];
  const secondary = currentShows.slice(1, 4);
  showRoot.classList.toggle("show-grid-single", secondary.length === 0);

  if (!featured) {
    showRoot.innerHTML = `<p class="empty-state">公開中の公演情報は現在ありません。</p>`;
    return;
  }

  const secondaryHtml = secondary.length
    ? `
      <aside class="mini-show-list program-next-list" aria-label="ほかの公演">
        <div class="program-next-header">
          <span class="label">next</span>
          <strong>ほかの公演</strong>
        </div>
        ${secondary.map((show) => miniShowHtml(show)).join("")}
      </aside>
    `
    : "";

  showRoot.innerHTML = `
    <article class="featured-show-card program-feature reveal">
      <div class="program-poster-panel">
        <a class="flyer-link" href="${escapeHtml(showHref(featured))}">
          ${flyerHtml(featured, "large")}
        </a>
      </div>
      <div class="featured-show-copy program-feature-copy">
        <div class="program-status-row">
          <span class="label">latest program</span>
          <span class="card-kicker">${escapeHtml(featured.status || "公開中")}</span>
        </div>
        <h3>${escapeHtml(featured.title)}</h3>
        <p>${escapeHtml(showSummary(featured))}</p>
        <dl class="show-facts program-facts">
          <div>
            <dt>日程</dt>
            <dd>${escapeHtml(showDate(featured))}</dd>
          </div>
          <div>
            <dt>会場</dt>
            <dd>${escapeHtml(featured.venue || "会場未定")}</dd>
          </div>
          <div>
            <dt>料金</dt>
            <dd>${escapeHtml(featured.price || "確認中")}</dd>
          </div>
        </dl>
        <div class="program-actions">
          ${featured.reservationUrl ? `<a class="button primary" href="${escapeHtml(featured.reservationUrl)}" target="_blank" rel="noopener">予約する</a>` : ""}
          <a class="button secondary surface" href="${escapeHtml(showHref(featured))}">公演詳細を見る</a>
        </div>
      </div>
    </article>
    ${secondaryHtml}
  `;
  observeReveals();
}

function miniShowHtml(show) {
  return `
    <article class="mini-show-card reveal">
      <a class="flyer-link" href="${escapeHtml(showHref(show))}">
        ${flyerHtml(show)}
      </a>
      <div>
        <div class="mini-show-meta">
          <span>${escapeHtml(showDate(show))}</span>
          <span class="card-kicker">${escapeHtml(show.status || "公開中")}</span>
        </div>
        <h3><a href="${escapeHtml(showHref(show))}">${escapeHtml(show.title)}</a></h3>
        <p>${escapeHtml(show.venue || "会場未定")}</p>
        <a class="mini-show-link" href="${escapeHtml(show.reservationUrl || showHref(show))}" ${show.reservationUrl ? 'target="_blank" rel="noopener"' : ""}>${
          show.reservationUrl ? "予約" : "詳細"
        }</a>
      </div>
    </article>
  `;
}

function filteredPosts(category = currentFilter) {
  return category === "all" ? currentPosts : currentPosts.filter((post) => post.category === category);
}

function postHref(post) {
  return post.href || (post.id ? `./article.html?id=${encodeURIComponent(post.id)}` : "#journal");
}

function postLikeId(post) {
  if (post.id) return post.id;
  return `local:${post.date}:${post.title}`;
}

function postLikeCount(post) {
  const baseLikes = Number(post.likes || 0);
  return post.id || !hasLiked(postLikeId(post)) ? baseLikes : baseLikes + 1;
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

function journalEmptyMessage() {
  if (contentStatus === "error") {
    return "稽古記録を現在表示できません。しばらくしてからもう一度お試しください。";
  }
  return "稽古記録は現在準備中です。公開できる記録が整い次第、こちらで紹介します。";
}

function postCardHtml(post) {
  const likeId = postLikeId(post);
  const liked = hasLiked(likeId);
  const label = liked ? "いいねを取り消す" : "いいね";
  const authorInitial = String(post.author || "演劇同好会").trim().charAt(0) || "演";

  return `
    <article class="post-card reveal" data-post-id="${escapeHtml(post.id || "")}">
      <a class="post-card-link" href="${escapeHtml(postHref(post))}">
        ${
          post.imageUrl
            ? `<figure class="post-card-image">
                <img src="${escapeHtml(post.imageUrl)}" alt="${escapeHtml(post.title || "稽古記録")}の画像" loading="lazy" />
              </figure>`
            : ""
        }
        <div class="post-author-row">
          <span class="author-avatar" aria-hidden="true">${escapeHtml(authorInitial)}</span>
          <span class="post-author-name">${escapeHtml(post.author || "演劇同好会")}</span>
          <span class="post-date">${escapeHtml(post.date || "日付未定")}</span>
        </div>
        <h3>${escapeHtml(post.title || "無題")}</h3>
        <p>${escapeHtml(post.excerpt || "")}</p>
        <span class="post-read-more">記事を読む</span>
      </a>
      <div class="card-footer">
        <span class="card-kicker">${escapeHtml(post.category || "稽古")}</span>
        <span>稽古記録</span>
      </div>
      <button class="like-button ${liked ? "is-liked" : ""}" type="button" data-like-id="${escapeHtml(likeId)}" data-like-local="${
        post.id ? "false" : "true"
      }" aria-label="${label}" aria-pressed="${liked ? "true" : "false"}" title="${label}">
        <span class="heart-icon" aria-hidden="true">♥</span>
        <strong data-like-count>${postLikeCount(post)}</strong>
      </button>
    </article>
  `;
}

function renderPosts(category = currentFilter) {
  if (!postRoot) return;
  currentFilter = category;
  filterControl?.classList.toggle("is-hidden", currentPosts.length === 0);

  const matchingPosts = filteredPosts(category);
  const visiblePosts = matchingPosts.slice(0, 3);

  if (currentPosts.length === 0) {
    postRoot.innerHTML = "";
  } else if (matchingPosts.length === 0) {
    postRoot.innerHTML = `<p class="empty-state">このカテゴリの記事は現在ありません。</p>`;
  } else {
    postRoot.innerHTML = visiblePosts.map(postCardHtml).join("");
  }

  observeReveals();
}

function renderPickup() {
  if (!pickupRoot) return;
  if (!currentPosts.length) {
    pickupRoot.innerHTML = `<p class="empty-state">${escapeHtml(journalEmptyMessage())}</p>`;
    return;
  }

  const [picked, ...relatedPosts] = currentPosts;
  pickupRoot.innerHTML = `
    <div class="pickup-card home-pickup-card ${picked.imageUrl ? "has-image" : ""} reveal">
      ${
        picked.imageUrl
          ? `<a class="home-pickup-image" href="${escapeHtml(postHref(picked))}" aria-label="${escapeHtml(picked.title || "最新の稽古記録")}を読む">
              <img src="${escapeHtml(picked.imageUrl)}" alt="${escapeHtml(picked.title || "最新の稽古記録")}の画像" loading="eager" decoding="async" />
            </a>`
          : ""
      }
      <a class="home-pickup-copy" href="${escapeHtml(postHref(picked))}">
        <div class="pickup-label-row">
          <span class="label">latest journal</span>
          <span class="pickup-like-note">最新記事</span>
        </div>
        <span class="pickup-reason">${escapeHtml(picked.category || "稽古記録")}</span>
        <div class="home-pickup-kickers">
          <span class="card-kicker">${escapeHtml(picked.category || "稽古")}</span>
          <span>${escapeHtml(picked.author || "演劇同好会")} / ${escapeHtml(picked.date || "日付未定")}</span>
        </div>
        <h3>${escapeHtml(picked.title || "無題")}</h3>
        <p>${escapeHtml(picked.excerpt || "")}</p>
        <span class="text-link">記事を読む</span>
      </a>
      <div class="pickup-side-list" aria-label="あわせて読みたい稽古記録">
        <div class="pickup-side-heading">
          <span>related</span>
          <strong>次に読む2本</strong>
        </div>
        ${relatedPosts
          .slice(0, 2)
          .map(
            (post) => `
              <a class="pickup-side-link" href="${escapeHtml(postHref(post))}">
                <em>あわせて読む</em>
                <span>${escapeHtml(post.category || "稽古")} / ${escapeHtml(post.date || "日付未定")}</span>
                <strong>${escapeHtml(post.title || "無題")}</strong>
              </a>
            `,
          )
          .join("")}
      </div>
    </div>
  `;
  observeReveals();
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

function updatePostLikes(id, likes) {
  currentPosts = currentPosts.map((post) => (postLikeId(post) === id ? { ...post, likes } : post));
}

function likeFallbackPost(id) {
  const nextLiked = !hasLiked(id);
  setLiked(id, nextLiked);
  renderPickup();
  renderPosts(currentFilter);
}

async function likePost(id, isLocal = false) {
  if (!id) return;
  if (isLocal) {
    likeFallbackPost(id);
    return;
  }

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

function applyContentResult(result) {
  contentStatus = result.status;
  currentShows = result.shows;
  currentPosts = result.posts;
}

function renderAllContent() {
  renderHeroProgram();
  renderShows();
  renderPickup();
  renderPosts(currentFilter);
  observeReveals();
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
  if (button) {
    event.preventDefault();
    event.stopPropagation();

    const id = button.dataset.likeId;
    button.disabled = true;
    try {
      await likePost(id, button.dataset.likeLocal === "true");
    } catch (error) {
      console.warn(error);
      button.disabled = false;
    }
    return;
  }

  if (!event.target.closest("a")) {
    const cardLink = event.target.closest(".post-card")?.querySelector(".post-card-link");
    if (cardLink) {
      window.location.href = cardLink.href;
    }
  }
});

async function loadContent() {
  applyContentResult({ status: "loading", shows: [], posts: [] });
  renderAllContent();

  try {
    const response = await fetch("/api/content", { cache: "no-store", headers: { Accept: "application/json" } });
    if (!response.ok) throw new Error(`Content API returned ${response.status}`);
    applyContentResult(normalizeContentResponse(await response.json()));
  } catch (error) {
    console.warn("Content unavailable.", error);
    applyContentResult(contentForFetchFailure());
  }

  renderAllContent();
}

window.addEventListener("scroll", () => {
  header?.classList.toggle("is-solid", window.scrollY > 80);
});

window.addEventListener("pointermove", (event) => {
  if (!spotlight) return;
  spotlight.style.setProperty("--x", `${event.clientX}px`);
  spotlight.style.setProperty("--y", `${event.clientY}px`);
});

loadContent();

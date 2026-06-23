const POSTS_PER_PAGE = 6;
const postRoot = document.querySelector("[data-journal-posts]");
const pickupRoot = document.querySelector("[data-pickup]");
const paginationRoot = document.querySelector("[data-pagination]");
const statusRoot = document.querySelector("[data-journal-status]");
const journalRegion = document.querySelector("[data-journal-region]");
const filterButtons = document.querySelectorAll("[data-filter]");
const filterControl = filterButtons[0]?.closest(".segmented");
let currentPosts = [];
let contentStatus = "loading";
let currentFilter = "all";
let currentPage = 1;

function normalizeContentResponse(data) {
  return {
    status: data && data.configured ? "api" : "empty",
    posts: Array.isArray(data?.posts) ? data.posts : [],
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

function filteredPosts() {
  return currentFilter === "all" ? currentPosts : currentPosts.filter((post) => post.category === currentFilter);
}

function postHref(post) {
  return post.href || (post.id ? `./article.html?id=${encodeURIComponent(post.id)}` : "./journal.html");
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

function emptyMessage() {
  if (contentStatus === "error") {
    return "稽古記録を現在表示できません。しばらくしてからもう一度お試しください。";
  }
  return "現在、公開中の稽古記録はありません。活動の記録は準備ができ次第公開します。";
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

function renderPickup() {
  if (!pickupRoot) return;
  if (!currentPosts.length) {
    pickupRoot.innerHTML = "";
    return;
  }

  const [picked, ...relatedPosts] = currentPosts;
  pickupRoot.innerHTML = `
    <div class="pickup-card archive-pickup-card reveal">
      <a class="archive-pickup-main" href="${escapeHtml(postHref(picked))}">
        <div class="pickup-label-row">
          <span class="label">latest journal</span>
          <span class="pickup-like-note">最新記事</span>
        </div>
        <span class="pickup-reason">${escapeHtml(picked.category || "稽古記録")}</span>
        <span class="card-kicker">${escapeHtml(picked.category || "稽古")}</span>
        <h3>${escapeHtml(picked.title || "無題")}</h3>
        <p>${escapeHtml(picked.excerpt || "")}</p>
        <div class="pickup-meta">
          <span>${escapeHtml(picked.date || "日付未定")} / ${escapeHtml(picked.author || "演劇同好会")}</span>
        </div>
      </a>
      <div class="pickup-side-list compact" aria-label="あわせて読みたい稽古記録">
        ${relatedPosts
          .slice(0, 2)
          .map(
            (post) => `
              <a class="pickup-side-link" href="${escapeHtml(postHref(post))}">
                <em>次に読む</em>
                <span>${escapeHtml(post.category || "稽古")} / ${escapeHtml(post.date || "日付未定")}</span>
                <strong>${escapeHtml(post.title || "無題")}</strong>
              </a>
            `,
          )
          .join("")}
      </div>
    </div>
  `;
}

function renderPagination(totalPages) {
  if (!paginationRoot || totalPages <= 1) {
    if (paginationRoot) paginationRoot.innerHTML = "";
    return;
  }

  const buttons = Array.from({ length: totalPages }, (_, index) => {
    const page = index + 1;
    return `<button type="button" class="${page === currentPage ? "active" : ""}" data-page="${page}" aria-current="${page === currentPage ? "page" : "false"}">${page}</button>`;
  });

  paginationRoot.innerHTML = buttons.join("");
}

function renderPosts() {
  if (!postRoot || !statusRoot) return;
  filterControl?.classList.toggle("is-hidden", currentPosts.length === 0);

  if (currentPosts.length === 0) {
    currentPage = 1;
    statusRoot.textContent = "0件";
    postRoot.innerHTML = `<p class="empty-state">${escapeHtml(emptyMessage())}</p>`;
    renderPagination(0);
    return;
  }

  const posts = filteredPosts();
  const totalPages = Math.max(1, Math.ceil(posts.length / POSTS_PER_PAGE));
  currentPage = Math.min(currentPage, totalPages);
  const start = (currentPage - 1) * POSTS_PER_PAGE;
  const pagePosts = posts.slice(start, start + POSTS_PER_PAGE);

  statusRoot.textContent = `${posts.length}件中 ${pagePosts.length ? start + 1 : 0}-${start + pagePosts.length}件を表示`;
  postRoot.innerHTML = pagePosts.length
    ? pagePosts.map(postCardHtml).join("")
    : `<p class="empty-state">このカテゴリの記事は現在ありません。</p>`;
  renderPagination(totalPages);
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
  renderPosts();
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
  renderPosts();
}

function applyContentResult(result) {
  contentStatus = result.status;
  currentPosts = result.posts;
}

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    filterButtons.forEach((item) => {
      item.classList.remove("active");
      item.setAttribute("aria-selected", "false");
    });
    button.classList.add("active");
    button.setAttribute("aria-selected", "true");
    currentFilter = button.dataset.filter;
    currentPage = 1;
    renderPosts();
  });
});

paginationRoot?.addEventListener("click", (event) => {
  const button = event.target.closest("[data-page]");
  if (!button) return;
  currentPage = Number(button.dataset.page || 1);
  renderPosts();
  window.scrollTo({ top: 0, behavior: "smooth" });
});

postRoot?.addEventListener("click", async (event) => {
  const button = event.target.closest("[data-like-id]");
  if (button) {
    event.preventDefault();
    event.stopPropagation();

    button.disabled = true;
    try {
      await likePost(button.dataset.likeId, button.dataset.likeLocal === "true");
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
  journalRegion?.setAttribute("aria-busy", "true");
  applyContentResult({ status: "loading", posts: [] });
  renderPickup();
  renderPosts();

  try {
    const response = await fetch("/api/content", { cache: "no-store", headers: { Accept: "application/json" } });
    if (!response.ok) throw new Error(`Content API returned ${response.status}`);
    applyContentResult(normalizeContentResponse(await response.json()));
  } catch (error) {
    console.warn("Journal posts unavailable.", error);
    applyContentResult({ status: "error", posts: [] });
  }

  renderPickup();
  renderPosts();
  journalRegion?.setAttribute("aria-busy", "false");
}

loadContent();

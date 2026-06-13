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

const POSTS_PER_PAGE = 6;
const postRoot = document.querySelector("[data-journal-posts]");
const pickupRoot = document.querySelector("[data-pickup]");
const paginationRoot = document.querySelector("[data-pagination]");
const statusRoot = document.querySelector("[data-journal-status]");
const filterButtons = document.querySelectorAll("[data-filter]");
let currentPosts = fallbackPosts;
let currentFilter = "all";
let currentPage = 1;

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

function pickupPost() {
  if (!currentPosts.length) return null;
  return [...currentPosts].sort((a, b) => Number(b.likes || 0) - Number(a.likes || 0))[0];
}

function postKey(post) {
  return post ? post.id || post.title : "";
}

function postHref(post) {
  return post.href || (post.id ? `/article.html?id=${encodeURIComponent(post.id)}` : "./journal.html");
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

function renderPickup() {
  if (!currentPosts.length) {
    pickupRoot.innerHTML = "";
    return;
  }

  const picked = pickupPost();
  pickupRoot.innerHTML = `
    <a class="pickup-card reveal" href="${escapeHtml(postHref(picked))}">
      <span class="label">pick up</span>
      <div>
        <span class="card-kicker">${escapeHtml(picked.category)}</span>
        <h3>${escapeHtml(picked.title)}</h3>
        <p>${escapeHtml(picked.excerpt)}</p>
      </div>
      <div class="pickup-meta">
        <span>${escapeHtml(picked.date)} / ${escapeHtml(picked.author)}</span>
        <strong>${Number(picked.likes || 0)} likes</strong>
      </div>
    </a>
  `;
}

function renderPagination(totalPages) {
  if (totalPages <= 1) {
    paginationRoot.innerHTML = "";
    return;
  }

  const buttons = Array.from({ length: totalPages }, (_, index) => {
    const page = index + 1;
    return `<button type="button" class="${page === currentPage ? "active" : ""}" data-page="${page}" aria-current="${page === currentPage ? "page" : "false"}">${page}</button>`;
  });

  paginationRoot.innerHTML = buttons.join("");
}

function renderPosts() {
  const featuredKey = postKey(pickupPost());
  const posts = filteredPosts().filter((post) => postKey(post) !== featuredKey);
  const totalPages = Math.max(1, Math.ceil(posts.length / POSTS_PER_PAGE));
  currentPage = Math.min(currentPage, totalPages);
  const start = (currentPage - 1) * POSTS_PER_PAGE;
  const pagePosts = posts.slice(start, start + POSTS_PER_PAGE);

  statusRoot.textContent = `${posts.length}件中 ${pagePosts.length ? start + 1 : 0}-${start + pagePosts.length}件を表示`;
  postRoot.innerHTML = pagePosts.map(postCardHtml).join("");
  renderPagination(totalPages);
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
  renderPosts();
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

paginationRoot.addEventListener("click", (event) => {
  const button = event.target.closest("[data-page]");
  if (!button) return;
  currentPage = Number(button.dataset.page || 1);
  renderPosts();
  window.scrollTo({ top: 0, behavior: "smooth" });
});

postRoot.addEventListener("click", async (event) => {
  const button = event.target.closest("[data-like-id]");
  if (!button) return;
  event.preventDefault();
  event.stopPropagation();

  button.disabled = true;
  try {
    await likePost(button.dataset.likeId);
  } catch (error) {
    console.warn(error);
    button.disabled = false;
  }
});

async function loadContent() {
  try {
    const response = await fetch("/api/content", { cache: "no-store", headers: { Accept: "application/json" } });
    if (!response.ok) throw new Error(`Content API returned ${response.status}`);
    const data = await response.json();
    if (data.configured && Array.isArray(data.posts) && data.posts.length > 0) {
      currentPosts = data.posts;
    }
  } catch (error) {
    console.warn("Using fallback posts.", error);
  }

  renderPickup();
  renderPosts();
}

loadContent();

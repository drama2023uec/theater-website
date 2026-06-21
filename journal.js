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

function postHref(post) {
  return post.href || (post.id ? `/article.html?id=${encodeURIComponent(post.id)}` : "./journal.html");
}

function postLikeId(post) {
  if (post.id) return post.id;
  return `fallback:${post.date}:${post.title}`;
}

function postLikeCount(post) {
  const baseLikes = Number(post.likes || 0);
  return post.id || !hasLiked(postLikeId(post)) ? baseLikes : baseLikes + 1;
}

function pickupReason(post) {
  const reasons = {
    稽古: "稽古場の判断が具体的に追える記録",
    制作: "次の担当者がそのまま参照できる制作メモ",
    告知: "直近の動きと参加導線がまとまった知らせ",
  };
  return reasons[post.category] || "活動の温度が短く読める記録";
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
  const likeId = postLikeId(post);
  const liked = hasLiked(likeId);
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
        <span class="post-read-more">記事を読む</span>
      </a>
      <div class="card-footer">
        <span class="card-kicker">${escapeHtml(post.category)}</span>
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
  if (!currentPosts.length) {
    pickupRoot.innerHTML = "";
    return;
  }

  const [picked, ...relatedPosts] = [...currentPosts].sort((a, b) => postLikeCount(b) - postLikeCount(a));
  pickupRoot.innerHTML = `
    <div class="pickup-card archive-pickup-card reveal">
      <a class="archive-pickup-main" href="${escapeHtml(postHref(picked))}">
        <div class="pickup-label-row">
          <span class="label">pick up</span>
          <span class="pickup-like-note">♥ ${postLikeCount(picked)}</span>
        </div>
        <span class="pickup-reason">${escapeHtml(pickupReason(picked))}</span>
        <span class="card-kicker">${escapeHtml(picked.category)}</span>
        <h3>${escapeHtml(picked.title)}</h3>
        <p>${escapeHtml(picked.excerpt)}</p>
        <div class="pickup-meta">
          <span>${escapeHtml(picked.date)} / ${escapeHtml(picked.author)}</span>
        </div>
      </a>
      <div class="pickup-side-list compact" aria-label="あわせて読みたい稽古記録">
        ${relatedPosts
          .slice(0, 2)
          .map(
            (post) => `
              <a class="pickup-side-link" href="${escapeHtml(postHref(post))}">
                <em>次に読む</em>
                <span>${escapeHtml(post.category)} / ${escapeHtml(post.date)}</span>
                <strong>${escapeHtml(post.title)}</strong>
              </a>
            `,
          )
          .join("")}
      </div>
    </div>
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
  const posts = filteredPosts();
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

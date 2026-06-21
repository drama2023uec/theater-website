const titleEl = document.querySelector("[data-article-title]");
const categoryEl = document.querySelector("[data-article-category]");
const dateEl = document.querySelector("[data-article-date]");
const authorEl = document.querySelector("[data-article-author]");
const excerptEl = document.querySelector("[data-article-excerpt]");
const bodyEl = document.querySelector("[data-article-body]");
const likeButton = document.querySelector("[data-article-like]");
const likeCountEl = document.querySelector("[data-article-likes]");
const relatedSection = document.querySelector("[data-article-related]");
const relatedListEl = document.querySelector("[data-article-related-list]");
let currentPostId = "";

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

function renderError(message) {
  titleEl.textContent = "稽古記録を表示できません";
  dateEl.textContent = "";
  authorEl.textContent = "";
  excerptEl.textContent = message;
  bodyEl.innerHTML = "";
  if (likeButton) likeButton.hidden = true;
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

function renderLikeButton(post) {
  if (!likeButton || !likeCountEl || !post.id) return;
  const liked = hasLiked(post.id);
  likeButton.hidden = false;
  likeButton.disabled = false;
  likeButton.classList.toggle("is-liked", liked);
  const label = liked ? "いいねを取り消す" : "いいね";
  likeButton.setAttribute("aria-label", label);
  likeButton.setAttribute("title", label);
  likeCountEl.textContent = Number(post.likes || 0);
}

function postHref(post) {
  return post.href || (post.id ? `/article.html?id=${encodeURIComponent(post.id)}` : "./journal.html");
}

function relatedCardHtml(post) {
  return `
    <a class="article-related-card" href="${escapeHtml(postHref(post))}">
      <span class="card-kicker">${escapeHtml(post.category || "稽古")}</span>
      <strong>${escapeHtml(post.title || "無題")}</strong>
      <small>${escapeHtml(post.date || "日付未定")} / ${escapeHtml(post.author || "演劇同好会")}</small>
      <em>記事を読む</em>
    </a>
  `;
}

function pickRelatedPosts(posts, currentPost) {
  return posts
    .filter((post) => post.id && post.id !== currentPostId)
    .sort((a, b) => {
      const sameCategoryA = a.category === currentPost.category ? 0 : 1;
      const sameCategoryB = b.category === currentPost.category ? 0 : 1;
      return sameCategoryA - sameCategoryB;
    })
    .slice(0, 2);
}

async function renderRelatedPosts(currentPost) {
  if (!relatedSection || !relatedListEl) return;

  try {
    const response = await fetch("/api/content", { cache: "no-store", headers: { Accept: "application/json" } });
    if (!response.ok) throw new Error(`Content API returned ${response.status}`);
    const data = await response.json();
    const relatedPosts = Array.isArray(data.posts) ? pickRelatedPosts(data.posts, currentPost) : [];

    if (relatedPosts.length === 0) {
      relatedSection.hidden = true;
      relatedListEl.innerHTML = "";
      return;
    }

    relatedListEl.innerHTML = relatedPosts.map(relatedCardHtml).join("");
    relatedSection.hidden = false;
  } catch (error) {
    console.warn("Related posts unavailable.", error);
    relatedSection.hidden = true;
    relatedListEl.innerHTML = "";
  }
}

async function likeArticle() {
  if (!currentPostId) return;
  const nextLiked = !hasLiked(currentPostId);

  likeButton.disabled = true;
  const response = await fetch("/api/like", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ id: currentPostId, liked: nextLiked }),
  });

  if (!response.ok) throw new Error(`Like API returned ${response.status}`);
  const data = await response.json();
  setLiked(currentPostId, Boolean(data.liked));
  renderLikeButton({ id: currentPostId, likes: Number(data.likes || 0) });
}

async function loadArticle() {
  const id = new URLSearchParams(window.location.search).get("id");
  if (!id) {
    renderError("記事IDが指定されていない。稽古記録一覧から開く必要がある。");
    return;
  }
  currentPostId = id;

  try {
    const response = await fetch(`/api/post?id=${encodeURIComponent(id)}`, { cache: "no-store", headers: { Accept: "application/json" } });
    if (!response.ok) throw new Error(`Post API returned ${response.status}`);
    const post = await response.json();

    document.title = `${post.title} | 演劇同好会`;
    titleEl.textContent = post.title;
    categoryEl.textContent = post.category;
    dateEl.textContent = post.date;
    authorEl.textContent = post.author;
    excerptEl.textContent = post.excerpt;
    renderLikeButton({ ...post, id });
    bodyEl.innerHTML =
      Array.isArray(post.blocks) && post.blocks.length > 0
        ? blocksHtml(post.blocks)
        : "<p>Notion本文はまだ空である。記事ページ本文に段落や見出しを追加すると、ここに反映される。</p>";
    renderRelatedPosts({ ...post, id });
  } catch (error) {
    console.warn(error);
    renderError("Notionの記事本文を取得できなかった。");
  }
}

likeButton?.addEventListener("click", async () => {
  try {
    await likeArticle();
  } catch (error) {
    console.warn(error);
    likeButton.disabled = false;
  }
});

loadArticle();

const titleEl = document.querySelector("[data-article-title]");
const categoryEl = document.querySelector("[data-article-category]");
const dateEl = document.querySelector("[data-article-date]");
const authorEl = document.querySelector("[data-article-author]");
const excerptEl = document.querySelector("[data-article-excerpt]");
const bodyEl = document.querySelector("[data-article-body]");
const heroImageEl = document.querySelector("[data-article-hero]");
const heroImageTag = document.querySelector("[data-article-hero-img]");
const likeButton = document.querySelector("[data-article-like]");
const likeCountEl = document.querySelector("[data-article-likes]");
const commentsSectionEl = document.querySelector("[data-article-comments]");
const commentStatusEl = document.querySelector("[data-article-comment-status]");
const commentListEl = document.querySelector("[data-article-comment-list]");
const commentFormEl = document.querySelector("[data-article-comment-form]");
const relatedSection = document.querySelector("[data-article-related]");
const relatedListEl = document.querySelector("[data-article-related-list]");
const articleRegion = document.querySelector("[data-article]");
let currentPostId = "";

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function inlineTextHtml(value) {
  const text = String(value ?? "");
  if (!text) return "<br>";
  return escapeHtml(text).replace(/\r\n?/g, "\n").replaceAll("\n", "<br>");
}

function commentBodyHtml(value) {
  return inlineTextHtml(value);
}

function blockHtml(block) {
  if (block.type === "image") {
    const url = escapeHtml(block.url);
    const caption = escapeHtml(block.caption || "");
    const alt = caption || "稽古記録の画像";

    return `
      <figure class="article-image notion-image">
        <img src="${url}" alt="${alt}" loading="lazy" decoding="async" data-natural-image />
        ${caption ? `<figcaption>${caption}</figcaption>` : ""}
      </figure>
    `;
  }

  const text = inlineTextHtml(block.text);

  if (block.type === "heading_1") return `<h2>${text}</h2>`;
  if (block.type === "heading_2") return `<h2>${text}</h2>`;
  if (block.type === "heading_3") return `<h3>${text}</h3>`;
  if (block.type === "quote") return `<blockquote>${text}</blockquote>`;
  if (block.type === "bulleted_list_item" || block.type === "numbered_list_item") return `<li>${text}</li>`;
  return `<p>${text}</p>`;
}

function blocksHtml(blocks, heroImageUrl = "") {
  const html = [];
  let activeList = "";

  blocks.forEach((block) => {
    if (block.type === "image" && block.url === heroImageUrl) return;

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

function applyNaturalImageSize(image) {
  const width = image.naturalWidth;
  const height = image.naturalHeight;
  if (!width || !height) return;

  image.style.setProperty("--image-natural-width", `${width}px`);
  image.style.setProperty("--image-natural-height", `${height}px`);
  image.setAttribute("width", String(width));
  image.setAttribute("height", String(height));
}

function activateNaturalImages(root = document) {
  root.querySelectorAll("[data-natural-image]").forEach((image) => {
    if (image.complete) {
      applyNaturalImageSize(image);
      return;
    }

    image.addEventListener("load", () => applyNaturalImageSize(image), { once: true });
  });
}

function renderArticleHero(post) {
  if (!heroImageEl || !heroImageTag) return;

  if (!post.imageUrl) {
    heroImageEl.hidden = true;
    heroImageTag.removeAttribute("src");
    heroImageTag.alt = "";
    return;
  }

  heroImageTag.src = post.imageUrl;
  heroImageTag.alt = `${post.title || "稽古記録"}のヘッダー画像`;
  heroImageEl.hidden = false;
}

function renderError(message) {
  articleRegion?.setAttribute("aria-busy", "false");
  renderArticleHero({});
  titleEl.textContent = "稽古記録を表示できません";
  dateEl.textContent = "";
  authorEl.textContent = "";
  excerptEl.textContent = message;
  bodyEl.innerHTML = "";
  if (likeButton) likeButton.hidden = true;
  if (commentsSectionEl) commentsSectionEl.hidden = true;
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

function formatCommentDate(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, "0")}.${String(date.getDate()).padStart(2, "0")} ${String(
    date.getHours(),
  ).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
}

function commentHtml(comment) {
  const author = escapeHtml(comment.author || "匿名");
  const date = formatCommentDate(comment.createdAt);
  return `
    <article class="article-comment">
      <div class="article-comment-meta">
        <strong>${author}</strong>
        ${date ? `<time datetime="${escapeHtml(comment.createdAt)}">${escapeHtml(date)}</time>` : ""}
      </div>
      <p>${commentBodyHtml(comment.body || "")}</p>
    </article>
  `;
}

function setCommentFormEnabled(enabled) {
  if (!commentFormEl) return;
  [...commentFormEl.elements].forEach((element) => {
    element.disabled = !enabled;
  });
}

function renderComments(comments) {
  if (!commentListEl || !commentStatusEl) return;
  const visibleComments = Array.isArray(comments) ? comments : [];
  commentListEl.innerHTML = visibleComments.map(commentHtml).join("");
  commentStatusEl.textContent = visibleComments.length ? `${visibleComments.length}件のコメント` : "まだコメントはありません";
}

async function loadComments(postId) {
  if (!commentsSectionEl || !commentListEl || !commentStatusEl || !commentFormEl) return;
  commentsSectionEl.hidden = false;
  commentStatusEl.textContent = "コメントを確認中";
  commentListEl.innerHTML = "";
  setCommentFormEnabled(false);

  try {
    const response = await fetch(`/api/comments?id=${encodeURIComponent(postId)}`, { cache: "no-store", headers: { Accept: "application/json" } });
    if (!response.ok) throw new Error(`Comments API returned ${response.status}`);
    const data = await response.json();

    if (data.configured === false) {
      commentStatusEl.textContent = "コメント機能を準備中です";
      setCommentFormEnabled(false);
      return;
    }

    renderComments(data.comments || []);
    setCommentFormEnabled(true);
  } catch (error) {
    console.warn("Comments unavailable.", error);
    commentStatusEl.textContent = "コメントを現在表示できません";
    setCommentFormEnabled(false);
  }
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
  articleRegion?.setAttribute("aria-busy", "true");
  bodyEl.innerHTML = `
    <div class="loading-note" role="status" aria-live="polite">
      <span class="loading-dot" aria-hidden="true"></span>
      <strong>記事本文を確認中</strong>
      <p>本文、いいね数、関連記事を順に取得しています。</p>
    </div>
  `;

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
    renderArticleHero(post);
    renderLikeButton({ ...post, id });
    articleRegion?.setAttribute("aria-busy", "false");
    bodyEl.innerHTML =
      Array.isArray(post.blocks) && post.blocks.length > 0
        ? blocksHtml(post.blocks, post.imageUrl)
        : "<p>本文はまだ公開されていません。</p>";
    activateNaturalImages(bodyEl);
    loadComments(id);
    renderRelatedPosts({ ...post, id });
  } catch (error) {
    console.warn(error);
    renderError("稽古記録を現在表示できません。しばらくしてからもう一度お試しください。");
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

commentFormEl?.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!currentPostId || !commentStatusEl) return;

  const formData = new FormData(commentFormEl);
  const payload = {
    id: currentPostId,
    author: String(formData.get("author") || ""),
    body: String(formData.get("body") || ""),
    website: String(formData.get("website") || ""),
  };

  if (!payload.body.trim()) {
    commentStatusEl.textContent = "コメントを入力してください";
    return;
  }

  setCommentFormEnabled(false);
  commentStatusEl.textContent = "送信中";

  try {
    const response = await fetch("/api/comments", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) throw new Error(`Comments API returned ${response.status}`);
    const data = await response.json();
    if (data.ignored) {
      commentFormEl.reset();
      await loadComments(currentPostId);
      return;
    }

    if (data.comment) {
      const currentComments = [...(commentListEl?.querySelectorAll(".article-comment") || [])];
      commentListEl?.insertAdjacentHTML("beforeend", commentHtml(data.comment));
      commentStatusEl.textContent = `${currentComments.length + 1}件のコメント`;
      commentFormEl.reset();
    } else {
      await loadComments(currentPostId);
    }
  } catch (error) {
    console.warn("Comment submit failed.", error);
    commentStatusEl.textContent = "コメントを送信できません";
  } finally {
    setCommentFormEnabled(true);
  }
});

loadArticle();

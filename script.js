const shows = [
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

const posts = [
  {
    title: "立ち稽古初日、椅子の位置だけで空気が変わった",
    date: "2026.06.12",
    category: "稽古",
    author: "演出班",
    excerpt: "台詞より先に、距離と視線を決める。舞台上の椅子を15cm動かすだけで関係性が変わる。",
  },
  {
    title: "照明プランをNotionで共有する運用に変えた",
    date: "2026.06.08",
    category: "制作",
    author: "照明班",
    excerpt: "色番号、吊り位置、キューの意図を表で残す。次の担当者が読める粒度を基準にする。",
  },
  {
    title: "夏季試演会のフライヤーを公開",
    date: "2026.06.01",
    category: "告知",
    author: "広報班",
    excerpt: "予約不要、入退場自由。短編3本の試演会として、初参加の部員も舞台に立つ。",
  },
  {
    title: "音響の入りを1拍遅らせる判断",
    date: "2026.05.28",
    category: "稽古",
    author: "音響班",
    excerpt: "効果音は説明ではなく、沈黙を切るために使う。今回の場面では1拍待つ方が強い。",
  },
  {
    title: "衣装管理をサイズ表から始める",
    date: "2026.05.22",
    category: "制作",
    author: "衣装班",
    excerpt: "私物と備品を混ぜない。写真、サイズ、返却状態をNotionで一元管理する。",
  },
  {
    title: "新入部員向け見学日を追加",
    date: "2026.05.15",
    category: "告知",
    author: "代表",
    excerpt: "水曜と金曜の通常稽古に加えて、土曜午後に制作見学枠を設ける。",
  },
];

const showRoot = document.querySelector("[data-shows]");
const postRoot = document.querySelector("[data-posts]");
const filterButtons = document.querySelectorAll("[data-filter]");
const header = document.querySelector("[data-header]");
const spotlight = document.querySelector(".hero-spotlight");

function renderShows() {
  showRoot.innerHTML = shows
    .map(
      (show) => `
        <article class="show-card reveal">
          <div>
            <div class="show-date">${show.date}<span>2026</span></div>
            <h3>${show.title}</h3>
            <p>${show.body}</p>
          </div>
          <div class="card-footer">
            <span>${show.venue}</span>
            <span class="card-kicker">${show.status}</span>
          </div>
        </article>
      `
    )
    .join("");
}

function renderPosts(category = "all") {
  const visiblePosts = category === "all" ? posts : posts.filter((post) => post.category === category);
  postRoot.innerHTML = visiblePosts
    .map(
      (post) => `
        <article class="post-card reveal">
          <div>
            <span class="card-kicker">${post.category}</span>
            <h3>${post.title}</h3>
            <p>${post.excerpt}</p>
          </div>
          <div class="card-footer">
            <span>${post.date}</span>
            <span>${post.author}</span>
          </div>
        </article>
      `
    )
    .join("");
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

window.addEventListener("scroll", () => {
  header.classList.toggle("is-solid", window.scrollY > 80);
});

window.addEventListener("pointermove", (event) => {
  if (!spotlight) return;
  spotlight.style.setProperty("--x", `${event.clientX}px`);
  spotlight.style.setProperty("--y", `${event.clientY}px`);
});

renderShows();
renderPosts();
observeReveals();

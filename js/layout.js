/* =====================================================================
 * layout.js — 注入共用的頁首導覽列與頁尾，各頁面就不用重複貼一次。
 * 用法：頁面最上方放 <div id="app"></div>，並在頁面標記 body 的 data-page。
 * ===================================================================== */

const NAV = [
  { href: "index.html",    label: "首頁 / 公告", key: "home" },
  { href: "register.html", label: "線上報名",   key: "register" },
  { href: "board.html",    label: "即時成績公布", key: "board" },
  { href: "query.html",    label: "成績查詢",   key: "query" },
  { href: "ranking.html",  label: "班級積分",   key: "ranking" },
  { href: "score.html",    label: "成績輸入",   key: "score" },
  { href: "program.html",  label: "秩序冊產生", key: "program" },
  { href: "admin.html",    label: "管理",       key: "admin" },
];

function renderHeader() {
  const page = document.body.dataset.page || "";
  const links = NAV.map(function (n) {
    return `<a href="${n.href}" class="${n.key === page ? "active" : ""}">${n.label}</a>`;
  }).join("");

  const header = document.createElement("header");
  header.className = "site-header";
  header.innerHTML = `
    <div class="banner" role="img" aria-label="${CONFIG.schoolName}運動會橫幅">
      <div class="banner-text">
        <h1>${CONFIG.schoolName}</h1>
        <p>${CONFIG.eventTitle}</p>
      </div>
    </div>
    <nav class="site-nav">
      <button class="nav-toggle" aria-label="選單">☰</button>
      <div class="nav-links">${links}</div>
    </nav>`;
  document.body.insertBefore(header, document.body.firstChild);

  const toggle = header.querySelector(".nav-toggle");
  toggle.addEventListener("click", function () {
    header.querySelector(".nav-links").classList.toggle("open");
  });
}

function renderFooter() {
  const f = document.createElement("footer");
  f.className = "site-footer";
  f.innerHTML = `${CONFIG.schoolName}　${CONFIG.eventTitle}　·　體育組製作`;
  document.body.appendChild(f);
}

document.addEventListener("DOMContentLoaded", function () {
  renderHeader();
  renderFooter();
  if (!apiReady()) {
    const b = document.createElement("div");
    b.className = "api-warning";
    b.innerHTML = "⚠ 尚未連線後端。請依 README 部署 Google Apps Script，並把網址填入 <code>js/config.js</code> 的 <code>API_URL</code>。";
    const main = document.querySelector("main") || document.body;
    main.insertBefore(b, main.firstChild);
  }
});

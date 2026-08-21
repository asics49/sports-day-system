/* =====================================================================
 * api.js — 與後端 (Google Apps Script) 溝通的共用函式
 * 重點：POST 一律用 text/plain 送出，避免觸發 CORS 預檢而失敗。
 * ===================================================================== */

function apiReady() {
  return CONFIG.API_URL && CONFIG.API_URL.indexOf("PASTE_YOUR") < 0;
}

async function apiGet(action, params) {
  if (!apiReady()) throw new Error("尚未連線後端：請先在 js/config.js 填入 API_URL。");
  const url = new URL(CONFIG.API_URL);
  url.searchParams.set("action", action);
  Object.keys(params || {}).forEach(function (k) {
    if (params[k] !== undefined && params[k] !== null && params[k] !== "")
      url.searchParams.set(k, params[k]);
  });
  const res = await fetch(url.toString(), { method: "GET" });
  const data = await res.json();
  if (data.ok === false) throw new Error(data.error || "查詢失敗");
  return data;
}

async function apiPost(action, body) {
  if (!apiReady()) throw new Error("尚未連線後端：請先在 js/config.js 填入 API_URL。");
  const payload = Object.assign({ action: action }, body || {});
  const res = await fetch(CONFIG.API_URL, {
    method: "POST",
    // 不設 application/json，用 text/plain 屬於「簡單請求」，不會被瀏覽器擋
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (data.ok === false) throw new Error(data.error || "送出失敗");
  return data;
}

/* ---- 小工具 ---- */
function el(id) { return document.getElementById(id); }

function toast(msg, type) {
  let box = el("toast");
  if (!box) {
    box = document.createElement("div");
    box.id = "toast";
    document.body.appendChild(box);
  }
  box.textContent = msg;
  box.className = "toast show " + (type || "");
  clearTimeout(window.__t);
  window.__t = setTimeout(function () { box.className = "toast"; }, 3800);
}

function setBusy(node, busy, text) {
  if (!node) return;
  node.disabled = busy;
  if (busy) { node.dataset.old = node.textContent; node.textContent = text || "處理中…"; }
  else if (node.dataset.old) node.textContent = node.dataset.old;
}

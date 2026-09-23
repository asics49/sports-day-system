/* =====================================================================
 * api.js — 與後端 (Google Apps Script) 溝通的共用函式
 * 重點：POST 一律用 text/plain 送出，避免觸發 CORS 預檢而失敗。
 * ===================================================================== */

function apiReady() {
  return CONFIG.API_URL && CONFIG.API_URL.indexOf("PASTE_YOUR") < 0;
}

// 把 fetch 回應轉成 JSON；若回來的不是 JSON（常見於學校網路擋 script.google.com、
// 或連線被防火牆/代理攔截成一頁 HTML），丟出看得懂的錯誤而不是原始的 JS parse error。
async function parseApiResponse(res) {
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch (e) {
    const hint = /^\s*<!DOCTYPE|^\s*<html/i.test(text)
      ? "（伺服器回傳的是網頁而不是資料，通常代表目前的網路連不到 Google 服務——換一個網路〔例如手機熱點〕再試看看，或確認學校網路沒有擋 script.google.com。）"
      : "";
    throw new Error("伺服器回應異常，無法解析（HTTP " + res.status + "）" + hint);
  }
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
  const data = await parseApiResponse(res);
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
  const data = await parseApiResponse(res);
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

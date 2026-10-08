/* =====================================================================
 * api.js — 與後端 (Google Apps Script) 溝通的共用函式
 * 重點：POST 一律用 text/plain 送出，避免觸發 CORS 預檢而失敗。
 * ===================================================================== */

function apiReady() {
  return CONFIG.API_URL && CONFIG.API_URL.indexOf("PASTE_YOUR") < 0;
}

// Apps Script 的回應要經過第二段轉址（script.googleusercontent.com/macros/echo）才拿得到，
// 實測約 1/10 會在這一段拿到 404「找不到網頁／無法開啟這個檔案」的 HTML——後端其實已經執行完，只是結果遺失。
// 這種情況丟 ApiLostResponse，讓呼叫端知道「動作可能已經完成」。
class ApiLostResponse extends Error {}

async function parseApiResponse(res) {
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch (e) {
    throw new ApiLostResponse("Google 伺服器這次沒有把結果傳回來（HTTP " + res.status + "，常見的暫時性問題）。");
  }
}

// 重送也不會造成重複或錯誤的動作，遇到結果遺失可以自動再送一次
const RETRY_SAFE_POST = ["login", "googlelogin", "submitscore", "deletescore", "deleteregbatch", "importreg"];

async function withRetry(fn, times) {
  for (let i = 0; ; i++) {
    try { return await fn(); }
    catch (e) {
      if (!(e instanceof ApiLostResponse) && !(e instanceof TypeError)) throw e; // TypeError＝網路層 fetch 失敗
      if (i >= times) {
        if (e instanceof TypeError) throw new ApiLostResponse("連不到伺服器（" + e.message + "），請確認網路後再試。");
        throw e;
      }
      await new Promise(r => setTimeout(r, 800 * (i + 1)));
    }
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
  // 讀取一律可以重試
  const data = await withRetry(async () => parseApiResponse(await fetch(url.toString(), { method: "GET" })), 2);
  if (data.ok === false) throw new Error(data.error || "查詢失敗");
  return data;
}

async function apiPost(action, body) {
  if (!apiReady()) throw new Error("尚未連線後端：請先在 js/config.js 填入 API_URL。");
  const payload = Object.assign({ action: action }, body || {});
  const send = async () => parseApiResponse(await fetch(CONFIG.API_URL, {
    method: "POST",
    // 不設 application/json，用 text/plain 屬於「簡單請求」，不會被瀏覽器擋
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify(payload),
  }));
  // Google 偶爾會把 POST 的內容弄丟、改跑 doGet，回 {ok:true, msg:"API 正常運作…"}——動作其實沒做，
  // 但 ok:true 會被當成成功。這種回應一律視為「結果遺失」。
  const sendChecked = async () => {
    const d = await send();
    if (d && (d.noop || /請帶 action 參數/.test(d.msg || ""))) throw new ApiLostResponse("Google 伺服器這次沒有收到送出的內容（常見的暫時性問題）。");
    return d;
  };
  // 新增公告/賽程/帳號這類動作重送會產生重複資料，不自動重試，交給呼叫端提示使用者確認
  const data = RETRY_SAFE_POST.indexOf(String(action).toLowerCase()) >= 0 ? await withRetry(sendChecked, 2) : await sendChecked();
  if (data.ok === false) throw new Error(data.error || "送出失敗");
  return data;
}

/* ---- 小工具 ---- */
function el(id) { return document.getElementById(id); }

// 登入回應的 perms 由後端依「授權」分頁算好（admin 一律全部）；後端寫入 API 也會再檢查一次
function hasPerm(auth, p) {
  return !!auth && (auth.role === "admin" || (auth.perms || []).indexOf(p) >= 0);
}
// 這個功能上線前登入的瀏覽器，存的 AUTH 沒有 perms（也可能沒有 grade），要求重登一次
function isStaleAuth(auth) {
  return !!(auth && auth.token && (!("perms" in auth) || !("grade" in auth)));
}

// 先整段跳脫再把網址換成超連結，所以內容裡的 HTML 不會被執行。
// 網址只比對 ASCII 字元，「請看https://x.com報名」這種黏著中文的寫法也能正確切開。
function linkify(s) {
  const t = String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
    return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
  });
  return t.replace(/(?:https?:\/\/|www\.)[A-Za-z0-9\-._~:/?#\[\]@!$&()*+,;=%]+/g, function (m) {
    let url = m, tail = "";
    while (/[.,!?)\]]$/.test(url)) { tail = url.slice(-1) + tail; url = url.slice(0, -1); }
    const href = /^www\./.test(url) ? "https://" + url : url;
    return '<a href="' + href + '" target="_blank" rel="noopener noreferrer">' + url + "</a>" + tail;
  });
}

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

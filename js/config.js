/* =====================================================================
 * 全站設定檔  config.js
 * 只要改這裡就能調整基本參數，不需要動其他程式。
 * ===================================================================== */

const CONFIG = {
  // ---- 學校 / 活動名稱（顯示在標題）----
  schoolName: "高雄市楠梓區右昌國民小學",
  eventTitle: "115 學年度校慶運動會",   // ← 每年改這一行
  year: "115",

  // ---- 後端 API 網址 ----
  // 部署 Google Apps Script（Web App）後，把「網頁應用程式」網址貼到這裡。
  // 教學見 README.md。尚未部署前，網站會顯示「尚未連線後端」提示。
  API_URL: "https://script.google.com/macros/s/AKfycbwUFUKVbU2eZus-0UEhSC9KRTi9AQApBsa39dYsMBlB-luSxNYMRQeAfssizDo17Rkrjw/exec",

  // ---- Google 一鍵登入（成績輸入頁用）----
  // 到 Google Cloud Console 建立 OAuth 用戶端 ID（類型：網頁應用程式），
  // 把「用戶端 ID」貼在這裡（形如 xxxxx.apps.googleusercontent.com）。步驟見 README.md。
  // 留空字串則成績輸入頁只顯示「管理者帳密登入」。
  GOOGLE_CLIENT_ID: "",

  // ---- 報名規則 ----
  maxIndividual: 2,          // 個人單項每人限報項數（大隊接力、趣味競賽不算）

  // ---- 積分規則（第 1 名到第 N 名的分數）----
  // 依右昌慣例：1→7, 2→5, 3→4, 4→3, 5→2, 6→1
  scoreTable: [7, 5, 4, 3, 2, 1],
};

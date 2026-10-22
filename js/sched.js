/* =====================================================================
 * sched.js — 賽程（賽事行事曆）共用：項目分類、排序、下一場倒數卡
 * 首頁、賽事行事曆頁、秩序冊（admin.html）共用；需先載入 api.js（scheduleGrades、esc 由各頁提供）。
 * ===================================================================== */
const SCHED_WD = ["日", "一", "二", "三", "四", "五", "六"];
const SCHED_TYPES = {
  run: { ico: "🏃", name: "短跑" }, jump: { ico: "🤸", name: "跳躍" }, throw: { ico: "⚾", name: "擲遠" },
  relay: { ico: "🏁", name: "接力" }, team: { ico: "🎉", name: "全員競賽" }, other: { ico: "📌", name: "其他" },
};
// 依項目名稱分類（決定顏色與圖示）
function schedTypeOf(name) {
  name = String(name || "");
  if (/接力/.test(name)) return "relay";
  if (/跳/.test(name)) return "jump";
  if (/擲|壘球|鉛球/.test(name)) return "throw";
  if (/全員|趣味|團體|拔河/.test(name)) return "team";
  if (/\d+\s*(m|公尺)|賽跑|短跑/.test(name)) return "run";
  return "other";
}
function schedDayKey(d) { return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0"); }
function schedStartMin(t) { const m = String(t || "").match(/(\d{1,2})[:：](\d{2})/); return m ? Number(m[1]) * 60 + Number(m[2]) : 9999; }
function schedGradeLabel(r) { if (r["年級"]) return r["年級"]; const g = scheduleGrades(r); return g ? g.join("、") + "年級" : "全校"; }
function schedMD(d) { return (d.getMonth() + 1) + "/" + d.getDate(); }
// API 回來的賽程 → 加上 _d(日期) _k(yyyy-mm-dd) _t(類型) _g(適用年級) 並依日期、開始時間排序
function prepSchedule(list) {
  return (list || []).map(r => {
    const d = new Date(r["日期"]);
    return Object.assign({}, r, { _d: d, _k: isNaN(d) ? "" : schedDayKey(d), _t: schedTypeOf(r["項目"]), _g: scheduleGrades(r) });
  }).filter(r => r._k).sort((a, b) => a._k.localeCompare(b._k) || schedStartMin(a["時間"]) - schedStartMin(b["時間"]));
}
function schedForGrade(list, grade) { const g = Number(grade) || 0; return list.filter(r => !g || !r._g || r._g.indexOf(g) >= 0); }
function schedToday() { return schedDayKey(new Date()); }
function schedNext(list) { const t = schedToday(); return list.find(r => r._k >= t) || null; }

// 下一場比賽倒數卡（樣式 .next-card 在 style.css）。opts: {gradeText, link}
function nextCardHtml(list, opts) {
  opts = opts || {};
  const e = s => String(s == null ? "" : s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  if (!list.length) return "";
  const nx = schedNext(list);
  const link = opts.link ? `<a class="nx-link" href="${e(opts.link)}">看完整賽事行事曆 →</a>` : "";
  if (!nx) return `<div class="next-card"><div class="lbl">賽程進度</div><div class="row1"><div class="nx-ev">🎉 所有賽程都已結束，謝謝大家！</div></div>${link}</div>`;
  const days = Math.round((new Date(nx._k) - new Date(schedToday())) / 86400000);
  const same = list.filter(r => r._k === nx._k && r !== nx);
  return `<div class="next-card">
    <div class="lbl">${opts.gradeText ? e(opts.gradeText) + "的" : ""}下一場比賽</div>
    <div class="row1"><div class="days">${days === 0 ? "今天" : days + "<small>天後</small>"}</div>
      <div class="nx-ev">${SCHED_TYPES[nx._t].ico} ${e(nx["項目"])}</div></div>
    <div class="meta"><span>📅 ${schedMD(nx._d)}（${SCHED_WD[nx._d.getDay()]}）</span>${nx["時間"] ? `<span>🕗 ${e(nx["時間"])}</span>` : ""}
      ${nx["地點"] ? `<span>📍 ${e(nx["地點"])}</span>` : ""}<span>👥 ${e(schedGradeLabel(nx))}</span>
      ${same.length ? `<span>同一天還有：${same.map(r => e(r["項目"])).join("、")}</span>` : ""}</div>${link}</div>`;
}

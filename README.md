# 右昌國小運動會系統

GitHub Pages（前端）＋ Google 試算表（資料庫）＋ Google Apps Script（後端 API）打造的運動會系統，
包含 **線上報名、成績輸入、成績查詢、班級積分排行**。全部免費、沿用學校 Google 帳號。

```
瀏覽器 ──► GitHub Pages（HTML/JS）──► Apps Script Web App ──► Google 試算表
```

---

## 檔案結構

```
sports-day-system/
├─ index.html          首頁 / 公告
├─ register.html       線上報名（個人單項限報 2 項，超過會警告擋下）
├─ query.html          成績查詢
├─ ranking.html        班級積分排行
├─ score.html          成績輸入（需登入）
├─ css/style.css
├─ js/
│   ├─ config.js       ★ 你要改的設定（學校名、活動名、API 網址、規則）
│   ├─ api.js          與後端溝通
│   └─ layout.js       共用頁首/頁尾
├─ assets/banner.jpg   橫幅（由體育班送印版 PNG 產生）
└─ apps-script/Code.gs  ★ 後端程式（貼到 Apps Script）
```

---

## 建置步驟

### 第 1 步：建立後端（Google 試算表 + Apps Script）

1. 用學校帳號到 <https://drive.google.com>，新增一個 **Google 試算表**，命名如「115運動會資料」。
2. 上方選單 **擴充功能 → Apps Script**。
3. 把 `apps-script/Code.gs` 的內容**全部貼上**，覆蓋原本的 `myFunction`，存檔。
4. 把程式最上方的 `SECRET` 改成你自己的一串亂碼（登入用，別外流）。
5. 在 Apps Script 上方函式選單選 **`setup`** → 按 **執行**（第一次會要求授權，選你的帳號、允許）。
   - 回到試算表，會看到自動建立好的分頁：**項目、報名、成績、授權、公告**，並附範例資料。
6. 回 Apps Script，右上 **部署 → 新增部署作業**：
   - 類型：**網頁應用程式**
   - 執行身分：**我自己**
   - 誰可以存取：**任何人**
   - 按「部署」，複製最後出現的 **網頁應用程式網址**（形如 `https://script.google.com/macros/s/XXXX/exec`）。

> 之後若修改 `Code.gs`，要 **部署 → 管理部署作業 → 編輯（鉛筆）→ 版本選「新版本」→ 部署**，網址不變。

### 第 2 步：設定前端

打開 `js/config.js`，把剛剛複製的網址貼到 `API_URL`，並改學校/活動名稱：

```js
API_URL: "https://script.google.com/macros/s/XXXX/exec",
eventTitle: "115 學年度校慶運動會",
```

### 第 3 步：發佈到 GitHub Pages

1. 到 <https://github.com> 建一個新的 repository（例如 `sports-day`），設為 Public。
2. 把本資料夾所有檔案上傳（可用網頁拖曳，或 Git 指令）。
3. repo 的 **Settings → Pages → Build and deployment**：Source 選 **Deploy from a branch**，Branch 選 `main` / `/(root)`，儲存。
4. 等一兩分鐘，網址會是 `https://你的帳號.github.io/sports-day/`。

完成！打開網址即可使用。

---

## 日常操作

| 你想做的事 | 怎麼做 |
|-----------|--------|
| 新增/修改比賽項目 | 直接在試算表 **項目** 分頁編輯（欄位：代碼、名稱、類別、組別、性別、每班名額、計入限報、啟用）|
| 發公告 | 在 **公告** 分頁加一列（置頂填「是」）|
| 新增可輸入成績的老師 | 在 **授權** 分頁加一列：Email、姓名、密碼、角色（`teacher` 或 `admin`）、啟用填「是」|
| 看／匯出報名或成績 | 直接看試算表 **報名 / 成績** 分頁，可另存 Excel |

### 項目分頁的重點欄位
- **類別**：`個人單項` / `大隊接力` / `趣味競賽`
- **計入限報**：`是` 的項目才算進「每人限 2 項」。大隊接力、趣味競賽請填 `否`。
- **性別**：`男` / `女` / `混合`（報名時會依學生性別過濾）
- **組別**：例如 `4年級`、`5年級`、`6年級`、`全校`

### 積分規則
第 1～6 名分別 **7 / 5 / 4 / 3 / 2 / 1** 分。要改就改 `Code.gs` 的 `SCORE_TABLE` 與 `js/config.js` 的 `scoreTable`（兩邊要一致）。

---

## 登入與帳號

成績輸入頁提供兩種登入：

1. **Google 一鍵登入（老師用，推薦）** — 點「使用 Google 帳號登入」，用學校 Google 帳號即可，免記密碼。
   前提：該帳號的 Email 已被加進試算表「授權」分頁（啟用＝是）。
2. **管理者帳號 / 密碼（備援）** — 點登入框下方「改用管理者帳號 / 密碼登入」。
   - 預設管理者：`admin@youchang` / `admin1234`　→ **請務必到「授權」分頁改掉密碼**。

不論哪種方式，成績都會記下「輸入者」的 Email。

### 設定 Google 一鍵登入（做一次）

要讓「使用 Google 帳號登入」按鈕運作，需在 Google Cloud 建立一組 OAuth 用戶端 ID：

1. 到 <https://console.cloud.google.com/>（用學校帳號），建立或選一個專案。
2. 左側 **API 和服務 → OAuth 同意畫面**：使用者類型選「內部」（校內帳號）或「外部」，填應用程式名稱、支援信箱，儲存。
3. 左側 **API 和服務 → 憑證 → 建立憑證 → OAuth 用戶端 ID**：
   - 應用程式類型：**網頁應用程式**
   - **已授權的 JavaScript 來源** 加入你的網址：
     - `https://你的帳號.github.io`（GitHub Pages 網址，注意只到網域，不含路徑）
     - 若要本機測試，另加 `http://localhost:8765`、`http://127.0.0.1:8765`
   - 建立後複製「**用戶端 ID**」（形如 `xxxxx.apps.googleusercontent.com`）。
4. 把用戶端 ID 貼到 **兩個地方**（要一致）：
   - 前端 `js/config.js` 的 `GOOGLE_CLIENT_ID`
   - 後端 `Code.gs` 的 `GOOGLE_CLIENT_ID`（改完記得「新版本」重新部署）
5. （選填）`Code.gs` 的 `ALLOW_DOMAIN` 若填 `yocps.kh.edu.tw`，該網域帳號免加名單即可登入為老師；留空則只有「授權」分頁的帳號能登入（較安全）。

> 安全性：後端會向 Google 驗證登入權杖並比對用戶端 ID，再檢查是否在授權名單，才發給操作權杖（12 小時有效）。

---

## 常見問題

- **網站顯示「尚未連線後端」** → `js/config.js` 的 `API_URL` 還沒填，或填錯。
- **報名/查詢按了沒反應、跳錯誤** → 多半是 Apps Script 沒用「新版本」重新部署，或存取權沒設成「任何人」。
- **改了 Code.gs 沒生效** → 一定要「管理部署作業 → 新版本 → 部署」。
- **想換橫幅** → 換掉 `assets/banner.jpg`（維持約 2000×600 的寬圖最好看）。

---

_體育組製作。前端純 HTML/JS，無需編譯，好維護、好交接。_

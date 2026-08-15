# AI-Ready 任務卡

## Metadata

- 任務：修正本機開發 Vite Proxy 導致 origin-guard 失效
- 上層規格：ai/artifacts/品牌識別與上線發布/feature-spec.md
- 上層 Epic：品牌識別與上線發布
- 上層 User Story：（無獨立故事，屬 TASK-030 origin-guard 的修補）
- 分軌：後端
- 前置任務（dependsOn）：TASK-030
- 狀態：完成
- 風險等級：低
- Agent owner：Claude Code
- 人工核准者：zoewang7512（已於對話中核准，2026-08-15）

## 目標

修正本機開發環境（`npm run dev`）下 `/api/dream-image` 一律回傳 403 的問題。

## 情境包（Context Pack）

- 相關檔案：
  - vite.config.ts
- 既有模式：
  - `server/lib/origin-guard.ts`（TASK-030）比對 `Referer` 的 host 與請求本身的 `Host` header。
- 假設：
  - 無
- 未知事項：
  - 無
- 允許變更的檔案：
  - vite.config.ts
- 不得觸碰：
  - 依 AGENTS.md 一般規則：不得變更不相關檔案

## 需求

- 本機用 `npm run dev` 開發時，`/api/dream-image` 的圖片請求需能通過 origin-guard 正常載入，不因為 Vite proxy 而被誤擋。

## 驗收標準

- 本機開發環境下，完成日記後的 AI 生成插圖能正常載入顯示。

## 實作備註

- 撰寫 README 展示截圖時意外發現：本機 `npm run dev` 下 `/api/dream-image` 一律回傳 403。追查後發現 `vite.config.ts` 的 proxy 設定用簡寫字串形式（`"/api": "http://localhost:3001"`），這個形式底層對 Host header 的處理跟預期不同，導致轉發到後端的請求 `Host` header 被換成 `localhost:3001`（後端自己的位址），跟瀏覽器送出的 `Referer`（`localhost:5173`）對不上，origin-guard（TASK-030）因此一律判定為跨網域來源而擋下。
- TASK-030 當時的本機測試之所以沒抓到這個問題，合理推測是因為瀏覽器對圖片請求有 `Cache-Control: immutable` 的長效快取，第一次測試剛好用了已快取過的 URL，之後就一直吃快取沒有真的打到後端；這次是因為用了全新的 prompt/seed 組合（從未快取過）才第一次真正觸發網路請求，暴露這個問題。
- 修法：把 proxy 設定改成物件形式並明確加上 `changeOrigin: false`，實測確認 Host header 正確保留為 `localhost:5173`，origin-guard 判斷恢復正常。

## 驗證契約

- 單元測試：無（純本機開發環境設定，非可單元測試的程式邏輯；`origin-guard.test.ts` 既有的單元測試本身沒有問題，這次的 bug 只發生在「透過 Vite proxy 轉發」這一層，單元測試不會經過 proxy）
- 整合測試：無
- E2E 測試：手動驗證（見下方完成證據）
- 型別檢查：tsc --noEmit
- Lint：專案 lint 指令
- Build：vite build 成功
- 螢幕截圖：無（設定檔修正，非畫面異動）
- 安全性檢查：確認修法沒有放寬 origin-guard 本身的判斷邏輯，只是修正本機開發環境下 Host header 被 proxy 竄改的問題；正式環境（Vercel，前後端同源部署，無 proxy）不受影響

## 完成證據

- 變更的檔案：
  - `vite.config.ts`（`/api` proxy 設定從簡寫字串改成物件形式，明確加上 `changeOrigin: false`）
- 決策摘要：
  - 只改 proxy 設定，不改 `origin-guard.ts` 本身的比對邏輯：問題根源是本機開發環境的 Host header 在經過 Vite proxy 轉發時被竄改，不是 origin-guard 的比對邏輯有錯；正式環境（Vercel）前後端同源、沒有這層 proxy，本來就不受影響，這點已用 `curl` 直接對比「透過 proxy」與「直接打後端」兩種情境的 Host header 差異確認。
- 執行過的指令：
  - `npx tsc --noEmit` → 通過。
  - `npx vitest run` → 通過（45 個測試檔案、260 個測試）。
  - `curl "http://localhost:5173/api/dream-image?...&seed=..." -H "Referer: http://localhost:5173/journal"` → 修正前 403、修正後 200。
- 測試輸出：`Test Files  45 passed (45)` / `Tests  260 passed (260)`。
- 螢幕截圖：不適用（設定檔修正）。改用 `curl` 直接驗證 HTTP 狀態碼從 403 變成 200；並在真實瀏覽器上完成一次日記，確認插圖正常載入顯示（用於 README 展示截圖）。
- 已知限制：無。
- 後續任務：無。
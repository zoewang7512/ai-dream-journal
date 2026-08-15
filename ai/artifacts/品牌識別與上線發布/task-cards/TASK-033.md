# AI-Ready 任務卡

## Metadata

- 任務：推上 GitHub 並部署到 Vercel
- 上層規格：ai/artifacts/品牌識別與上線發布/feature-spec.md
- 上層 Epic：品牌識別與上線發布
- 上層 User Story：推上 GitHub 並部署到 Vercel
- 分軌：不適用
- 前置任務（dependsOn）：無
- 狀態：完成
- 風險等級：中（會建立公開可見的 GitHub repo 與正式對外網站，且需要人工在 Vercel 後台輸入金鑰）
- Agent owner：Claude Code
- 人工核准者：zoewang7512（已於對話中明確授權建立新的 public repo 並 push；並於 Vercel 後台完成環境變數設定與部署）

## 目標

把專案推上一個新的 public GitHub repo，並部署到 Vercel，取得可分享的正式網址。

## 情境包（Context Pack）

- 相關檔案：
  - 無程式碼異動（純 git/部署操作），可能需要讀取 .env.example 確認需要哪些環境變數
- 既有模式：
  - repo 已有 `vercel.json`（buildCommand/outputDirectory/rewrites），代表當初就是為 Vercel 部署設計的。
  - `.env.example` 列出正式環境需要的變數：`GEMINI_API_KEY`、`POLLINATIONS_API_KEY`、`PORT`（PORT 部署到 Vercel serverless 不需要，由平台決定）。
- 假設：
  - 使用者已明確授權：建立新的 **public** GitHub repo 並 push（見對話紀錄）。
  - Vercel 帳號本身、正式環境變數輸入，是使用者本人在 Vercel 後台操作的部分，不由 Claude Code 代為執行——依安全規則，不得經手/代填任何 API 金鑰、密碼、帳號密鑰到任何欄位。
- 未知事項：
  - Vercel 帳號是否已存在、是否已連結 GitHub，需要人工確認。
- 允許變更的檔案：
  - 不涉及程式碼修改；僅執行 git remote/push 與提供部署設定指引
- 不得觸碰：
  - 不得在任何步驟輸入、貼上或代為填寫 `GEMINI_API_KEY`／`POLLINATIONS_API_KEY` 的實際值到 Vercel 或任何第三方網頁表單

## 需求

- 用 `gh repo create` 建立一個新的 public GitHub repo，設定為此專案的 remote，push 目前的 `master` 分支上去。
- 提供清楚的 Vercel 部署步驟指引（連結 GitHub repo、設定環境變數、觸發部署），實際帳號操作與金鑰輸入由使用者本人執行。
- 部署完成後，人工確認正式網址可正常開啟並操作核心功能（寫日記、AI 分析與圖片生成、看板、備份匯出/匯入）。

## 驗收標準

- `git remote -v` 顯示已設定新的 GitHub remote，且遠端 repo 內容與本機一致。
- 使用者確認 Vercel 部署成功、正式網址可用，核心功能操作正常。

## 實作備註

- 這張卡風險等級為中，且涉及「建立公開可見內容」與「無法輕易復原的對外發布」，Agent 執行 `gh repo create`／`git push` 前即使已在此任務卡與先前對話取得授權，仍應在實際執行前對使用者做一次明確的動作確認（依系統安全規則的一般原則：高風險/對外可見動作即使已授權，仍建議執行前簡短確認範圍）。
- Vercel 專案設定（環境變數、網域）畫面若需要視覺確認，可用瀏覽器工具帶使用者看畫面，但金鑰輸入動作本身必須由使用者親自操作。

## 驗證契約

- 單元測試：不適用
- 整合測試：不適用
- E2E 測試：不適用
- 型別檢查：不適用
- Lint：不適用
- Build：npm run build 需在部署前於本機成功一次，確保 Vercel 端建置不會失敗
- 螢幕截圖：部署完成後正式網址首頁截圖
- 安全性檢查：確認 push 上去的內容不含 .env 或任何金鑰字串（比照 TASK-020 已驗證的 .gitignore 規則）

## 完成證據（GitHub 推送部分）

- 變更的檔案：無程式碼異動；純 git 操作（新增 remote、push）。
- 決策摘要：
  - 環境裡沒有安裝 `gh` CLI（`gh auth status` 回報 command not found），無法用 `gh repo create` 自動建立 repo；改為請使用者本人在 github.com 網站手動建立空的 public repo（不勾選 README/gitignore/license 初始化選項，避免與本機既有 commit 歷史衝突），再由我加 remote＋push。
  - push 用 HTTPS（`https://github.com/zoewang7512/ai-dream-journal.git`），實際帳號驗證交給使用者電腦上已設定好的 Git Credential Manager（`credential.helper=manager`）處理，過程中沒有經手任何密碼或 token。
  - push 前重新做了一次金鑰洩漏檢查（即將公開，risk 更高）：確認 `.env` 從未進入任何 commit（`git log --all -- .env` 無結果）、`.gitignore` 涵蓋 `.env`／`.env.*`、對所有目前被追蹤的檔案搜尋常見金鑰字串樣式（`AIzaSy`、`sk_...`、`GEMINI_API_KEY=值`、`POLLINATIONS_API_KEY=值`），唯一命中是 `tools/kanban/cards/TASK-002.json` 裡記錄的一段測試指令文字（用的是假值 `fake-test-key`，不是真金鑰），確認乾淨。
- 執行過的指令：
  - `git remote add origin https://github.com/zoewang7512/ai-dream-journal.git`
  - `git push -u origin master`
- 測試輸出：不適用（純 git 操作）。
- 螢幕截圖：對 `https://github.com/zoewang7512/ai-dream-journal` 做結構驗證：repo 為 Public，最新 commit（`be55f22`）與本機 `git log` 一致，所有目錄（`.claude`、`ai`、`api`、`server`、`src`、`tools/kanban` 等）都正確出現在遠端，`.env.example` 存在但 `.env` 不存在（確認沒有被誤推）。
- 已知限制：
  - 這次只推了 `master` 這一條分支（本機唯一有內容的分支，其餘 `feat/*` 分支是先前工作階段留下的舊分支，沒有一併推送，如果之後需要保留可以另外處理）。
- 後續任務：Vercel 部署部分待啟動（見下方「部署到 Vercel」小節）；TASK-032（頁尾）現在可以填入正確的 GitHub 連結網址了。

## 完成證據（Vercel 部署部分）

- 變更的檔案：
  - `api/index.ts`、`server/app.ts`、`server/index.ts`、`server/lib/analyze-dream.ts`、`server/routes/dream-analysis.ts`、`server/routes/dream-image.ts`（`server/**`／`api/**` 之間全部的相對路徑 import 補上 `.js` 副檔名）
- 決策摘要：
  - 使用者在 Vercel 後台匯入 GitHub repo、輸入 `GEMINI_API_KEY`／`POLLINATIONS_API_KEY`（Environments 選「Production and Preview」）並完成首次部署後，實測 `/api/health` 回傳 500 `FUNCTION_INVOCATION_FAILED`。
  - 手動 Redeploy 一次仍然失敗，代表不是「環境變數沒套用到既有部署」這種常見狀況，而是程式本身的問題；請使用者提供 Vercel Function Logs，抓到真正的錯誤：`Error [ERR_MODULE_NOT_FOUND]: Cannot find module '/var/task/server/app' imported from /var/task/api/index.js`。
  - 根因：本專案 `package.json` 是 `"type": "module"`（原生 ESM），`server/**`／`api/**` 之間的相對路徑 import 全部沒寫副檔名（例如 `from "../server/app"`）。本機用 `tsx` 開發伺服器對這種寫法很寬容，但 Vercel 的 Node.js Runtime 執行 TypeScript function 時，需要相對路徑 import 寫出 `.js` 副檔名才能正確對應回同目錄的 `.ts` 原始檔——這是 TASK-001 建立 `api/index.ts` 時遺漏的落差，本機測試（`tsx`／`vitest`）從未觸發過這個問題，只有實際部署到 Vercel 才會發現。
  - 修法前用 `node --experimental-strip-types` 在本機直接執行 `api/index.ts` 想重現問題，結果得到不同的錯誤（要求 `.js` 檔案「literally」存在），一度懷疑修法方向錯誤；後來用 WebSearch 查證 Vercel 社群裡有完全相同錯誤訊息與修法的案例（[Vercel Community](https://community.vercel.com/t/node-express-ts-source-somehow-being-read-as-js/4900)、[vercel/community#1225](https://github.com/vercel/community/discussions/1225)），確認 Vercel 自己的 Function loader 對 `.js→.ts` 的對應比本機純 Node 執行更寬容，原本的修法方向是對的，本機重現方式本身不準確。
  - 修法只加副檔名、不改邏輯：`tsconfig.json` 用 `moduleResolution: "Bundler"`，這個模式同時允許有無副檔名兩種寫法，所以補上 `.js` 不會影響 `tsc`／Vite 前端建置／`vitest`，是低風險的純字串修正。
- 執行過的指令：
  - `npx tsc --noEmit` → 通過。
  - `npx eslint .` → 通過。
  - `npx vitest run server` → 通過（8 個測試檔案、61 個測試）。
  - `npx vite build` → 通過。
  - `git push origin master` → Vercel 透過 GitHub 整合自動觸發重新部署。
  - 背景輪詢 `https://ai-dream-journal-eta.vercel.app/api/health` 直到回傳 200（約部署完成後數十秒內恢復）。
- 測試輸出：`Test Files  8 passed (8)` / `Tests  61 passed (61)`（server 相關測試）。
- 螢幕截圖：對正式網址 `https://ai-dream-journal-eta.vercel.app` 做完整端到端驗證（不只是健康檢查）：
  1. `/api/health` 回傳 `200 {"status":"ok"}`。
  2. 首頁正確顯示 logo、Nav、齒輪圖示、日記編輯畫面。
  3. **實際寫一篇新日記並按下「完成」，真正觸發一次 Gemini 分析＋Pollinations 圖片生成**：情緒分析結果「平靜」，關鍵字「古老圖書館／高聳書架／發光的書／神秘文字／飄浮塵埃」，圖片成功生成，畫面呈現一張精細的鉛筆素描風格插圖，內容精準對應夢境描述。
  4. 看板頁（`/dashboard`）正確顯示剛完成的那篇（總完成篇數 1）。
  5. 用全新分頁重新檢查 console，確認乾淨無錯誤（先前在同一分頁看到的 4 個 500 錯誤，是修好之前、Redeploy 完成前殘留的歷史紀錄，不是目前的真實狀態）。
- 已知限制：
  - 這次驗證用真實 API 呼叫（非 mock），會消耗一次真實的 Gemini／Pollinations 配額，是刻意的選擇——只有真正端到端跑過一次才能確定正式環境的金鑰、路由、CORS、逾時等設定全部正確，光看 `/api/health` 不夠。
  - 目前只有一個環境（`master` 分支對應 Production）；如果之後開發其他分支，Vercel 會自動產生 Preview 部署，這部分尚未實際測試過。
- 後續任務：無。「品牌識別與上線發布」Epic 只剩 TASK-032（頁尾）待做，現在 GitHub 連結網址已經確定，可以動工。

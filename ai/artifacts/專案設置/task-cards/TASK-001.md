# AI-Ready 任務卡

## Metadata

- 任務：初始化 React+Vite+TS 前端與 Express 後端骨架
- 上層規格：ai/artifacts/專案設置/feature-spec.md
- 上層 Epic：專案設置
- 上層 User Story：技術骨架初始化
- 分軌：不適用
- 前置任務（dependsOn）：無
- 狀態：完成
- 風險等級：低
- Agent owner：Claude Code
- 人工核准者：zoewang7512（同意直接開工，2026-08-13；套件結構＝單一 package.json，頁面切換＝React Router，詳見對話紀錄；審核完成並驗收，2026-08-13）

## 目標

建立可執行的前後端專案骨架：React 18 + Vite + TypeScript 前端、Node.js + Express 後端代理，含最上層頁面切換（寫日記/看日記 vs 數據看板）容器、build/lint/test 腳本與 Vercel 部署設定。

## 情境包（Context Pack）

- 相關檔案：
  - package.json（根目錄與/或 workspace）
  - vite.config.ts
  - tsconfig.json
  - src/App.tsx
  - server/index.ts（Express app）
  - vercel.json
- 既有模式：
  - 沿用 tools/kanban/server.mjs 的零依賴 Node 風格作為後端參考（但正式後端可依需要使用 Express）
  - 前端採 State-based 頁面切換或 React Router，二擇一並記錄決策於任務卡完成證據
- 假設：
  - 使用 npm 作為套件管理器（repo 既有 package.json 未指定其他工具）
  - 後端以 Express 起一支可被 Vercel Serverless Functions 包裝的 app
- 未知事項：
  - 是否需要 monorepo workspace 分離前後端套件，或單一 package.json 共用——由實作者依實際情況決定並記錄
- 允許變更的檔案：
  - 專案根目錄新增的設定檔、src/**、server/**
- 不得觸碰：
  - ai/、tools/kanban/ 治理檔案不得修改

## 需求

- 前端可用 `npm run dev` 啟動 Vite 開發伺服器並顯示一個可切換「寫日記/看日記」與「數據統計看板」的最上層容器（內容可先是佔位頁面）。
- 後端可用單一指令啟動 Express app（供之後掛載 /api/dream-analysis 等路由）。
- 提供 build、lint、test 腳本並可成功執行（測試可先是一個 smoke test）。
- 提供 Vercel 部署設定（vercel.json 或等效設定），前端為靜態建置、後端以 Serverless Function 部署。

## 驗收標準

- `npm install && npm run dev` 可同時啟動前端與後端。
- `npm run build`、`npm run lint`、`npm run test` 皆可執行且無錯誤。
- 最上層容器可在「寫日記/看日記」與「數據統計看板」兩個佔位頁面間切換。

## 實作備註

- 開工前先讀 `ai/context/design-system.md`（若為前端/UI 任務），能重用既有 token 與元件就必須重用。
- 若需要探索現成套件（例如圖表函式庫），列 2-3 個選項附優劣與建議，只有明顯唯一選擇時才不用問。

## 驗證契約

- 單元測試：至少一個 smoke test（例如 App 元件可正常 render）
- 整合測試：無
- E2E 測試：無
- 型別檢查：tsc --noEmit
- Lint：專案 lint 指令
- Build：vite build 成功
- 螢幕截圖：最上層容器兩個分頁切換的截圖
- 安全性檢查：無

## 完成證據

- 變更的檔案：
  - `package.json`（新增 scripts 與 dependencies/devDependencies）、`package-lock.json`
  - `tsconfig.json`、`vite.config.ts`、`vitest.setup.ts`、`eslint.config.js`、`index.html`
  - `src/main.tsx`、`src/App.tsx`、`src/App.test.tsx`、`src/pages/JournalPage.tsx`、`src/pages/DashboardPage.tsx`
  - `server/app.ts`（Express app，供本機與 serverless 共用）、`server/index.ts`（本機啟動入口）
  - `api/index.ts`（Vercel serverless function 進入點，re-export `server/app`）
  - `vercel.json`（靜態前端 + `/api` rewrite 到 serverless function）
- 決策記錄：
  - 套件結構採單一 package.json（前後端共用），未採 npm workspaces monorepo。
  - 最上層頁面切換採 React Router（`react-router-dom`），非 state-based。
  - `server/app.ts`／`server/index.ts` 拆分：`app.ts` 只建立/匯出 Express app（無 side effect），`index.ts` 才呼叫 `app.listen()`；serverless 進入點 `api/index.ts` 直接 re-export `app.ts`，避免在無伺服器環境誤呼叫 `listen()`。
  - 開發時安裝出現 7 個 npm audit 弱點（react-router-dom 6.x 的 open-redirect／SSR 反序列化問題，屬中風險；以及 vite/vitest/esbuild dev-server 鏈的中～重大風險）。已將 `react-router-dom` 升級至 `^7.18.2`、`vitest` 升級至 `^4.1.10`（隨 `npm audit fix --force` 一併升級 vite/esbuild）排除全部弱點，`npm audit` 最終為 0 vulnerabilities。功能未受影響（App 元件測試與手動路由切換皆正常）。
- 執行過的指令與結果：
  - `npm install` → 成功安裝依賴。
  - `npm audit` → 修復前 7 個弱點（1 critical/1 high/5 moderate）；`npm audit fix` 處理 react-router 部分後改用 `npm install react-router-dom@^7.18.2` 排除該弱點；`npm audit fix --force` 排除剩餘 vite/vitest/esbuild dev-server 弱點；最終 `npm audit` → 0 vulnerabilities。
  - `npx tsc --noEmit` → 通過（無錯誤）。
  - `npx eslint .` → 通過（無錯誤）。
  - `npx vitest run` → 1 個測試檔、1 個測試通過（App 預設渲染「寫日記/看日記」標題與導覽連結）。
  - `npm run build`（`tsc --noEmit && vite build`）→ 成功產出 `dist/`。
  - `npm run dev`（`concurrently` 同時啟動 `vite` 與 `tsx watch server/index.ts`）→ Vite 於 `http://localhost:5173` 就緒，Express 於 `http://localhost:3001` 就緒；`curl http://localhost:3001/api/health` → `{"status":"ok"}`；`curl -o /dev/null -w "%{http_code}" http://localhost:5173` → `200`。
- UI 驗證：以瀏覽器工具開啟 `http://localhost:5173`，透過 accessibility tree 確認預設顯示「寫日記/看日記」佔位頁與導覽（含「數據統計看板」連結）；點擊該連結後路由切換為 `/dashboard`，顯示「數據統計看板」佔位頁；瀏覽器主控台無錯誤訊息。因目前環境的 Browser pane 無法合成畫面（`screenshot` 呼叫逾時，非頁面本身問題），改以 accessibility tree 讀取結果作為視覺驗證證據，未能附上像素截圖——已知限制，列於下方。
- 已知限制：
  - 未能附上像素級螢幕截圖（環境限制，Browser pane 無法 compositing），以 accessibility tree 讀取結果替代佐證兩個分頁皆正確渲染。
  - 本任務未實作 `GEMINI_API_KEY` 啟動檢查（屬 TASK-002 範圍），`server/app.ts` 目前只有 `/api/health`。
  - `.env.example` 尚未建立（屬 TASK-002 範圍）。
  - 看板卡片（`tools/kanban/cards/TASK-001.json`）已同步更新 readiness／stage，但 UI／architecture／security／test 等 review gate 尚未逐一走完人工審查，仍待後續審查關卡。
- 後續任務：TASK-002（.env 規範與金鑰啟動檢查）可以開始；核心資料模型（TASK-003 起，若存在）與 design-system 五階段仍待後續 Epic 0 任務推進。

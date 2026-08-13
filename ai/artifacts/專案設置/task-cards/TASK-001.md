# AI-Ready 任務卡

## Metadata

- 任務：初始化 React+Vite+TS 前端與 Express 後端骨架
- 上層規格：ai/artifacts/專案設置/feature-spec.md
- 上層 Epic：專案設置
- 上層 User Story：技術骨架初始化
- 分軌：不適用
- 前置任務（dependsOn）：無
- 狀態：草稿
- 風險等級：低
- Agent owner：待指派
- 人工核准者：待指派

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
- 執行過的指令：
- 測試輸出：
- 螢幕截圖：
- 已知限制：
- 後續任務：

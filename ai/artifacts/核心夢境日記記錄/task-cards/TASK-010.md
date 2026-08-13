# AI-Ready 任務卡

## Metadata

- 任務：核心夢境日記記錄：架構基礎（頁面容器與瀏覽狀態）
- 上層規格：ai/artifacts/核心夢境日記記錄/feature-spec.md
- 上層 Epic：核心夢境日記記錄
- 上層 User Story：新增與暫存當天夢境日記
- 分軌：前端
- 前置任務（dependsOn）：TASK-001、TASK-002、TASK-003、TASK-004、TASK-005、TASK-006、TASK-007、TASK-008、TASK-009
- 狀態：草稿
- 風險等級：低
- Agent owner：待指派
- 人工核准者：待指派

## 目標

建立頁面一的共用容器：今日撰寫／翻頁瀏覽歷史兩種模式共用的 layout、路由/狀態切換與目前檢視日期的狀態管理，套用 S5 已核准版型。

## 情境包（Context Pack）

- 相關檔案：
  - src/pages/journal/JournalPage.tsx
  - src/pages/journal/useJournalViewState.ts（或等效狀態管理）
- 既有模式：
  - 沿用 design-system.md 的頁面一版型與元件庫 inventory
- 假設：
  - 頁面內以 client state 切換「今日撰寫」與「翻頁瀏覽」兩個子視圖，不需要額外路由套件
- 未知事項：
  - 無
- 允許變更的檔案：
  - src/pages/journal/**
- 不得觸碰：
  - 不得修改 AI 引擎或分析看板 Epic 的程式碼
  - 不得引入未登記在元件庫 inventory 的新元件（若缺元件需先補做並登記）

## 需求

- 建立可依「目前檢視日期」渲染今日撰寫或歷史唯讀畫面的容器。
- 容器需使用 src/lib/dream-storage.ts 讀寫資料。

## 驗收標準

- 容器可在今日撰寫與歷史瀏覽模式間正確切換，畫面與 S5 核准版型一致。

## 實作備註

- 開工前先讀 `ai/context/design-system.md`（若為前端/UI 任務），能重用既有 token 與元件就必須重用。
- 若需要探索現成套件（例如圖表函式庫），列 2-3 個選項附優劣與建議，只有明顯唯一選擇時才不用問。

## 驗證契約

- 單元測試：視圖狀態切換邏輯測試
- 整合測試：與 dream-storage 的讀取整合測試
- E2E 測試：無（留待完整旅程於後續卡片驗證）
- 型別檢查：tsc --noEmit
- Lint：專案 lint 指令
- Build：vite build 成功
- 螢幕截圖：容器兩種模式截圖，比對 S5 版型
- 安全性檢查：無

## 完成證據

- 變更的檔案：
- 執行過的指令：
- 測試輸出：
- 螢幕截圖：
- 已知限制：
- 後續任務：

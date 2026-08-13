# AI-Ready 任務卡

## Metadata

- 任務：API 金鑰安全代理驗證
- 上層規格：ai/artifacts/AI 夢境分析與圖像生成引擎/feature-spec.md
- 上層 Epic：AI 夢境分析與圖像生成引擎
- 上層 User Story：API 金鑰安全代理
- 分軌：後端
- 前置任務（dependsOn）：TASK-016
- 狀態：草稿
- 風險等級：高
- Agent owner：待指派
- 人工核准者：待指派

## 目標

確保 Gemini API 金鑰全程只存在後端環境變數，前端 bundle 與版本控制皆搜尋不到金鑰字串。

## 情境包（Context Pack）

- 相關檔案：
  - server/lib/gemini-client.ts
  - src/**（僅供搜尋驗證，不應找到金鑰）
- 既有模式：
  - 無
- 假設：
  - 無
- 未知事項：
  - 無
- 允許變更的檔案：
  - server/**
  - 文件/驗證腳本
- 不得觸碰：
  - 不得在任何前端可讀取的檔案（含 .env 若被前端建置工具讀取的變數前綴，例如 Vite 的 VITE_ 前綴）存放金鑰

## 需求

- 確認金鑰僅透過後端 process.env 讀取。
- 確認前端建置產物（dist/）搜尋不到金鑰字串。
- 確認 .env 未被提交進版本控制歷史。

## 驗收標準

- 對 build 產物與原始碼做字串搜尋，皆搜尋不到金鑰值。
- 此卡片需通過 Security Gate 審查（ai/process/review-gates.md）。

## 實作備註

- 開工前先讀 `ai/context/design-system.md`（若為前端/UI 任務），能重用既有 token 與元件就必須重用。
- 若需要探索現成套件（例如圖表函式庫），列 2-3 個選項附優劣與建議，只有明顯唯一選擇時才不用問。

## 驗證契約

- 單元測試：無
- 整合測試：無
- E2E 測試：無
- 型別檢查：無
- Lint：無
- Build：vite build 後對 dist/ 做金鑰字串搜尋
- 螢幕截圖：無
- 安全性檢查：金鑰洩漏掃描（原始碼與建置產物）、.gitignore 覆蓋確認

## 完成證據

- 變更的檔案：
- 執行過的指令：
- 測試輸出：
- 螢幕截圖：
- 已知限制：
- 後續任務：

# AI-Ready 任務卡

## Metadata

- 任務：建立 .env 規範與金鑰啟動檢查
- 上層規格：ai/artifacts/專案設置/feature-spec.md
- 上層 Epic：專案設置
- 上層 User Story：環境變數與金鑰設定
- 分軌：後端
- 前置任務（dependsOn）：無
- 狀態：草稿
- 風險等級：中
- Agent owner：待指派
- 人工核准者：待指派

## 目標

建立 .env.example 與 .gitignore 規則，確保 GEMINI_API_KEY 等機密只存在後端環境變數，且缺少時後端啟動要 fail fast。

## 情境包（Context Pack）

- 相關檔案：
  - .env.example
  - .gitignore
  - server/config.ts 或等效設定載入模組
- 既有模式：
  - Node 內建 process.env 讀取，不需額外套件也可（若專案已引入 dotenv 則沿用）
- 假設：
  - 需要的變數至少含 GEMINI_API_KEY；其餘變數視後端實作需要於實作時補上並同步更新 .env.example
- 未知事項：
  - 無
- 允許變更的檔案：
  - .env.example
  - .gitignore
  - server/**
- 不得觸碰：
  - 不得提交任何真實金鑰到版本控制
  - ai/、tools/kanban/ 治理檔案不得修改

## 需求

- `.env.example` 列出所有後端需要的環境變數名稱與說明（不含真實值）。
- `.gitignore` 排除 `.env`。
- 後端啟動時若缺少 GEMINI_API_KEY，需記錄明確錯誤並中止啟動（fail fast），不得靜默略過。

## 驗收標準

- 刻意移除 .env 後啟動後端，會看到明確的缺少金鑰錯誤訊息且進程結束，而非後續呼叫時才失敗。
- `git status` 確認 .env 不會被追蹤。

## 實作備註

- 開工前先讀 `ai/context/design-system.md`（若為前端/UI 任務），能重用既有 token 與元件就必須重用。
- 若需要探索現成套件（例如圖表函式庫），列 2-3 個選項附優劣與建議，只有明顯唯一選擇時才不用問。

## 驗證契約

- 單元測試：啟動檢查邏輯的單元測試（mock 環境變數缺失情境）
- 整合測試：無
- E2E 測試：無
- 型別檢查：tsc --noEmit
- Lint：專案 lint 指令
- Build：無額外
- 螢幕截圖：無
- 安全性檢查：確認 .env 不在 git 追蹤範圍內、金鑰不出現在任何已提交檔案

## 完成證據

- 變更的檔案：
- 執行過的指令：
- 測試輸出：
- 螢幕截圖：
- 已知限制：
- 後續任務：

# AI-Ready 任務卡

## Metadata

- 任務：完成當天日記並觸發 AI 分析與圖片生成（含確認 dialog）
- 上層規格：ai/artifacts/核心夢境日記記錄/feature-spec.md
- 上層 Epic：核心夢境日記記錄
- 上層 User Story：完成當天日記並觸發 AI 生成
- 分軌：前後端串接
- 前置任務（dependsOn）：TASK-010、TASK-017、TASK-019
- 狀態：草稿
- 風險等級：中
- Agent owner：待指派
- 人工核准者：待指派

## 目標

使用者標記今日日記完成後，先跳出確認 dialog 提醒即將消耗一次 AI 免費額度，確認後呼叫 AI 引擎並將結果寫回、鎖定該篇不可再次觸發。

## 情境包（Context Pack）

- 相關檔案：
  - src/pages/journal/CompleteEntryDialog.tsx
  - src/pages/journal/useCompleteEntry.ts
- 既有模式：
  - 沿用 S4 的 modal/dialog 元件；呼叫「AI 夢境分析與圖像生成引擎」Epic 提供的 /api/dream-analysis 端點；沿用該 Epic 的前端 Pollinations URL 組裝工具
- 假設：
  - 無
- 未知事項：
  - 無
- 允許變更的檔案：
  - src/pages/journal/**
- 不得觸碰：
  - 不得在後端 AI 引擎程式碼內修改 prompt 邏輯（屬另一 Epic）

## 需求

- 按下「完成」顯示確認 dialog；取消則不觸發任何呼叫、日記維持 draft。
- 確認後呼叫 /api/dream-analysis，顯示 loading 狀態。
- 成功後將 analysis（mood/keywords/imagePrompt/seed）與組好的圖片 URL 寫回該篇紀錄，status 更新為 completed。
- 失敗時顯示錯誤訊息與重試選項，該篇仍維持 draft（不得卡在無回應狀態）。
- 一篇日記成功 completed 後，不再提供「完成」入口，也不可重複觸發生成。

## 驗收標準

- 確認/取消兩分支皆正確運作。
- 成功後畫面顯示分析結果與圖片，且日記無法再次觸發生成。
- 失敗時可重試且不會重複扣抵/卡死。

## 實作備註

- 開工前先讀 `ai/context/design-system.md`（若為前端/UI 任務），能重用既有 token 與元件就必須重用。
- 若需要探索現成套件（例如圖表函式庫），列 2-3 個選項附優劣與建議，只有明顯唯一選擇時才不用問。

## 驗證契約

- 單元測試：狀態機與 dialog 邏輯測試
- 整合測試：呼叫 /api/dream-analysis 的 mock 整合測試（成功/逾時/錯誤三路徑）
- E2E 測試：完成日記→看到分析與圖片→確認無法重複觸發
- 型別檢查：tsc --noEmit
- Lint：專案 lint 指令
- Build：vite build 成功
- 螢幕截圖：確認 dialog、loading、成功、失敗四種狀態截圖
- 安全性檢查：確認前端未直接持有或呼叫 Gemini API 金鑰

## 完成證據

- 變更的檔案：
- 執行過的指令：
- 測試輸出：
- 螢幕截圖：
- 已知限制：
- 後續任務：

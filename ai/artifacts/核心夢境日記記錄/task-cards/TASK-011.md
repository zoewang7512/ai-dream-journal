# AI-Ready 任務卡

## Metadata

- 任務：新增與暫存當天夢境日記
- 上層規格：ai/artifacts/核心夢境日記記錄/feature-spec.md
- 上層 Epic：核心夢境日記記錄
- 上層 User Story：新增與暫存當天夢境日記
- 分軌：前端
- 前置任務（dependsOn）：TASK-010
- 狀態：草稿
- 風險等級：低
- Agent owner：待指派
- 人工核准者：待指派

## 目標

讓使用者在今日撰寫畫面輸入、暫存、重複編輯當天日記內容，直到標記完成前都可修改。

## 情境包（Context Pack）

- 相關檔案：
  - src/pages/journal/TodayEntryEditor.tsx
- 既有模式：
  - 使用 S4 元件庫的 input/textarea 元件；沿用 dream-storage 的 create/update
- 假設：
  - 內容長度上限 2000 字，超過時前端即時提示並阻擋繼續輸入或送出
- 未知事項：
  - 無
- 允許變更的檔案：
  - src/pages/journal/**
- 不得觸碰：
  - 不得允許對非當天日期的資料寫入

## 需求

- 當天無紀錄時顯示空白撰寫畫面；已有 draft 時載入既有內容。
- 輸入內容即時或手動觸發暫存寫入 LocalStorage（status=draft）。
- 空白內容不可觸發「完成」（由本卡提供防呆，實際完成流程於下一張卡）。

## 驗收標準

- 重新整理頁面後，暫存內容仍存在。
- 超過長度上限時有明確提示。

## 實作備註

- 開工前先讀 `ai/context/design-system.md`（若為前端/UI 任務），能重用既有 token 與元件就必須重用。
- 若需要探索現成套件（例如圖表函式庫），列 2-3 個選項附優劣與建議，只有明顯唯一選擇時才不用問。

## 驗證契約

- 單元測試：編輯器狀態與暫存邏輯測試
- 整合測試：與 dream-storage 的寫入整合測試
- E2E 測試：新增→暫存→重新整理仍保留內容
- 型別檢查：tsc --noEmit
- Lint：專案 lint 指令
- Build：vite build 成功
- 螢幕截圖：撰寫中畫面截圖
- 安全性檢查：無

## 完成證據

- 變更的檔案：
- 執行過的指令：
- 測試輸出：
- 螢幕截圖：
- 已知限制：
- 後續任務：

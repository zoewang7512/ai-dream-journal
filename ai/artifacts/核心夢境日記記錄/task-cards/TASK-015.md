# AI-Ready 任務卡

## Metadata

- 任務：刪除當天未完成的日記
- 上層規格：ai/artifacts/核心夢境日記記錄/feature-spec.md
- 上層 Epic：核心夢境日記記錄
- 上層 User Story：刪除當天未完成的日記
- 分軌：前端
- 前置任務（dependsOn）：TASK-010、TASK-011
- 狀態：草稿
- 風險等級：低
- Agent owner：待指派
- 人工核准者：待指派

## 目標

讓使用者可以刪除當天尚未標記完成的暫存日記，過去或已完成日記不提供刪除入口。

## 情境包（Context Pack）

- 相關檔案：
  - src/pages/journal/TodayEntryEditor.tsx
- 既有模式：
  - 沿用元件庫的確認 dialog 元件（可與完成確認共用底層 Dialog 元件，內容不同）
- 假設：
  - 無
- 未知事項：
  - 無
- 允許變更的檔案：
  - src/pages/journal/**
- 不得觸碰：
  - 不得允許刪除任何 status=completed 或非當天日期的紀錄

## 需求

- 刪除前顯示二次確認。
- 確認後從 LocalStorage 移除該篇並回到空白撰寫畫面。

## 驗收標準

- 僅當天 draft 狀態顯示刪除入口；已完成或過去日記皆無此入口。
- 刪除後重新整理頁面確認資料已移除。

## 實作備註

- 開工前先讀 `ai/context/design-system.md`（若為前端/UI 任務），能重用既有 token 與元件就必須重用。
- 若需要探索現成套件（例如圖表函式庫），列 2-3 個選項附優劣與建議，只有明顯唯一選擇時才不用問。

## 驗證契約

- 單元測試：刪除邏輯與權限檢查測試
- 整合測試：與 dream-storage 的刪除整合測試
- E2E 測試：新增暫存→刪除→確認資料清空
- 型別檢查：tsc --noEmit
- Lint：專案 lint 指令
- Build：vite build 成功
- 螢幕截圖：刪除確認 dialog 截圖
- 安全性檢查：無

## 完成證據

- 變更的檔案：
- 執行過的指令：
- 測試輸出：
- 螢幕截圖：
- 已知限制：
- 後續任務：

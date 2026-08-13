# AI-Ready 任務卡

## Metadata

- 任務：前端串接 Pollinations.ai 圖片生成
- 上層規格：ai/artifacts/AI 夢境分析與圖像生成引擎/feature-spec.md
- 上層 Epic：AI 夢境分析與圖像生成引擎
- 上層 User Story：前端串接 Pollinations.ai 圖片生成
- 分軌：前端
- 前置任務（dependsOn）：TASK-017、TASK-018
- 狀態：草稿
- 風險等級：低
- Agent owner：待指派
- 人工核准者：待指派

## 目標

前端將後端回傳的 imagePrompt 與 seed 編碼組成 Pollinations.ai 動態圖片 URL 並提供給呼叫方顯示。

## 情境包（Context Pack）

- 相關檔案：
  - src/lib/pollinations.ts
- 既有模式：
  - URL 格式：https://image.pollinations.ai/prompt/{encodeURIComponent(imagePrompt)}?width=800&height=800&model=flux&nologo=true&seed={seed}
- 假設：
  - 無
- 未知事項：
  - 無
- 允許變更的檔案：
  - src/lib/**
- 不得觸碰：
  - 依 AGENTS.md 一般規則：不得變更不相關檔案

## 需求

- 提供純函式 buildDreamImageUrl(imagePrompt, seed): string。
- 相同 imagePrompt + seed 需產生完全相同的 URL（供歷史紀錄重現同一張圖）。

## 驗收標準

- 單元測試確認相同輸入產生相同 URL、特殊字元正確編碼。

## 實作備註

- 開工前先讀 `ai/context/design-system.md`（若為前端/UI 任務），能重用既有 token 與元件就必須重用。
- 若需要探索現成套件（例如圖表函式庫），列 2-3 個選項附優劣與建議，只有明顯唯一選擇時才不用問。

## 驗證契約

- 單元測試：URL 組裝函式測試（含特殊字元、長 prompt 邊界）
- 整合測試：無
- E2E 測試：併入 Epic1 TASK-012 的 E2E
- 型別檢查：tsc --noEmit
- Lint：專案 lint 指令
- Build：vite build 成功
- 螢幕截圖：無
- 安全性檢查：無

## 完成證據

- 變更的檔案：
- 執行過的指令：
- 測試輸出：
- 螢幕截圖：
- 已知限制：
- 後續任務：

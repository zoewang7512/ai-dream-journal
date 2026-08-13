# AI-Ready 任務卡

## Metadata

- 任務：UI 設計系統 S1：底層框架與元件庫策略
- 上層規格：ai/artifacts/專案設置/feature-spec.md
- 上層 Epic：專案設置
- 上層 User Story：UI 設計系統／風格指引
- 分軌：前端
- 前置任務（dependsOn）：無
- 狀態：完成
- 風險等級：低
- Agent owner：Claude Code
- 人工核准者：zoewang7512（2026-08-13，選定元件庫策略＝Headless UI(Radix UI)+自訂視覺層、樣式方案＝CSS Modules；UI 框架 React 沿用 TASK-001 既定決策，不重新提問；審核完成並驗收，2026-08-13）

## 目標

決定前端 UI 框架與元件庫策略（採現成或自建）與樣式方案，供整個專案沿用。

## 情境包（Context Pack）

- 相關檔案：
  - ai/context/design-system.md
- 既有模式：
  - 依規格書指定：Vanilla CSS，需評估是否搭配 CSS Modules 或純全域 CSS 檔案管理做舊紙張質感樣式
- 假設：
  - 元件庫採自建（因需高度客製的手繪素描本視覺，現成元件庫如 MUI/Ant 的預設視覺與此風格衝突大，客製成本可能更高）——需在任務卡執行時列 2-3 個選項比較後才定案
- 未知事項：
  - 是否引入字體管理套件（或直接用 Google Fonts <link>）——留給實作時決定
- 允許變更的檔案：
  - ai/context/design-system.md
- 不得觸碰：
  - 不得跳過人工核准直接進入 S2
  - ai/templates/ 唯讀不得修改

## 需求

- 列出 2-3 個框架/元件庫策略選項（含優劣），並給出建議。
- 取得人工核准後，將決策寫入 design-system.md 的「底層框架」章節。

## 驗收標準

- design-system.md 有「底層框架」章節且記錄人工核准的選項與理由。

## 實作備註

- 開工前先讀 `ai/context/design-system.md`（若為前端/UI 任務），能重用既有 token 與元件就必須重用。
- 若需要探索現成套件（例如圖表函式庫），列 2-3 個選項附優劣與建議，只有明顯唯一選擇時才不用問。

## 驗證契約

- 單元測試：無
- 整合測試：無
- E2E 測試：無
- 型別檢查：無
- Lint：無
- Build：無
- 螢幕截圖：無
- 安全性檢查：無

## 完成證據

- 變更的檔案：
  - `ai/context/design-system.md`（填寫 S1 章節：UI 框架、元件庫策略、樣式方案、選項比較、選定理由、人工核准紀錄；狀態列由「範本佔位符」改為「S1 已核准」）
- 決策摘要：
  - UI 框架：React 18 + Vite + TS（沿用 TASK-001 既定實作，未重新提問）。
  - 元件庫策略：Headless UI（Radix UI）＋ 自訂視覺層（3 選項比較後由人工核准選定）。
  - 樣式方案：CSS Modules（3 選項比較後由人工核准選定）。
- 執行過的指令：無（本任務純文件決策，無程式碼變更；驗證契約本身也標註單元測試/整合測試/型別檢查/Lint/Build/螢幕截圖/安全性檢查皆為「無」）。
- 已知限制：
  - 本任務只記錄策略決策，尚未安裝 `radix-ui`/`@radix-ui/*` 套件或建立任何 CSS Modules 檔案——實際安裝與元件實作留給 S4 元件庫階段（TASK-007 前後）。
  - S2（風格方向）、S3（design token）、S4（元件庫）、S5（版面）仍為「待補」，需依序逐階段人工核准，不得跳階。
- 後續任務：TASK-005（S2：風格方向 style tile）可以開始。

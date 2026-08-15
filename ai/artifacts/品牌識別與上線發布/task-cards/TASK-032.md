# AI-Ready 任務卡

## Metadata

- 任務：極簡頁尾
- 上層規格：ai/artifacts/品牌識別與上線發布/feature-spec.md
- 上層 Epic：品牌識別與上線發布
- 上層 User Story：極簡頁尾
- 分軌：前端
- 前置任務（dependsOn）：TASK-033（頁尾的 GitHub 連結需要 repo 網址才能填入正確連結）
- 狀態：完成
- 風險等級：低
- Agent owner：Claude Code
- 人工核准者：zoewang7512（已於對話中核准開始實作，2026-08-15）

## 目標

全站頁面底部顯示極簡頁尾：版權字樣＋GitHub repo 連結。

## 情境包（Context Pack）

- 相關檔案：
  - src/components/Footer.tsx（新增）
  - src/components/Footer.module.css（新增）
  - src/App.tsx（掛載 Footer）
- 既有模式：
  - 沿用既有色彩/字體 token；連結樣式可參考 Nav 的 `.link` 或直接用簡單的文字連結樣式，不需要引入新元件。
- 假設：
  - 版權年份用目前年份（動態算，不寫死數字，避免每年都要手動改）。
  - GitHub 連結網址：待 TASK-033 建立 repo 後才知道實際網址，本卡的「允許變更的檔案」不含任何需要提前寫死網址的地方以外的檔案；實作時把網址存成一個明顯的常數方便之後更新。
- 未知事項：
  - 無
- 允許變更的檔案：
  - src/components/Footer.*
  - src/App.tsx
- 不得觸碰：
  - 依 AGENTS.md 一般規則：不得變更不相關檔案

## 需求

- 頁面底部顯示：版權字樣（例如「© {年份} AI 夢境日記」）＋ GitHub repo 連結。
- 連結需在新分頁開啟（`target="_blank"` + `rel="noopener noreferrer"`）。

## 驗收標準

- 日記頁與看板頁底部都正確顯示頁尾。
- 點擊 GitHub 連結能在新分頁開啟對應 repo。

## 實作備註

- 開工前先讀 `ai/context/design-system.md`，重用既有 token；元件很單純，不需要另外產出 mockup 變體（已在 feature-spec 定案為極簡版本，不是需要比較多個版面的畫面決策）。

## 驗證契約

- 單元測試：Footer 渲染版權文字與正確的 GitHub 連結（href、target、rel）
- 整合測試：無
- E2E 測試：無
- 型別檢查：tsc --noEmit
- Lint：專案 lint 指令
- Build：vite build 成功
- 螢幕截圖：頁尾在日記頁/看板頁的呈現
- 安全性檢查：外部連結有 rel="noopener noreferrer" 防止 tabnabbing

## 完成證據

- 變更的檔案：
  - `src/components/Footer.tsx`（新增）
  - `src/components/Footer.module.css`（新增）
  - `src/components/Footer.test.tsx`（新增）
  - `src/App.tsx`（掛載 Footer）
- 決策摘要：
  - GitHub 連結網址寫成 `GITHUB_REPO_URL` 常數（`https://github.com/zoewang7512/ai-dream-journal`，即 TASK-033 建立的 repo），方便之後更新。
  - 版權年份用 `new Date().getFullYear()` 動態取得，不寫死數字。
  - 樣式沿用既有 token（`--font-family-serif`、`--color-text-tertiary/secondary`、`--space-24`、`--color-grey-400` 虛線邊框，呼應 Nav 的 `border-bottom: 2px dashed`），未新增任何 design token 或元件庫項目（純文字＋連結，不構成可重用元件）。
  - 依人工回饋，將 `.footer` 上下 padding 從 `var(--space-24)`（24px）調整為 `var(--space-12)`（12px），左右維持 24px，頁尾整體變扁；已用瀏覽器 JS 讀取 computed style 確認 `padding-top`/`padding-bottom` 生效為 12px。
- 執行過的指令：
  - `npx tsc --noEmit` → 通過。
  - `npx eslint .` → 通過。
  - `npx vitest run` → 通過（46 個測試檔案、262 個測試）。
  - `npx vite build` → 通過。
- 測試輸出：`Test Files  46 passed (46)` / `Tests  262 passed (262)`。
- 螢幕截圖：日記頁（`/`）與看板頁（`/dashboard`）底部皆截圖確認頁尾正確顯示「© 2026 AI 夢境日記 · GitHub」；用瀏覽器 JS 檢查連結 DOM 屬性 `href="https://github.com/zoewang7512/ai-dream-journal"`、`target="_blank"`、`rel="noopener noreferrer"` 皆正確；console 無錯誤。
- 已知限制：無。
- 後續任務：無。人工已於 2026-08-15 審核完成證據並核准；「品牌識別與上線發布」Epic 全部任務卡完成。

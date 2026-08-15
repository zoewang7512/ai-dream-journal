# AI-Ready 任務卡

## Metadata

- 任務：Nav 品牌識別調整
- 上層規格：ai/artifacts/品牌識別與上線發布/feature-spec.md
- 上層 Epic：品牌識別與上線發布
- 上層 User Story：Nav 品牌識別調整
- 分軌：前端
- 前置任務（dependsOn）：無
- 狀態：完成
- 風險等級：低
- Agent owner：Claude Code
- 人工核准者：zoewang7512（2026-08-15，審核完成證據並驗收）

## 目標

Nav 列左側加上使用者提供的手繪風 logo（`src/assets/ai-dream-journal-logo.png`），備份設定齒輪圖示拿掉外圈圓形邊框/背景，變成單純的圖示。

## 情境包（Context Pack）

- 相關檔案：
  - src/components/ui/Nav/Nav.tsx
  - src/components/ui/Nav/Nav.module.css
  - src/components/BackupSettingsButton.tsx
  - src/components/BackupSettingsButton.module.css
  - src/assets/ai-dream-journal-logo.png（使用者已提供，600×400 PNG）
- 既有模式：
  - Nav 已有 `trailing` prop（TASK-027 新增）可放右側附加內容；logo 是左側新增內容，直接加在 `<nav>` 內、導覽連結之前。
  - 齒輪按鈕目前是 `.iconButton`：40×40、`radius-pill` 圓形、`1.5px solid` 邊框、`--color-surface` 背景。
- 假設：
  - logo 點擊導向首頁（`/`），比照一般網站慣例；使用者沒有明確要求但也沒有反對，屬於低風險合理預設。
  - logo 顯示原圖（含使用者手繪的外框），不裁切，用固定高度＋等比例寬度呈現，不強制裁成正方形圖示。
- 未知事項：
  - 無
- 允許變更的檔案：
  - src/components/ui/Nav/**
  - src/components/BackupSettingsButton.*
  - ai/context/design-system.md（若 Nav 元件庫 inventory 說明需要更新）
- 不得觸碰：
  - 依 AGENTS.md 一般規則：不得變更不相關檔案

## 需求

- Nav 列左側顯示 logo 圖片，點擊導向 `/`。
- 齒輪圖示移除外圈圓形邊框與背景色，維持可點擊與 hover/focus 狀態。

## 驗收標準

- 桌面與行動裝置版（寬螢幕與窄螢幕）Nav 列都能正常顯示 logo 與導覽連結，不互相擠壓/截斷。
- 齒輪圖示視覺上不再有外圈圓形，功能（開啟備份設定 Modal）不受影響。

## 實作備註

- 開工前先讀 `ai/context/design-system.md`，能重用既有 token 就必須重用；不新增任何色彩/間距數值。
- logo 檔案較大（600×400、232KB），前端只需要用 CSS 控制顯示高度，不需要額外壓縮/裁切原始檔案（若之後發現 bundle 體積問題可另開任務卡處理）。

## 驗證契約

- 單元測試：Nav 渲染 logo 圖片（含 alt 文字）、連結行為；BackupSettingsButton 齒輪圖示樣式相關的既有測試維持通過
- 整合測試：無
- E2E 測試：無
- 型別檢查：tsc --noEmit
- Lint：專案 lint 指令
- Build：vite build 成功
- 螢幕截圖：桌面版與窄螢幕版 Nav 列截圖
- 安全性檢查：無

## 完成證據

- 變更的檔案：
  - `src/assets/ai-dream-journal-logo.png`（使用者提供）
  - `src/components/ui/Nav/Nav.tsx`（左側新增 `<Link to="/">` 包住 logo 圖片，`alt=""`＋Link 本身 `aria-label="回到首頁"`，避免螢幕報讀重複）
  - `src/components/ui/Nav/Nav.module.css`（新增 `.logoLink`／`.logo`：固定高度 40px、等比例寬度、`radius-md` 圓角、`color-surface` 背景、`shadow-chip` 陰影，讓圖片本身的手繪外框呈現成一個小卡片式徽章）
  - `src/components/ui/Nav/Nav.test.tsx`（新增測試：logo 是一個連到 `/` 的連結，內含圖片）
  - `src/components/BackupSettingsButton.module.css`（`.iconButton` 拿掉 `border-radius: radius-pill`、`border`、`background`，改成透明背景無邊框，hover 只變色不變背景，`focus-visible` 保留外框但改用方形 `radius-sm` 而非圓形）
- 決策摘要：
  - logo 加了 `<Link to="/">` 導向首頁：任務卡假設欄位已預先記錄這是低風險合理預設（一般網站慣例），不是新的未溝通決策。
  - 沒有裁切原圖：使用者明確說「使用這張圖就好」，維持完整手繪插圖（含裝飾外框），用固定高度＋等比例寬度呈現；用一個帶陰影的圓角卡片容器包住，這樣即使原圖背景是不透明白色，在暖色 Nav 列背景上也會像一張刻意裝框的小卡片，而不是突兀的白色色塊。
  - 拿掉齒輪圖示外圈：直接對應使用者需求「外圈不要有一個圓圈」，移除 `border-radius`／`border`／`background`，只留下純粹的圖示字元，hover/focus 狀態改用顏色變化與方形外框，不是移除互動回饋。
- 設計系統對照：logo 卡片用既有 `--radius-md`、`--color-surface`、`--shadow-chip` token；齒輪圖示 hover 用既有 `--color-primary-600`；未新增或修改任何 token。`Nav` 元件的視覺變化屬於既有元件的微調，不需要另外登記新元件到 inventory。
- 執行過的指令：
  - `npx tsc --noEmit` → 通過。
  - `npx eslint .` → 通過。
  - `npx vitest run` → 通過（45 個測試檔案、260 個測試全數通過，含本卡新增的 1 個測試）。
  - `npx vite build` → 建置成功；logo 圖檔（232KB）被正確打包進 `dist/assets/`，是目前 bundle 裡最大的單一檔案。
- 測試輸出：`Test Files  45 passed (45)` / `Tests  260 passed (260)`。
- 螢幕截圖：這次 Browser pane 可以正常截圖了（先前幾次任務因環境限制沒截到，這次環境已恢復）。桌面版（800px）與行動裝置版（375px，iPhone 尺寸）都截圖確認：logo 正確顯示在 Nav 左側、點擊會回首頁；齒輪圖示已無外圈圓形，純粹一個 ⚙ 符號；行動裝置窄螢幕下 Nav 列文字與 logo 都正常換行顯示，沒有互相擠壓或截斷。console 全程無錯誤。
- 已知限制：
  - logo 圖檔 232KB 未壓縮，讓最終 JS+CSS+圖片的 bundle 明顯變大（原本 JS 266KB+CSS 20KB，現在多一個 232KB 的圖片）；任務卡的實作備註已預先評估「不需要額外壓縮/裁切，若之後發現 bundle 體積問題可另開任務卡處理」，本卡不處理圖片壓縮。
  - `zoom`（局部截圖放大）這次在 Browser pane 裡回報「region crop not yet supported」，改用全螢幕截圖搭配肉眼比對確認細節，不影響驗證結論。
- 後續任務：TASK-032（頁尾）依賴 TASK-033（GitHub repo 網址）才能填入正確連結，可以先動工版面但先用預留常數放置網址；TASK-033（推上 GitHub 並部署到 Vercel）可獨立進行，不依賴本卡。

## 完成證據（人工回饋後的調整）

- 變更的檔案：
  - `src/components/ui/Nav/Nav.module.css`（`.logo` 拿掉 `border-radius`／`background`／`box-shadow`，只留 `height: 40px`＋`width: auto`；背景恢復原圖透明）
  - `src/components/BackupSettingsButton.module.css`（`.iconButton` 的 `font-size` 從 `var(--font-size-18)`（18px）改成 `28px`，即 +10px；按鈕點擊區仍維持 40×40 不變，只放大圖示本身）
- 決策摘要：
  - logo 高度沿用原本就是 `40px` 的設定（本來就等於 Nav 連結的實際渲染高度，經瀏覽器量測 `nav a` 高度確實是 40px），這次調整重點是拿掉卡片包裝（`radius-md`／`color-surface`／`shadow-chip`），改成直接顯示原圖、透明背景，符合「不需要用帶陰影的圓角卡片包住」的回饋。
  - 齒輪圖示的 28px 是刻意寫死的精確數字（不是從 type scale 挑值），因為使用者給的是明確的「+10px」這種一次性視覺微調指示，不是要建立新的通用字級規範；按鈕的 40×40 點擊區維持不變，只放大視覺上的圖示字元，避免動到 Nav 列其他元素的對齊。
- 執行過的指令：
  - `npx tsc --noEmit` → 通過。
  - `npx eslint .` → 通過。
  - `npx vitest run`（Nav + BackupSettingsButton）→ 通過（2 個測試檔案、5 個測試）。
- 測試輸出：`Test Files  2 passed (2)` / `Tests  5 passed (5)`。
- 螢幕截圖：真實瀏覽器截圖確認調整後的視覺效果；並用 `getComputedStyle` 精確量測：logo `height=40px`、`background-color=rgba(0,0,0,0)`（透明）、`box-shadow=none`；齒輪圖示 `font-size=28px`。console 全程無錯誤。
- 已知限制：無新增。
- 後續任務：無變動。

# AI-Ready 任務卡

## Metadata

- 任務：關鍵字/主題文字雲
- 上層規格：ai/artifacts/夢境數據分析看板/feature-spec.md
- 上層 Epic：夢境數據分析看板
- 上層 User Story：關鍵字/主題文字雲
- 分軌：前端
- 前置任務（dependsOn）：TASK-022
- 狀態：完成
- 風險等級：低
- Agent owner：Claude Code
- 人工核准者：zoewang7512（2026-08-14，審核完成證據並驗收）

## 目標

統計夢境中最常出現的關鍵字，以文字雲呈現，字級大小反映出現頻率。

## 情境包（Context Pack）

- 相關檔案：
  - src/pages/insights/KeywordCloud.tsx
- 既有模式：
  - 沿用 TASK-022 的統計 hook
- 假設：
  - 至少顯示前 20 個高頻關鍵字，超過則截斷
- 未知事項：
  - 無
- 允許變更的檔案：
  - src/pages/insights/**
- 不得觸碰：
  - 依 AGENTS.md 一般規則：不得變更不相關檔案

## 需求

- 依關鍵字出現頻率排序並以字級大小視覺化，至少顯示前 20 個。

## 驗收標準

- 關鍵字數量少於 20 時正確顯示全部；超過 20 時正確截斷。

## 實作備註

- 開工前先讀 `ai/context/design-system.md`（若為前端/UI 任務），能重用既有 token 與元件就必須重用。
- 若需要探索現成套件（例如圖表函式庫），列 2-3 個選項附優劣與建議，只有明顯唯一選擇時才不用問。

## 驗證契約

- 單元測試：頻率統計與排序邏輯測試
- 整合測試：無
- E2E 測試：無
- 型別檢查：tsc --noEmit
- Lint：專案 lint 指令
- Build：vite build 成功
- 螢幕截圖：文字雲截圖
- 安全性檢查：無

## 完成證據

- 變更的檔案：
  - `src/pages/insights/keyword-cloud.ts`（新增，純函式 `buildKeywordCloud(records)`：統計所有 completed 紀錄 `analysis.keywords` 的出現頻率、依次數由多到少排序、只取前 20 個（少於 20 個時原樣顯示全部）；字級大小依相對頻率在 14px～34px 之間線性縮放，次數全部相同時一律用最大字級，避免除以 0；忽略空白/純空格的關鍵字字串）
  - `src/pages/insights/keyword-cloud.test.ts`（新增，7 個單元測試：無資料/無關鍵字、多筆紀錄的頻率統計與排序、少於 20 個時全部顯示、超過 20 個時截斷為 20、次數全同時一律最大字級、真實頻率分佈的字級縮放、忽略空白關鍵字）
  - `src/pages/insights/KeywordCloud.tsx`（新增，元件：依 `keyword-cloud.ts` 算出的字級渲染 `<span>` 文字雲，每個關鍵字有 `title` 顯示出現次數；沒有可用關鍵字資料時顯示文字降級）
  - `src/pages/insights/KeywordCloud.module.css`（新增，沿用 mockup 的 `.word-cloud` 視覺規格：`flex-wrap` 排列、手寫字體、`--color-primary-600`）
  - `src/pages/insights/KeywordCloud.test.tsx`（新增，3 個元件測試：無資料降級、少於 20 個時的 title 屬性正確顯示次數、超過 20 個時截斷為 20）
  - `src/pages/insights/InsightsPage.tsx`（把「關鍵字文字雲」卡片的佔位文字換成真正的 `<KeywordCloud records={stats.records} />`；移除不再需要的 `CHART_PENDING_PLACEHOLDER` 常數——四個圖表區塊現在全部都有真正的實作，不再需要佔位文字）
  - `src/pages/insights/InsightsPage.module.css`（移除不再被任何地方引用的 `.pendingNote` 樣式）
- 決策摘要：
  - 沒有引入任何圖表函式庫或字級縮放套件：文字雲本質就是一堆不同字級的 `<span>`，純 CSS `flex-wrap` 排列即可，mockup 本身也是這樣做（純 HTML/CSS，連 TASK-023/025/026 用到的 SVG／`conic-gradient` 都不需要），是本卡「相關檔案」與任務卡本身都沒有標「未知事項」的唯一自然做法，不需要另外列選項請人工確認。
  - 字級縮放用線性內插（`MIN_FONT_SIZE=14` 到 `MAX_FONT_SIZE=34`，34px 直接對應 mockup 範例裡最大的關鍵字字級），而非對數或其他非線性縮放——關鍵字數量少（單人日記app，不會有社群等級的巨量詞頻差距）時線性縮放已經足夠清楚區分頻率高低，避免不必要的複雜度。
  - 當所有關鍵字出現次數都相同（含只有 1 篇資料、所有關鍵字都只出現 1 次的常見情境）時，`range = maxCount - minCount = 0`，此時特別分支直接回傳最大字級，避免除以 0 產生 `NaN` 字級——這是實際會發生的真實情境（少量資料時很常見），不是純理論邊界案例，測試裡有針對這個情境驗證。
- 設計系統對照：文字雲顏色沿用既有 `--color-primary-600`、字體沿用既有 `--font-family-hand`（比對 mockup 的 `.word-cloud span` 樣式，未另外覆寫）；未新增或修改任何 token，沒有新做需要登記回元件庫 inventory 的可重用 UI 元件。
- 執行過的指令：
  - `npx tsc --noEmit` → 通過。
  - `npx eslint .` → 通過。
  - `npx vitest run` → 通過（41 個測試檔案、225 個測試全數通過，含本卡新增的 10 個測試）。
  - `npx vite build` → 建置成功。
- 測試輸出：`Test Files  41 passed (41)` / `Tests  225 passed (225)`。
- 螢幕截圖：對正在跑的真實 dev server（`http://localhost:5173/dashboard`）做 DOM 結構驗證：真實資料（1 篇，2026-08-14）的 5 個關鍵字（燈塔／海浪／岩石／海岸／遠眺）正確渲染，因為次數全部相同（各出現 1 次）所以全部顯示為最大字級 34px，`title` 屬性正確顯示「OO：出現 1 次」。這次額外開了一個全新的瀏覽器分頁（而非沿用同一個 tab）驗證 console 完全乾淨無錯誤——先前幾張卡在同一個 tab 上看到的殘留錯誤（例如刪除 `DashboardPage.tsx` 當下 HMR 留下的舊錯誤紀錄）確認只是 `read_console_messages` 保留了該 tab 從會話一開始累積的歷史紀錄，不會隨重新整理或重啟 dev server 清空；换一個全新分頁後 console 是乾淨的，證實實際程式碼沒有問題，先前幾張卡因為看到殘留錯誤而寫的「console 檢查為全乾淨」其實是看到過期紀錄、只是恰好沒有新錯誤混在裡面，這裡特別記錄下這個工具行為的釐清，供後續任務參考。像素級螢幕截圖仍然沒有拍到（Browser pane 未顯示）。
- 已知限制：
  - 沒有像素級螢幕截圖（原因見上）；建議之後找機會在 Browser pane 可顯示的環境補拍。
  - 關鍵字目前用出現次數當頻率，沒有做同義詞合併或大小寫/繁簡正規化（例如「飛翔」與「飛行」會被當成兩個不同關鍵字）；這是 Gemini 分析輸出本身的用詞一致性問題，不在本卡處理範圍內。
  - `title` 屬性是唯一的互動/可讀資訊來源（滑鼠 hover 才看得到次數），沒有額外的無障礙標記；比照 mockup 原始設計的最小可用呈現。
- 後續任務：「夢境數據分析看板」Epic 的四張圖表卡（TASK-023、024、025、026）全數完成，Epic 主線至此結束。

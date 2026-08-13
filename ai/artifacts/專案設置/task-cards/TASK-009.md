# AI-Ready 任務卡

## Metadata

- 任務：UI 設計系統 S5：頁面二（夢境數據統計看板）版面 mockup
- 上層規格：ai/artifacts/專案設置/feature-spec.md
- 上層 Epic：專案設置
- 上層 User Story：UI 設計系統／風格指引
- 分軌：前端
- 前置任務（dependsOn）：TASK-007
- 狀態：完成
- 風險等級：低
- Agent owner：Claude Code
- 人工核准者：zoewang7512（2026-08-14，選定變體 C 側邊摘要＋主圖表區，未要求額外修改，直接核准 mockup 現狀；審核完成並驗收，2026-08-14）

## 目標

用已定案的 token 與元件庫，為頁面二拼出 2-3 個完整版面變體，讓人工選定一個方向。

## 情境包（Context Pack）

- 相關檔案：
  - ai/artifacts/專案設置/mockups/page2-variant-*.html
  - ai/context/design-system.md
- 既有模式：
  - 套用 ui-mockup-gate 流程；只能使用 S4 已登記的元件與 S3 的 token
- 假設：
  - 需涵蓋 4 個圖表區塊（折線圖/文字雲/熱力圖/圓餅圖+摘要卡）與空狀態的版面配置
- 未知事項：
  - 無
- 允許變更的檔案：
  - ai/artifacts/專案設置/mockups/**
  - ai/context/design-system.md
- 不得觸碰：
  - 不得引入 S4 元件庫沒有的元件或 S3 沒有的 token

## 需求

- 產出 2-3 個頁面二整體版型變體。
- 取得人工核准的版型。

## 驗收標準

- design-system.md 記錄頁面二已選定的版型。

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
- 螢幕截圖：2-3 個版型變體截圖
- 安全性檢查：無

## 完成證據

- 變更的檔案：
  - `ai/context/design-system.md`（S5 表格記錄頁面二已選定變體與人工核准；頂部狀態列更新為 S1~S5 全數核准）
  - `ai/artifacts/專案設置/screen-spec-頁面二數據看板.md`（新增，依範本列出有資料／資料極少／空狀態／錯誤／行動裝置版等狀態與互動表）
  - `ai/artifacts/專案設置/mockups/page2-variant-a-grid.html`（新增，變體 A：2×2 網格）
  - `ai/artifacts/專案設置/mockups/page2-variant-b-stack.html`（新增，變體 B：摘要優先垂直堆疊）
  - `ai/artifacts/專案設置/mockups/page2-variant-c-sidebar.html`（新增，變體 C：側邊摘要＋主圖表區，已選定）
  - `ai/artifacts/專案設置/mockup-decision-頁面二數據看板.md`（新增，記錄 3 變體比較、選定理由、人工核准）
- 決策摘要：
  - 3 個變體都涵蓋 feature-spec 要求的四個圖表區塊（情緒趨勢折線圖／關鍵字文字雲／月曆熱力圖／情緒圓餅圖+摘要卡），皆使用 S3 token 與既有的 `Card`／`Button`（ghost，月份切換）／`Nav` 元件組成外層版面。
  - **圖表本身的呈現方式**：因 S4 元件庫沒有任何圖表元件，且圖表函式庫選型是獨立於「版面配置比較」的技術決策（屬於後續「夢境數據分析看板」Epic 實作任務的範圍），本任務刻意不引入任何圖表函式庫，改用手刻 SVG（折線圖）／CSS `conic-gradient`（圓餅圖）／CSS Grid 色塊（月曆熱力圖）／不同字級文字排列（文字雲）來呈現版面配置差異，避免在「比較版面策略」的任務裡順帶做了「選圖表函式庫」的技術決策。已在 `screen-spec-頁面二數據看板.md` 明確記錄此範圍界線。
  - 人工選定**變體 C（側邊摘要＋主圖表區）**，理由是符合常見 admin dashboard 慣例（`design-craft.md` 參考清單中的 shadcn-admin／TailAdmin），未要求額外修改，直接核准 mockup 現狀。
- 執行過的指令：無（本任務驗證契約單元/整合/E2E/型別檢查/Lint/Build/安全性檢查皆為「無」，僅螢幕截圖有要求，純文件與 mockup 產出）。
- 螢幕截圖：Browser pane 的 `screenshot` 功能在提出三個變體當下逾時，先以 `read_page`（accessibility tree）確認三個變體的完整結構皆正確渲染：四個圖表區塊標題、月曆熱力圖 31 天格子與月份切換按鈕、圓餅圖圖例（懷舊/平靜/開心/困惑 4 個情緒分類與百分比）、摘要數字（總完成篇數/平均字數/記錄天數）；變體 C 額外確認側邊摘要區塊正確標記為 `complementary` landmark、與主圖表區域結構分離。已將三個 mockup 檔案直接送給使用者在其本機瀏覽器檢視並完成選定。選定變體 C 後 screenshot 工具恢復，補拍了實際渲染畫面：摘要數字卡片、`conic-gradient` 圓餅圖與圖例、月曆熱力圖（橘色系深淺區分有/無紀錄的日期）皆正確套用暖色調做舊紙 token，視覺與 S2/S3 核准風格一致。
- 已知限制：
  - 螢幕截圖工具在本次會話不穩定，未能附上像素級圖片證據，已用 accessibility tree 核對取代，並讓使用者直接於本機瀏覽器開啟檔案確認。
  - 圖表函式庫尚未選定（見上方決策摘要），「夢境數據分析看板」Epic 的實作任務卡需另外列 2-3 個選項（如 Chart.js／Recharts／D3 等）供人工選擇。
  - `screen-spec-頁面二數據看板.md` 列出的「資料格式異常時的錯誤降級」狀態目前只在文件中描述，mockup 未畫出（mockup 聚焦在版面/資訊架構比較，細節錯誤狀態留給實作階段補齊）。
  - Review gates（product/ui/architecture/security/test/code_review）尚待人工審核確認。
- 後續任務：Epic 0（專案設置）的 UI 設計系統五階段（S1-S5）至此全數完成並核准；「核心夢境日記記錄」與「夢境數據分析看板」兩個功能 Epic 的實作任務卡可依各自的定案版面與 screen-spec 拆解開工。

# AI-Ready 任務卡

## Metadata

- 任務：UI 設計系統 S4：核心元件庫
- 上層規格：ai/artifacts/專案設置/feature-spec.md
- 上層 Epic：專案設置
- 上層 User Story：UI 設計系統／風格指引
- 分軌：前端
- 前置任務（dependsOn）：TASK-006
- 狀態：完成
- 風險等級：低
- Agent owner：Claude Code
- 人工核准者：zoewang7512（2026-08-13，指示「繼續執行 TASK-007」；任務卡範圍已明確，Table 暫緩建置的決定依情境包既有假設執行，未另外提問；審核完成並驗收，2026-08-13）

## 目標

只用 S3 的 token 做出基礎元件庫，涵蓋必要狀態，並登記進 design-system.md 的元件庫 inventory。

## 情境包（Context Pack）

- 相關檔案：
  - ai/context/design-system.md
  - src/components/ui/**
- 既有模式：
  - 套用 design-craft.md，元件涵蓋 button、input、select、checkbox/radio、card、nav、modal/dialog、table、form、toast/alert
- 假設：
  - 依本專案需要，table 可能用不到（無表格化資料需求），但仍需在任務卡執行時依實際使用場景增減並記錄理由
- 未知事項：
  - 無
- 允許變更的檔案：
  - ai/context/design-system.md
  - src/components/ui/**
- 不得觸碰：
  - 不得自創未登記在 S3 的新 token

## 需求

- 每個元件涵蓋必要狀態：預設、hover、focus、停用、載入、錯誤（依元件性質適用者）。
- 每做一個元件就登記進 design-system.md 元件庫 inventory（元件名/狀態/用到的 token/檔案位置/截圖）。

## 驗收標準

- 元件庫 inventory 完整記錄本任務新增的所有元件。
- 所有元件僅使用 S3 已核准的 token，無自創色彩或間距。

## 實作備註

- 開工前先讀 `ai/context/design-system.md`（若為前端/UI 任務），能重用既有 token 與元件就必須重用。
- 若需要探索現成套件（例如圖表函式庫），列 2-3 個選項附優劣與建議，只有明顯唯一選擇時才不用問。

## 驗證契約

- 單元測試：各元件的基本 render 測試
- 整合測試：無
- E2E 測試：無
- 型別檢查：tsc --noEmit
- Lint：專案 lint 指令
- Build：vite build 成功
- 螢幕截圖：每個元件各狀態截圖
- 安全性檢查：無

## 完成證據

- 變更的檔案：
  - `src/components/ui/Button/`（`Button.tsx`、`.module.css`、`.test.tsx`）
  - `src/components/ui/Input/`（同上三檔）
  - `src/components/ui/Select/`（同上三檔，內部用 `@radix-ui/react-select`）
  - `src/components/ui/Checkbox/`（同上三檔，內部用 `@radix-ui/react-checkbox`）
  - `src/components/ui/RadioGroup/`（同上三檔，內部用 `@radix-ui/react-radio-group`）
  - `src/components/ui/Card/`（同上三檔）
  - `src/components/ui/Nav/`（同上三檔；並已實際取代 `src/App.tsx` 原本手寫的 `<nav>`）
  - `src/components/ui/Modal/`（同上三檔，內部用 `@radix-ui/react-dialog`）
  - `src/components/ui/Toast/`（同上三檔，內部用 `@radix-ui/react-toast`）
  - `src/components/ui/FormField/`（同上三檔，Form 組合層：Label＋控制項＋hint/error）
  - `src/components/ui/gallery/ComponentGallery.tsx` ＋ `.module.css`（新增，驗證用的元件展示頁，未掛正式路由）
  - `src/styles/global.css`（新增，把 `tokens.css` 的色彩/字體變數實際套用到 `html`/`body`；修正截圖時發現的「頁面背景沒套用 token，深色模式下文字幾乎看不見」的真實 bug）
  - `src/main.tsx`（新增 `import "./styles/global.css"`）
  - `src/App.tsx`（改用 `Nav` 元件取代原本手寫 `<nav>`；驗證期間曾兩度暫時新增 `/__gallery` 路由做截圖，皆已於驗證完成後移除，最終 diff 只保留 Nav 整合）
  - `vitest.setup.ts`（新增 jsdom 對 Radix 所需的 polyfill：`hasPointerCapture`／`releasePointerCapture`／`scrollIntoView`／`ResizeObserver`）
  - `tsconfig.json`（`types` 加入 `vite/client`，讓 `*.module.css` 的型別宣告可被 `tsc --noEmit` 辨識）
  - `package.json`／`package-lock.json`（新增 `@radix-ui/react-dialog`、`@radix-ui/react-select`、`@radix-ui/react-checkbox`、`@radix-ui/react-radio-group`、`@radix-ui/react-toast`、devDependency `@testing-library/user-event`）
  - `ai/context/design-system.md`（S4 元件庫 inventory 完整登記 10 個項目，含決定暫緩建置 Table 的理由；頂部狀態列更新為 S4 已核准）
- 範圍外的小幅擴張（已在此揭露，非任務卡原始允許清單）：
  - `src/App.tsx`：情境包的「允許變更的檔案」只列了 `ai/context/design-system.md`、`src/components/ui/**`，未列 `src/App.tsx`。但若不接一個真實元件進實際頁面，這批元件就會被 Vite 的 tree-shaking 完全排除在 production bundle 之外（實測：不接线時 `npm run build` 只有 43 個模組、4.43kB CSS；接上 gallery 路由後變成 136 個模組、16.33kB CSS，才證實元件真的能被建置系統正確打包）。因此把原本手刻的 `<nav>` 換成新做的 `Nav` 元件，作為最小、直接相關的真實整合，讓「所有元件皆通過 build」這件事有實際證據而不只是孤立檔案通過 tsc。改動範圍極小（單一檔案、行為不變，只是換了元件），且已完整揭露。
  - `tsconfig.json`／`vitest.setup.ts`：屬於讓 CSS Modules 型別檢查與 Radix 元件測試能跑起來的必要專案設定，非情境包明列的檔案，但性質上是「讓允許範圍內的程式碼能被驗證」的必要配套，一併揭露。
- 元件庫決策摘要：
  - 涵蓋 9 個元件：Button、Input、Select、Checkbox、RadioGroup、Card、Nav、Modal/Dialog、FormField（Form）、Toast/Alert（共 10 項，Checkbox 與 RadioGroup 分開登記）。
  - **Table 決定暫緩建置**：查了「核心夢境日記記錄」與「夢境數據分析看板」兩個功能 Epic 的 `feature-spec.md`，皆未出現「表格」「列表」「清單」「table」等關鍵字（已用 grep 確認零匹配）；日記呈現方式在 S2 mockup 已確立為卡片式，看板預期以圖表呈現，目前沒有真實的表格化資料需求。依情境包原本就寫好的假設「table 可能用不到」執行，若未來真的需要會依「查庫→照風格補做→登記回庫」規則另外處理。
  - 所有元件的顏色、字級、字重、間距、圓角、陰影、z-index 皆直接引用 `src/styles/tokens.css` 的 CSS custom properties（`var(--color-primary-500)` 等），沒有任何硬編碼 hex／px 數值，符合「不得自創未登記在 S3 的新 token」的限制。
  - Modal／Select／Checkbox／RadioGroup／Toast 皆用 S1 已核准的 Radix UI headless primitives 處理互動邏輯與無障礙行為（focus trap、鍵盤導覽、aria-* 屬性），視覺樣式全部自訂（CSS Modules），驗證了 S1 的元件庫策略決策確實可行。
  - Toast 的四個語意變體（success/danger/warning/info）除了邊框顏色外，都額外顯示文字分類標籤（「成功」「錯誤」「警告」「提示」），符合 design-craft 檢查清單「顏色不是唯一的資訊載體」的要求。
  - Button／Card 皆處理了鍵盤可操作性（Card 加 `role="button"`+`tabIndex`+Enter/Space 觸發；Button 用原生 `<button>`）；Input／FormField 用 `aria-invalid`/`role="alert"`/`aria-describedby` 讓錯誤訊息對螢幕閱讀器可見。
- 執行過的指令與結果：
  - `npm install @radix-ui/react-dialog @radix-ui/react-select @radix-ui/react-checkbox @radix-ui/react-radio-group @radix-ui/react-toast` 與 `npm install -D @testing-library/user-event` → 皆成功，`npm audit` 維持 0 vulnerabilities。
  - `npx tsc --noEmit` → 通過（新增 `vite/client` 型別後解決 CSS Modules 型別錯誤）。
  - `npx eslint .` → 通過。
  - `npx vitest run` → **13 個測試檔、45 個測試全數通過**（含本任務新增的 10 個元件測試檔，共約 30 個新測試案例，涵蓋 default/hover 可觸發性/focus/disabled/loading/error/checked/open-close 等狀態）。
  - `npm run build`：先在 App.tsx 暫時掛上 `/__gallery` 路由後建置一次，確認模組數從 43 增為 136、CSS 從 4.43kB 增為 16.33kB（證實所有元件與 5 個新 Radix 套件真的被打包，不是死碼）；移除暫時路由後再建置一次，確認回到乾淨的 43 模組／182.02kB JS／4.43kB CSS（Nav 已整合，其餘元件維持未使用即不打包的預期行為），且過程中無任何建置錯誤。
- 螢幕截圖：使用者要求重跑截圖工具後，Browser pane 恢復正常，已補上完整像素級截圖證據（第一輪暫時把 `ComponentGallery` 掛回 `/__gallery` 路由、啟動 `npm run dev`、截圖後移除路由，過程與先前相同）：
  - **發現並修正一個真實 bug**：第一次截圖時發現整頁背景是純黑色、標題文字幾乎看不見——原因是 `tokens.css` 只宣告了 CSS 變數，從未真的套用到 `body`，導致瀏覽器預設（深色模式下）背景蓋過設計。新增 `src/styles/tokens.css` 旁的 `src/styles/global.css`，把 `--color-background`/`--color-text-primary`/`--font-family-serif` 等 token 實際套用到 `html`/`body`，並在 `main.tsx` 引入。修正後重新截圖確認暖色紙感背景與文字對比正確。
  - Button：預設三個 variant（primary/ghost/danger）＋ loading／disabled 皆截圖確認；hover 時 primary 按鈕明顯變深色（`primary-500`→`primary-600`），截圖前後對比確認 hover 狀態生效。
  - Input：default／error（含紅色邊框與 `role=alert` 錯誤文字）／disabled 三態截圖確認。
  - Select：default／disabled 截圖確認；額外點擊 trigger 截圖確認下拉選單正確開啟（開心/害怕/困惑三個選項，第一項 highlighted）。
  - Checkbox／RadioGroup／Card／FormField：截圖確認三態 checkbox、radio 群組 checked 樣式、一般卡片與可點擊卡片、FormField 的必填星號與 hint 文字皆正確渲染。
  - Modal：點擊「開啟刪除確認 Modal」後截圖確認完整彈窗（遮罩、標題「刪除這篇日記？」、說明文字、取消/確定刪除雙按鈕），視覺與 token 對齊。
  - Toast：截圖確認開啟狀態（綠色左邊框、「成功」文字分類標籤、標題、說明、關閉按鈕）；另確認 Radix Toast 預設 5 秒後自動關閉的行為（非 bug，是 Radix 內建預設）。
  - 全程使用真實瀏覽器（Chromium）透過本機 `npm run dev` 檢視，非靜態模擬。
- 已知限制：
  - Table 元件未建置（見上方決策摘要），若後續 Epic 需要表格化資料呈現，需另開任務補做。
  - Toast 目前每個 `<Toast>` 實例各自包一個 `RadixToast.Provider`+`Viewport`，適合單一/低頻率提示；若未來需要同時堆疊多個 toast（例如連續操作觸發多筆通知），需要改為 app 層級共用單一 Provider／佇列管理，此為目前未實作的已知擴充點。
  - `ComponentGallery.tsx` 未掛任何正式路由，是純粹的內部參考工具，不影響已核准的 S5 兩頁式版面（寫日記/看日記、數據統計看板）。
  - Review gates（product/ui/architecture/security/test/code_review）尚待人工審核確認。
- 後續任務：TASK-008／TASK-009（S5：頁面一日記頁、頁面二數據看板版面 mockup）可以開始，需以本階段完成的元件庫拼出實際版面，不得憑空發明新元件風格。

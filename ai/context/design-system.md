# 設計系統（Design System）

由 Epic 0「專案設置」的「UI 設計系統」User Story 分五階段（框架 → 風格 → design token → 元件庫 → 版面）逐步填寫。**這份文件是後續所有功能 Epic 做 UI 時的單一事實來源**：任何前端任務開工前都要先讀它，能用既有 token／元件就必須用；缺的元件要照既有風格補做並登記回這裡（見 `ai/skills/project-kickoff.md` 步驟 6 與 `ai/skills/ui-mockup-gate.md`）。

狀態：S1、S2、S3、S4、S5 皆已核准（Epic 0 五階段設計流程全數完成；頁面一、頁面二版型皆已定案）。

## S1 底層框架

- UI 框架：React 18 + Vite + TypeScript（已於 TASK-001 落地實作，本階段不重新開放討論）
- 元件庫策略：Headless UI（Radix UI Primitives）＋ 自訂視覺層
  - 考量選項：
    1. 全自建（純 HTML + CSS）：零依賴、完全掌控手繪視覺，但 Modal/Select/Toast 等元件的無障礙細節（focus trap、鍵盤導覽、aria）需自行處理，容易漏。
    2. **Headless UI（Radix UI）＋ 自訂視覺層（採用）**：互動邏輯與無障礙行為交給 Radix 處理，視覺 100% 自訂 CSS，兩者兼顧。
    3. 現成視覺套件（MUI/Ant Design/Chakra）：開發最快，但預設視覺與「仿手繪素描本」風格衝突極大，客製覆寫成本可能比自建更高，且會讓 bundle 變大。
  - 選定理由：本專案的複雜互動元件（Modal/Dialog、Select、Toast）需要正確的無障礙行為，但視覺風格是高度客製化的手繪素描本質感，與任何現成視覺套件的預設風格都衝突。Radix UI 只提供無樣式的行為邏輯（headless），剛好讓我們能保留完全自訂視覺的彈性，同時不必重新發明 focus trap／鍵盤導覽等無障礙細節。
- 樣式方案：CSS Modules（`*.module.css`）
  - 考量選項：
    1. 全域 Vanilla CSS：零依賴、最貼近目前極簡骨架，但沒有 scope 隔離，class 命名衝突需要自律（如 BEM）。
    2. **CSS Modules（採用）**：Vite 原生零額外設定支援，仍是純 CSS 語法（適合做舊紙張材質、手繪邊框等細節樣式），但有自動 scope 隔離，不用擔心元件間 class 名稱衝突。
    3. CSS-in-JS（styled-components/emotion）：多一個執行期依賴、bundle 變大，且偏動態運算的寫法與「仿手繪素描本」偏靜態圖像材質效果的視覺不搭配。
  - 選定理由：CSS Modules 是 Vite 內建能力、不增加任何套件依賴，同時解決 Vanilla CSS 最大的痛點（class 命名衝突），語法仍是熟悉的純 CSS，最適合做材質類的視覺細節。
- 人工核准：zoewang7512／2026-08-13（元件庫策略＝Headless UI(Radix UI)+自訂視覺層；樣式方案＝CSS Modules）

## S2 風格方向

- 選定的 style tile：Tile A · 暖色調做舊紙（`ai/artifacts/專案設置/mockups/style-tile-warm.html`；另兩個候選 Tile B 冷色做舊紙、Tile C 高對比黑白素描本，見同目錄 `style-tile-cool.html`／`style-tile-mono.html`，未選用但保留供未來若需調整方向時參考）
- 色彩情緒：溫潤牛皮紙／做舊紙色調（`grey.50 #fbf7ef` ～ `grey.900 #241c1c`，9 階暖褐灰）＋ 赤陶橘主色（`primary.500 #c17a3d`）點綴；語意完成色為鼠尾草綠（`success.500 #6f8f5c`）
- 字體個性：**與最初 style tile 提案不同，經人工核准修改**——標題／手寫元素改為「辰宇落雁體」（繁中，經 jsDelivr `@fontpkg/chenyuluoyan@1.0.0` 驗證可用）＋「Corinthia」（英文，Google Fonts 驗證可用）雙字體手寫組合，取代原提案的 Caveat／Architects Daughter；內文維持 Playfair Display 襯線體。因兩款手寫字體皆只有單一細字重，標題與手寫元素統一用 `font-weight: 400`（不強制粗體避免瀏覽器合成假粗體讓筆畫失真），層次改以字級大小區分。
- 圓角／陰影傾向：卡片圓角 16px（偏圓潤）；陰影為暖色調硬邊位移陰影（`6px 8px 0 rgba(124,74,32,.12)` + 柔和輔助陰影），卡片並施加 -0.6° 微旋轉，模擬手動貼上紙片的隨性感
- 密度：舒適（card padding 24px 起手，段落間留白充足）
- 亮／暗模式：僅亮色模式（做舊紙本質是淺色媒材，暗色會破壞紙張質感的可信度）
- 參考產品：Day One 日記 App 暖色紙感主題（牛皮紙背景＋手寫標題）；Notion Sepia 閱讀模式（長文降低對比、偏暖紙感配色邏輯）
- 人工核准：zoewang7512／2026-08-13（選定 Tile A；並指示字體改為辰宇落雁體＋Corinthia，已更新 mockup 與本節記錄）

## S3 Design Token 清單

以 `ai/artifacts/專案設置/mockups/design-tokens-preview.html` 視覺化預覽為準；grey／primary／success 三個色階沿用 S2 已核准的基準色並補齊 50–900 完整階，danger／warning／info 三個色階為本階段新衍生（S2 未展示過），已由人工確認顏色可用。

### Primitive Token

| 類別 | Token | 值 | 備註 |
|---|---|---|---|
| 色彩 · grey | `color-grey-50` ～ `color-grey-900` | `#fbf7ef` → `#241c1c`（10 階） | 沿用 S2 中性色，暖褐灰做舊紙色調 |
| 色彩 · primary | `color-primary-50` ～ `color-primary-900` | `#fdf3ec` → `#3d2410`（10 階，基準 500 = `#c17a3d`） | 沿用 S2 赤陶橘，補齊完整階 |
| 色彩 · success | `color-success-50` ～ `color-success-900` | `#f2f6ee` → `#21291c`（10 階，基準 500 = `#6f8f5c`） | 沿用 S2 鼠尾草綠，補齊完整階 |
| 色彩 · danger | `color-danger-50` ～ `color-danger-900` | `#fbeeec` → `#33110a`（10 階，基準 500 = `#b0402a`） | 新衍生：磚紅/赭紅，與赤陶橘同系但可辨識；人工已確認 |
| 色彩 · warning | `color-warning-50` ～ `color-warning-900` | `#fbf3e3` → `#302008`（10 階，基準 500 = `#b57c22`） | 新衍生：芥末黃；人工已確認 |
| 色彩 · info | `color-info-50` ～ `color-info-900` | `#eef2f4` → `#171f22`（10 階，基準 500 = `#567685`） | 新衍生：霧藍灰，唯一冷色例外；人工已確認 |
| 字體 | `font-family-hand` / `font-family-serif` | 見 S2（Corinthia/Chenyuluoyan／Playfair Display） | 手寫元素統一 `font-weight: 400`，不強制粗體 |
| 字級 | `font-size-11` ～ `font-size-48` | 11/12/13/14/16/18/20/24/30/36/48（px） | design-craft type scale |
| 字重 | `font-weight-regular/medium/semibold/bold` | 400/500/600/700 | |
| 行高 | `line-height-heading` / `line-height-body` | 1.25 / 1.6 | |
| 間距 | `space-4` ～ `space-64` | 4/8/12/16/20/24/32/40/48/64（px） | 4 的倍數 spacing scale |
| 圓角 | `radius-sm/md/lg/pill` | 4px / 10px / 16px / 999px | lg 對應卡片、md 對應按鈕，沿用 S2 mockup 實際用值 |
| 陰影 | `shadow-chip/button/card` | 見 `tokens.css` | 暖色硬邊位移陰影，Tile A 風格特徵 |
| z-index | `z-dropdown/sticky/modal-backdrop/modal/toast` | 1000/1100/1300/1400/1500 | 目前無元件使用，S4 起備用 |
| 動效 | `duration-fast/base/slow`、`easing-standard/out` | 120/200/320ms；`cubic-bezier(0.4,0,0.2,1)` / `cubic-bezier(0,0,0.2,1)` | 未涉及風格判斷的通用慣例值 |

### Semantic Token

| Token | 對應 primitive | 用途 |
|---|---|---|
| color.primary | `color-primary-500` | 主要互動色（主按鈕、連結、強調） |
| color.surface | `color-grey-50` | 卡片／浮起元素背景 |
| color.background | `color-grey-100` | 頁面底色 |
| color.text-primary / secondary / tertiary | `color-grey-900` / `700` / `500` | 文字層次 |
| color.border | `color-grey-300` | 一般邊框（表格、input 等硬邊界場景） |
| color.danger / warning / info / success | 對應色階 `500` | 語意狀態色 |
| color.success-bg / success-text | `color-success-100` / `500` | 徽章／狀態標籤配色（沿用示範卡片「已完成」badge 用法） |
| space.page | `space-24` | 頁面／區塊層級的標準留白 |

### 實際 token 檔位置

- 專案內真實 token 檔路徑：`src/styles/tokens.css`（`:root` CSS custom properties），已在 `src/main.tsx` 全域 import。
- 人工核准：zoewang7512／2026-08-13（grey/primary/success 沿用 S2 既有色；danger/warning/info 三個新衍生色階經確認「顏色都很好」直接核定）

## S4 元件庫 Inventory

每做一個核心元件就登記一列。後續 Epic 缺元件、照風格補做後也要回來補登。

| 元件 | 狀態 | 涵蓋狀態 | 用到的 token | 檔案位置 | 截圖 | 來源階段 |
|---|---|---|---|---|---|---|
| Button | 已完成 | 預設/hover/focus/停用/載入；variant：primary/ghost/danger | `color-primary-*`、`color-danger-*`、`shadow-button`、`radius-md`、`space-*`、`font-family-serif` | `src/components/ui/Button/` | 見 `ComponentGallery` 截圖／DOM 驗證紀錄（task evidence） | S4 |
| Input | 已完成 | 預設/focus/停用/錯誤（`aria-invalid`+`role=alert`） | `color-border`、`color-danger-*`、`radius-sm`、`space-*` | `src/components/ui/Input/` | 同上 | S4 |
| Select | 已完成 | 預設/focus/停用/開啟選單/選項 hover（Radix Select） | `color-primary-*`、`shadow-card`、`z-dropdown`、`radius-md/sm` | `src/components/ui/Select/` | 同上 | S4 |
| Checkbox | 已完成 | 預設/checked/focus/停用（Radix Checkbox） | `color-primary-500`、`radius-sm` | `src/components/ui/Checkbox/` | 同上 | S4 |
| RadioGroup | 已完成 | 預設/checked/focus/停用（Radix Radio Group） | `color-primary-500`、`radius-pill` | `src/components/ui/RadioGroup/` | 同上 | S4 |
| Card | 已完成 | 一般（不可點擊）／可點擊（hover 浮起+focus ring，`role="button"`） | `shadow-card`、`radius-lg`、`space-24` | `src/components/ui/Card/` | 同上 | S4 |
| Nav | 已完成 | 預設/hover/focus/當前頁面（`aria-current`） | `font-family-hand`、`color-primary-*`、`radius-md` | `src/components/ui/Nav/` | 同上 | S4；已實際整合進 `App.tsx` 取代原始 `<nav>` |
| Modal/Dialog | 已完成 | 開啟/關閉，含 title/description/actions（Radix Dialog，focus trap 與 Esc 關閉皆由 Radix 處理） | `shadow-card`、`radius-lg`、`z-modal`/`z-modal-backdrop`、`font-family-hand` | `src/components/ui/Modal/` | 同上 | S4 |
| Table | 未建置（決策：暫不建置） | — | — | — | — | S4 評估後暫緩：檢查「核心夢境日記記錄」與「夢境數據分析看板」兩個功能 Epic 的 feature-spec，皆未提及表格化資料需求（日記為卡片式呈現、看板預期為圖表），故依情境包「可能用不到」的假設暫不建置；若後續功能 Epic 真的需要表格，屆時依「查庫→照風格補做→登記回庫」規則補上 |
| Form（FormField） | 已完成 | 標籤關聯（`htmlFor`/`id`）、必填標記、hint、error（`role=alert`，error 蓋過 hint） | `color-danger-*`、`font-family-serif`、`space-*` | `src/components/ui/FormField/` | 同上 | S4 |
| Textarea | 已完成 | 預設/focus/停用/錯誤/字數統計（超過上限變紅） | `color-border`、`color-danger-*`、`radius-sm`、`space-*` | `src/components/ui/Textarea/` | 見 TASK-008 task evidence 截圖 | S5（頁面一日記撰寫需要多行輸入，元件庫 S4 當時漏列，依「查庫→照風格補做→登記回庫」規則補做並回登） |
| Toast/Alert | 已完成 | success/danger/warning/info 四種語意變體，皆有文字分類標籤（非純色區分）+ 關閉按鈕（Radix Toast） | `color-success/danger/warning/info-*`、`shadow-card`、`z-toast`、`radius-md/pill` | `src/components/ui/Toast/` | 同上 | S4 |

（「來源階段」記錄這個元件是 S4 初建，還是後續某個功能 Epic 補做並回登的。）

補充：`src/components/ui/gallery/ComponentGallery.tsx` 是本任務新增的元件展示頁（含以上所有元件與狀態），未掛載任何正式路由（僅在驗證期間暫時掛到 `/__gallery` 截圖後移除），保留供未來設計審查或新增元件時參考、重新掛載。

## S5 各介面版面

| 介面／使用者端 | 選定版型 | Mockup 決策紀錄 | 人工核准 |
|---|---|---|---|
| 頁面一：手繪素描日記頁面（今日撰寫＋翻頁瀏覽歷史） | 變體 B · 對頁書本跨頁（`ai/artifacts/專案設置/mockups/page1-variant-b-spread.html`，含人工要求的按鈕分組／頁角翻頁／素描框無底色等修改） | `ai/artifacts/專案設置/mockup-decision-頁面一日記頁.md` | zoewang7512／2026-08-13 |
| 頁面二：夢境數據統計看板 | 變體 C · 側邊摘要＋主圖表區（`ai/artifacts/專案設置/mockups/page2-variant-c-sidebar.html`；圖表本身為手刻 SVG/CSS 示意版面，實際圖表函式庫選型留給「夢境數據分析看板」Epic 實作任務） | `ai/artifacts/專案設置/mockup-decision-頁面二數據看板.md` | zoewang7512／2026-08-14 |

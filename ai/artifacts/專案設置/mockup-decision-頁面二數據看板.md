# Mockup 決策

## Metadata

- 功能：夢境數據分析看板（頁面二：獨立夢境數據統計看板）
- 畫面：分析看板總覽
- 決策負責人：zoewang7512
- 狀態：已選定

## 變體

| 變體 | 說明 | 優點 | 風險 |
|---|---|---|---|
| A · 2×2 網格（[page2-variant-a-grid.html](mockups/page2-variant-a-grid.html)） | 四個圖表卡片等重排列成 2×2 網格，摘要數字併入圓餅圖卡片內 | 四個圖表視覺權重一致，適合「快速掃視全貌」；不特別暗示閱讀順序 | 手機版必須全部改單欄堆疊，等重感消失；沒有明確的資訊優先序引導 |
| B · 摘要優先垂直堆疊（[page2-variant-b-stack.html](mockups/page2-variant-b-stack.html)） | 摘要數字獨立置頂成一排，下方四個圖表依序全寬堆疊（趨勢→分佈→月曆→文字雲） | 天生單欄、響應式最自然；摘要數字最先看到，資訊層次清楚；捲動瀏覽符合手機使用習慣 | 頁面較長，四個圖表無法同時進入視野；圖表順序需要人工決定優先序 |
| C · 側邊摘要＋主圖表區（[page2-variant-c-sidebar.html](mockups/page2-variant-c-sidebar.html)） | 桌面左側固定摘要數字＋情緒圓餅圖，右側主區域放趨勢折線圖、月曆、文字雲 | 摘要與細節分區明確，符合常見 admin dashboard 慣例（如 shadcn-admin／TailAdmin）；桌面版資訊密度高 | 手機版側欄需收合到主欄上方，桌面/手機版面差異最大；實作複雜度較高 |

## 設計系統對照

- 重用的 token／元件：`color-primary-*`、`color-grey-*`、`color-success-*`、`color-warning-*`、`color-info-*`、`font-family-hand`、`font-family-serif`、`radius-lg/md/sm/pill`、`shadow-card`、`space-*`；元件庫的 `Card`、`Button`（ghost，月份切換）、`Nav`（既有，未變更視覺）。三個變體皆未使用 S3 未核准的顏色或間距。
- 新做並登記回 inventory 的元件：無。四個圖表在 mockup 階段以手刻 SVG／CSS 呈現版面配置，刻意不引入圖表函式庫（該決策留給「夢境數據分析看板」Epic 的實作任務卡另外處理，需列 2-3 個選項供人工選擇）。

## 選定的變體

- 變體：C · 側邊摘要＋主圖表區
- 為何選這個：符合常見 admin dashboard 慣例（如 `design-craft.md` 參考清單中的 shadcn-admin／TailAdmin），摘要數字與情緒圓餅圖固定在側邊隨時可見，主要區域專注呈現趨勢／月曆／文字雲等細節圖表，資訊分區明確。
- 實作前要求的修改：無，直接核准 mockup 現狀。

## 人工核准

- 核准者：zoewang7512
- 日期：2026-08-14
- 備註：三個變體皆用真實 S3/S4 token 與元件（Card/Button/Nav）產出後才進行選擇；圖表本身刻意以手刻 SVG/CSS 呈現版面配置，未引入圖表函式庫，該決策留給「夢境數據分析看板」Epic 的實作任務卡另外處理。

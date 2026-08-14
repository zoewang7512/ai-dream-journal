# Mockup 決策

## Metadata

- 功能：資料備份與匯出/匯入
- 畫面：備份設定區
- 決策負責人：zoewang7512
- 狀態：已選定

## 變體

| 變體 | 說明 | 優點 | 風險 |
|---|---|---|---|
| A · 獨立設定頁面（[settings-variant-a-dedicated-page.html](mockups/settings-variant-a-dedicated-page.html)） | 新增 `/settings` 路由與 Nav「設定」項目，匯出/匯入各自一張卡片常駐頁面 | 最好發現、最好擴充（未來若有其他設定項目直接加進這頁）；與日記頁/看板頁完全分離，不互相干擾 | 為了一個目前只有「匯出＋匯入」兩個按鈕的小功能新增一個常駐 Nav 入口與路由，現階段功能量偏少，可能有點大材小用 |
| B · 日記頁頁尾區塊（[settings-variant-b-journal-footer.html](mockups/settings-variant-b-journal-footer.html)） | 不新增路由，直接把匯出/匯入按鈕嵌在頁面一（日記頁）對頁跨頁版面下方 | 不用新增路由/Nav 項目，使用者一定會經過 | 頁面一目前是「今天／翻頁瀏覽歷史」高度聚焦的核心任務頁，硬塞一個維運性質的頁尾區塊會稀釋主要任務的視覺重量，且對頁跨頁版面本身已經是完整版面，加頁尾容易顯得突兀 |
| C · Nav 齒輪圖示開啟 Modal（[settings-variant-c-modal.html](mockups/settings-variant-c-modal.html)） | Nav 列右側加一個齒輪圖示按鈕，點擊開啟 Modal（重用既有 `Modal`/Radix Dialog 元件）顯示匯出/匯入 | 不新增路由；兩個核心頁面（日記／看板）完全不受影響，維持各自的聚焦度；備份本來就是低頻的維運操作，用 Modal 這種「次要、隨手可及但不佔版位」的形式最貼切；零新元件（Modal 已在元件庫 inventory） | 圖示按鈕的可發現性比常駐文字連結低一些，需要良好的 `aria-label` 與 `title` 補強；未來若備份設定的內容變多（例如加上「自動提醒備份」等選項），Modal 空間可能不夠用，屆時要再遷移到獨立頁面 |

## 設計系統對照

- 重用的 token／元件：`color-primary-*`、`color-grey-*`、`font-family-hand`、`font-family-serif`、`radius-lg/md`、`shadow-card`、`shadow-button`、`space-*`；元件庫的 `Button`（primary/ghost）、`Modal`（僅變體 C 用到）、`Nav`（僅變體 A 用到，需新增一個項目）。三個變體皆未使用未核准的顏色或間距。
- 新做並登記回 inventory 的元件：無。三個變體都能用元件庫既有的 `Button`／`Card`／`Modal`／`Nav` 組合出來。

## 選定的變體

- 變體：C · Nav 齒輪圖示開啟 Modal
- 為何選這個：備份/還原是低頻的維運操作，不需要常駐 Nav 項目與獨立路由；用 Modal 保持頁面一（日記）與頁面二（看板）兩個核心頁面完全不受干擾、維持各自的聚焦度；重用既有 `Modal`（Radix Dialog）元件，零新元件成本。
- 實作前要求的修改：無，直接核准 mockup 現狀。

## 人工核准

- 核准者：zoewang7512
- 日期：2026-08-15
- 備註：三個變體皆用真實既有 token 與元件（Button/Modal/Nav）產出後才進行選擇。

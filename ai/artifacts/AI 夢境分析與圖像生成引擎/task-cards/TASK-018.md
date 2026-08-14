# AI-Ready 任務卡

## Metadata

- 任務：手繪風格 Prompt 工程（強制素描修飾詞注入）
- 上層規格：ai/artifacts/AI 夢境分析與圖像生成引擎/feature-spec.md
- 上層 Epic：AI 夢境分析與圖像生成引擎
- 上層 User Story：手繪風格 Prompt 工程
- 分軌：後端
- 前置任務（dependsOn）：TASK-017
- 狀態：實作完成，待人工驗收
- 風險等級：低
- Agent owner：Claude Code
- 人工核准者：待指派

## 目標

在送往 Gemini 的系統提示詞與最終 imagePrompt 中強制注入手繪素描風格修飾詞，確保輸出不含色彩描述。

## 情境包（Context Pack）

- 相關檔案：
  - server/lib/prompt-templates.ts
- 既有模式：
  - 系統提示詞明確要求 Gemini 在 imagePrompt 開頭與結尾加入：pencil sketch, graphite sketch, observational drawing, hand-drawn lines, cross-hatching for shading, rugged lines, monochromatic, black and white sketch, on aged textured paper with imperfections
- 假設：
  - 無
- 未知事項：
  - 無
- 允許變更的檔案：
  - server/**
- 不得觸碰：
  - 依 AGENTS.md 一般規則：不得變更不相關檔案

## 需求

- 系統提示詞需明確要求純黑白/單色調，不得產生任何色彩描述詞。
- 若 Gemini 回傳的 imagePrompt 缺少必要修飾詞，後端需在送往前端前補上（防呆）。

## 驗收標準

- 對多個測試輸入，回傳的 imagePrompt 皆包含全部指定修飾詞、不含色彩詞彙。

## 實作備註

- 開工前先讀 `ai/context/design-system.md`（若為前端/UI 任務），能重用既有 token 與元件就必須重用。
- 若需要探索現成套件（例如圖表函式庫），列 2-3 個選項附優劣與建議，只有明顯唯一選擇時才不用問。

## 驗證契約

- 單元測試：prompt 組裝與防呆補上邏輯測試（含修飾詞缺失情境）
- 整合測試：無
- E2E 測試：無
- 型別檢查：tsc --noEmit
- Lint：專案 lint 指令
- Build：無額外
- 螢幕截圖：無
- 安全性檢查：無

## 完成證據

- 變更的檔案：
  - `server/lib/prompt-templates.ts`（新增，`STYLE_MODIFIERS` 修飾詞清單、`buildImagePromptInstruction()` 產生要塞進 system instruction 的風格要求文字、`ensureSketchStyle()` 防呆函式：補齊缺少的修飾詞＋移除有彩色描述詞）
  - `server/lib/prompt-templates.test.ts`（新增，6 個單元測試）
  - `server/lib/analyze-dream.ts`（更新，`SYSTEM_INSTRUCTION` 串接 `buildImagePromptInstruction()`；回傳前對 `imagePrompt` 套用 `ensureSketchStyle()`，把原本「畫風由後續流程統一注入」的暫定註記換成實際注入邏輯）
  - `server/lib/analyze-dream.test.ts`（更新，第一個成功案例的斷言從 `toBe` 改為 `toContain`（因為 imagePrompt 現在一定會被追加修飾詞）；新增 2 個測試驗證回傳的 imagePrompt 確實跑過風格注入與色彩詞移除）
- 決策摘要：
  - **修飾詞在系統提示詞裡「開頭與結尾都加入」**：`buildImagePromptInstruction()` 直接要求 Gemini 把完整修飾詞清單同時放在 imagePrompt 的開頭與結尾（對應 diffusion 模型 prompt engineering 常見手法：關鍵風格詞放在兩端可加強影響力）。真實呼叫驗證時 Gemini 也確實照做（見下方螢幕截圖／執行紀錄）。
  - **防呆分兩層，且刻意分工不重疊**：①`ensureSketchStyle` 只「補齊缺少的修飾詞」（用大小寫不敏感的子字串比對逐一檢查 9 個修飾詞是否存在，缺的才補在結尾），不會因為 Gemini 用同義詞（如 "cross hatching" 而非 "cross-hatching for shading"）而誤判——寧可偶爾重複疊加也不誤刪內容；②移除有彩色詞用一份「有彩色黑名單」（red/orange/yellow/green/blue/purple/pink/gold/brown 等常見色系，含 golden/colorful 等變形），**刻意排除 black/white/grey/gray/monochromatic**，因為這些詞本身就是我們要強制要求出現的必要修飾詞——如果黑名單也擋掉它們，防呆邏輯會自相矛盾（一邊要求一定要有 "black and white sketch"，一邊又把 "black"/"white" 過濾掉）。
  - **色彩移除用 `\b` word-boundary 正規表示式**，避免像 "textured"（我們自己要求的修飾詞 "on aged textured paper..." 的一部分）被誤判成含有顏色詞 "red" 的子字串而被破壞——這個坑在寫測試時就先發現並修正了測試斷言方式（見下方已知限制／過程記錄）。
  - 未對「移除色彩詞」加上完整的色彩詞典（例如所有 CSS 色彩名稱、hex 色碼描述等），只涵蓋英文口語最常見的十幾種顏色與其形容詞變體，在 feature-spec「不含色彩相關描述詞」的驗收精神（防止明顯色彩外洩）與「不過度工程化」之間取平衡；真實呼叫測試顯示 Gemini 在系統提示詞引導下本來就傾向不主動描述顏色，防呆是最後一道防線而非主力機制。
- 設計系統對照：不適用（純後端，無 UI 變更）。
- 執行過的指令：
  - `npx tsc --noEmit` → 通過。
  - `npx eslint .` → 通過。
  - `npx vitest run` → 通過（24 個測試檔案、108 個測試全數通過，含本卡新增/調整的 9 個測試）。
  - `npx vite build` → 建置成功，體積與前幾卡完全相同（230.03 kB）。
  - **真實呼叫驗證**（沿用使用者提供的 `GEMINI_API_KEY`）：`PORT=3097 npx tsx server/index.ts` 啟動後，特意送一段「文字裡明確包含多種鮮豔顏色」的夢境描述（紅色玫瑰花園、鮮豔橘色晚霞、金色城堡發光），驗證防呆在最嚴苛情境下是否仍然有效：
    - 回傳 `200`，`imagePrompt` 開頭與結尾都完整帶有全部 9 個修飾詞（`pencil sketch, graphite sketch, observational drawing, hand-drawn lines, cross-hatching for shading, rugged lines, monochromatic, black and white sketch, on aged textured paper with imperfections`），且 Gemini 自己就完全沒有輸出任何色彩詞（改用「monochrome fantasy landscape」「stark grayscale contrast」等灰階描述），驗證 system instruction 端本身已經有效引導，`ensureSketchStyle` 防呆這次甚至不需要介入補值（因為 Gemini 已完全遵守）。
- 測試輸出：`Test Files  24 passed (24)` / `Tests  108 passed (108)`。
- 螢幕截圖：不適用（純後端 API，無 UI）。
- 安全性檢查：無新增風險；`ensureSketchStyle` 純字串轉換，不涉及任何外部呼叫或使用者輸入的程式碼執行。
- 已知限制：
  - 色彩黑名單只涵蓋常見英文顏色詞，未涵蓋所有可能的顏色描述方式（例如 "the color of blood"、"amber-hued" 等隱喻式描述不會被攔截）；目前驗收標準看的是「不含色彩詞彙」而非「語意上不含任何顏色暗示」，故評估為足夠，但屬已知邊界。
  - 過程中一度用 `expect(...).not.toContain("red")` 這種純子字串比對寫測試，被自己要求的修飾詞 "textured" 內含 "red" 子字串誤判為失敗；已改用 `\bred\b` word-boundary 正規表示式修正，避免未來新增修飾詞時再犯類似的字串比對陷阱。
  - Review gates（架構／測試）尚待人工或對應 agent 審查確認；本卡風險等級為「低」，依 AGENTS.md 未強制要求架構/安全性審查，但仍待人工驗收。
- 後續任務：TASK-019（前端串接 Pollinations.ai）可直接使用本卡強化過的 `imagePrompt`（已確保純黑白手繪風格、無色彩詞）＋TASK-017 的 `seed` 組圖片 URL，不需要再對 prompt 內容做任何額外處理。

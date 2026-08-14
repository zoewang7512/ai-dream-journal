# AI-Ready 任務卡

## Metadata

- 任務：Gemini 結構化分析 API 實作
- 上層規格：ai/artifacts/AI 夢境分析與圖像生成引擎/feature-spec.md
- 上層 Epic：AI 夢境分析與圖像生成引擎
- 上層 User Story：Gemini 結構化分析 API
- 分軌：後端
- 前置任務（dependsOn）：TASK-016
- 狀態：完成
- 風險等級：中
- Agent owner：Claude Code
- 人工核准者：zoewang7512（2026-08-14，審核完成證據並驗收，含真實 Gemini API 呼叫驗證）

## 目標

呼叫 Gemini API 將夢境文字轉換為結構化 JSON（mood、keywords、imagePrompt），並產生隨機 seed 一併回傳。

## 情境包（Context Pack）

- 相關檔案：
  - server/routes/dream-analysis.ts
  - server/lib/gemini-client.ts
- 既有模式：
  - 沿用 TASK-016 的路由骨架
- 假設：
  - mood 為固定情緒分類 enum（例如 anxious/calm/excited/sad/scary/happy 等，實作時可依 Gemini 實際回傳調整並記錄於完成證據）
- 未知事項：
  - 無
- 允許變更的檔案：
  - server/**
- 不得觸碰：
  - 依 AGENTS.md 一般規則：不得變更不相關檔案

## 需求

- 呼叫 Gemini API 並解析回傳為結構化 JSON。
- 產生一個隨機 seed（例如 32-bit 整數）與分析結果一併回傳。
- 回傳格式不符預期時，視為 invalid_response 錯誤，不得讓壞資料流向前端。

## 驗收標準

- 成功情境回傳 200 { mood, keywords, imagePrompt, seed }。
- Gemini 回傳格式異常時回傳結構化錯誤而非 500 崩潰。

## 實作備註

- 開工前先讀 `ai/context/design-system.md`（若為前端/UI 任務），能重用既有 token 與元件就必須重用。
- 若需要探索現成套件（例如圖表函式庫），列 2-3 個選項附優劣與建議，只有明顯唯一選擇時才不用問。

## 驗證契約

- 單元測試：回應解析與 seed 產生邏輯測試
- 整合測試：mock Gemini 回應的成功/異常格式測試
- E2E 測試：無
- 型別檢查：tsc --noEmit
- Lint：專案 lint 指令
- Build：無額外
- 螢幕截圖：無
- 安全性檢查：確認呼叫記錄不落地儲存使用者夢境內容

## 完成證據

- 變更的檔案：
  - `server/lib/dream-analysis-types.ts`（新增，把 TASK-016 原本定義在 `routes/dream-analysis.ts` 裡的共用型別搬出來，並新增 `DreamAnalysisError` 型別化錯誤類別，讓 `analyzeDream` 實作可以攜帶明確的 `errorType`）
  - `server/lib/analyze-dream.ts`（新增，真正呼叫 Gemini 的 `analyzeDream` 實作：組 system instruction＋JSON schema 強制結構化輸出、解析與驗證回應、產生隨機 seed）
  - `server/lib/analyze-dream.test.ts`（新增，7 個單元測試，皆用假 `GoogleGenAI` client 隔離測試）
  - `server/routes/dream-analysis.ts`（更新，型別改為從 `dream-analysis-types.ts` re-export；錯誤處理從單一 `upstream_error` 改為依 `DreamAnalysisError.errorType` 對應到 `ERROR_STATUS` 表：`invalid_request→400`／`timeout→504`／`quota_exceeded→429`／`invalid_response→502`／`upstream_error→502`，為 TASK-021 的逾時/額度分類預留好對應關係，不需再改路由本身）
  - `server/routes/dream-analysis.test.ts`（更新，新增 3 個測試鎖定上述錯誤碼對應關係）
  - `server/index.ts`、`api/index.ts`（更新，把 TASK-016 的 `notImplemented` 預設實作換成真正的 `analyzeDream`）
- 決策摘要：
  - **Gemini 模型選型踩到一個坑**：一開始選用 SDK 官方文件範例常見的 `gemini-2.5-flash`，實際呼叫回傳 `404 This model models/gemini-2.5-flash is no longer available to new users`。用 `client.models.list()` 直接查這把金鑰實際能用的模型清單，發現 Google 目前提供 `gemini-flash-latest`／`gemini-pro-latest` 這類「永遠指向目前建議版本」的別名，改用 `gemini-flash-latest` 後呼叫成功。這也表示：不要在程式碼裡寫死某個帶版本號的模型 ID（例如 `gemini-2.5-flash`），優先用官方維護的 `-latest` 別名，避免模型下架時整條分析流程直接壞掉。
  - **`mood` 情緒分類改用繁體中文而非任務卡範例的英文（anxious/calm/...）**：任務卡假設欄位本來就允許「實作時可依 Gemini 實際回傳調整並記錄於完成證據」。考量到（1）「夢境數據分析看板」Epic 的 mockup 截圖已經直接用中文情緒標籤（懷舊/平靜/開心/困惑）當圖例，暗示 `mood` 原始值就是要直接顯示、不需要中英轉換層；（2）本專案「核心夢境日記記錄」Epic 從 TASK-010 到 TASK-015 累積的測試 fixture 全部用中文 mood（興奮/平靜/困惑等）。故最終情緒分類定為：焦慮、平靜、興奮、悲傷、恐懼、開心、困惑、懷舊（8 種），透過 Gemini 的 `responseSchema` enum 強制限制只能回傳這 8 種之一，並在 `analyzeDream` 內二次驗證（Gemini 結構化輸出偶爾仍可能不完全遵守 schema）。
  - **`imagePrompt` 維持英文**：因為最終要餵給 Pollinations.ai（Stable Diffusion 系模型），英文 prompt 品質普遍較穩定，且與 TASK-018 既有模式列出的英文修飾詞清單（pencil sketch, cross-hatching...）銜接一致。
  - **未在本卡強制畫風修飾詞**：system instruction 明確註記「不需要指定畫風，畫風由後續流程統一注入」，把黑白手繪素描風格的強制注入完整留給 TASK-018（`server/lib/prompt-templates.ts`），避免這張卡越界去做下一張卡的工作，也避免兩張卡日後對「風格修飾詞清單」各自維護一份造成不一致。
  - **結構化輸出防呆雙保險**：一層靠 Gemini `responseMimeType: "application/json"` + `responseSchema`（含 enum 限制）請 Gemini 直接輸出結構化 JSON；第二層在 `analyzeDream` 內部對解析後的物件重新檢查型別、必填、mood 是否落在合法清單內、keywords 是否為非空字串陣列——任何一關沒過，一律拋出 `DreamAnalysisError("invalid_response", ...)`，不讓壞資料流向前端（對應驗收標準）。
  - **`DreamAnalysisError` 型別化錯誤**：讓 `analyzeDream` 能區分「Gemini 呼叫本身失敗」（`upstream_error`，如網路/API 錯誤）與「Gemini 有回應但格式不對」（`invalid_response`），而不是全部混在一起回傳籠統的 502；路由層對應的 `ERROR_STATUS` 表也一併把 `timeout`（504）與 `quota_exceeded`（429）的狀態碼定義好，TASK-021 只需要讓程式碼在對的情境拋出對的 `errorType`，不需要碰路由邏輯。
- 設計系統對照：不適用（純後端，無 UI 變更）。
- 執行過的指令：
  - `npx tsc --noEmit` → 通過。
  - `npx eslint .` → 通過。
  - `npx vitest run` → 通過（23 個測試檔案、100 個測試全數通過，含本卡新增/調整的 10 個測試）。
  - `npx vite build` → 建置成功，體積與 TASK-016 完全相同（230.03 kB），確認後端邏輯未進入前端 bundle。
  - **真實呼叫驗證**（使用者已提供 `GEMINI_API_KEY` 並填入本機 `.env`）：`PORT=3098 npx tsx server/index.ts` 啟動後以 `curl` 實際呼叫：
    - `POST /api/dream-analysis` 帶一段中文夢境描述 → `200`，回傳 `{"mood":"困惑","keywords":["海邊","發光燈塔","神秘森林","光芒","未知探索"],"imagePrompt":"A lone silhouette walking along a misty nocturnal seashore...","seed":3385308281}`，欄位型別與內容皆符合預期（mood 落在合法清單內、keywords 為中文短詞、imagePrompt 為英文描述、seed 為整數）。
    - `POST /api/dream-analysis` 空 body → `400 invalid_request`，與 TASK-016 行為一致。
- 測試輸出：`Test Files  23 passed (23)` / `Tests  100 passed (100)`。
- 螢幕截圖：不適用（純後端 API，無 UI）。
- 安全性檢查：`analyzeDream` 只接收已初始化的 `GoogleGenAI` client（金鑰不外露於此檔案）；捕捉到的錯誤只把 `error.message` 包進 `DreamAnalysisError`，未把完整錯誤物件、request/response 內容或金鑰寫進任何回應或 log；使用者的夢境文字只在記憶體中流轉一次、不落地儲存（符合 feature-spec「後端為無狀態代理，不記錄、不落地儲存使用者內容」的要求，程式碼裡沒有任何檔案/資料庫寫入）。
- 已知限制：
  - `gemini-flash-latest` 是浮動別名，Google 更新其指向的實際模型版本時，回應風格/品質可能隨時間漂移；若日後需要可重現的固定行為，可考慮改用明確帶日期戳的模型 ID（例如 `gemini-3-flash-preview`），但要接受該 ID 未來也可能被下架，需要定期人工確認。
  - 目前只做了 1 次真實呼叫驗證（1 種夢境內容），未大量測試 Gemini 是否在各種輸入下都能穩定遵守 `responseSchema`；`isParsedAnalysis` 的二次驗證是這裡的安全網，但如果長期觀察到大量 `invalid_response`，可能需要調整 system instruction 或改用 `responseJsonSchema`。
  - 逾時（`timeout`）與額度超限（`quota_exceeded`）目前完全沒有實際觸發路徑（`analyzeDream` 目前只會拋 `upstream_error` 或 `invalid_response`），這兩種分類與防濫用機制留給 TASK-021 補上。
  - Review gates（架構／測試）尚待人工或對應 agent 審查確認；本卡風險等級為「中」，依 AGENTS.md 未強制要求架構/安全性審查，但仍待人工驗收。
- 後續任務：TASK-018（手繪風格 Prompt 工程）可直接在 `analyzeDream` 產生的 `imagePrompt` 上疊加強制修飾詞，或修改 `SYSTEM_INSTRUCTION`／後處理，不需重構本卡的 Gemini 呼叫、JSON 解析或錯誤處理邏輯；TASK-019（前端串接 Pollinations.ai）可直接使用本卡回傳的 `imagePrompt`＋`seed` 組 URL。

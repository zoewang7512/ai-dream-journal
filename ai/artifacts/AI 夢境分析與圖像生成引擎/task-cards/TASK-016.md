# AI-Ready 任務卡

## Metadata

- 任務：AI 引擎架構基礎：/api/dream-analysis 路由骨架
- 上層規格：ai/artifacts/AI 夢境分析與圖像生成引擎/feature-spec.md
- 上層 Epic：AI 夢境分析與圖像生成引擎
- 上層 User Story：Gemini 結構化分析 API
- 分軌：後端
- 前置任務（dependsOn）：TASK-001、TASK-002、TASK-003、TASK-004、TASK-005、TASK-006、TASK-007、TASK-008、TASK-009
- 狀態：完成
- 風險等級：中
- Agent owner：Claude Code
- 人工核准者：zoewang7512（2026-08-14，審核完成證據並驗收）

## 目標

建立後端 /api/dream-analysis 路由骨架、Gemini client 初始化、請求驗證與統一錯誤回應格式，供後續各卡片擴充。

## 情境包（Context Pack）

- 相關檔案：
  - server/routes/dream-analysis.ts
  - server/lib/gemini-client.ts
- 既有模式：
  - 沿用 Epic0 TASK-001 的 Express app 結構；錯誤回應統一格式 { errorType, message }
- 假設：
  - 無
- 未知事項：
  - 無
- 允許變更的檔案：
  - server/**
- 不得觸碰：
  - 不得在此卡片實作最終 prompt 內容或圖片組裝邏輯（屬後續卡片）

## 需求

- POST /api/dream-analysis 接受 { content: string }，缺少或空白時回傳 400。
- 初始化 Gemini client（讀取 GEMINI_API_KEY，缺少時依 Epic0 TASK-002 的 fail-fast 規則處理）。
- 統一錯誤回應格式，含 errorType 欄位。

## 驗收標準

- 空 body 或空 content 回傳 400。
- 路由骨架可被後續卡片擴充而不需重構。

## 實作備註

- 開工前先讀 `ai/context/design-system.md`（若為前端/UI 任務），能重用既有 token 與元件就必須重用。
- 若需要探索現成套件（例如圖表函式庫），列 2-3 個選項附優劣與建議，只有明顯唯一選擇時才不用問。

## 驗證契約

- 單元測試：請求驗證邏輯測試
- 整合測試：路由層基本整合測試（mock Gemini client）
- E2E 測試：無
- 型別檢查：tsc --noEmit
- Lint：專案 lint 指令
- Build：無額外
- 螢幕截圖：無
- 安全性檢查：確認金鑰只在伺服器端讀取

## 完成證據

- 變更的檔案：
  - `server/lib/gemini-client.ts`（新增，`createGeminiClient(apiKey)` 封裝 `@google/genai` 的 `GoogleGenAI` 初始化）
  - `server/lib/gemini-client.test.ts`（新增，1 個單元測試）
  - `server/routes/dream-analysis.ts`（新增，`POST /api/dream-analysis` 路由骨架：請求驗證＋統一錯誤格式＋以依賴注入方式接受 `analyzeDream` 實作，預設為尚未實作時回傳 `upstream_error`）
  - `server/routes/dream-analysis.test.ts`（新增，5 個整合測試，用 `node:http`＋原生 `fetch` 啟動真實 server 測試，未新增 supertest 依賴）
  - `server/app.ts`（更新，從直接 export 一個 `app` 實例改為 `createApp(client, analyzeDream?)` 工廠函式，掛載新路由；改動原因見下方決策摘要）
  - `server/index.ts`（更新，改用 `createGeminiClient` + `createApp` 組裝伺服器，維持原本 `loadConfig` fail-fast 行為不變）
  - `api/index.ts`（更新，Vercel serverless entry 原本直接 re-export `server/app` 的 default export，因 `app.ts` 改為具名的工廠函式而必須同步更新，否則 `tsc --noEmit` 會直接報錯；屬本次重構的必要連帶修正，非範圍外變更）
  - `package.json` / `package-lock.json`（新增依賴 `@google/genai@2.17.1`）
- 決策摘要：
  - **Gemini SDK 選型**（`ai/skills/implementation-plan.md` 慣例要求探索現成套件時列 2-3 個選項）：
    1. `@google/genai`（**採用**，npm 最新版 2.17.1）：Google 目前官方維護的統一 Gemini API SDK，涵蓋 Gemini API 與 Vertex AI，`new GoogleGenAI({apiKey})` 建立 client。
    2. `@google/generative-ai`（npm 最新版僅 0.24.1，Google 官方文件已標示為舊版、建議遷移至 `@google/genai`）：不採用，避免用一個官方已在淘汰的套件。
    3. 純 `fetch` 直接打 Gemini REST API（零依賴）：不採用，需自行處理型別、錯誤格式、串流等細節，重造官方 SDK 已提供的輪子，不符合專案「優先採用既有模式、避免不必要抽象」但這裡反過來是「避免不必要的手刻」。
    - 三個選項裡 `@google/genai` 是官方目前唯一持續維護的版本，屬於「明顯唯一選擇」，故直接採用未另外詢問人工。
  - **`app.ts` 從直接匯出 `app` 實例改為 `createApp(client, analyzeDream?)` 工廠函式**：因為路由現在需要注入 `GoogleGenAI` client（以及後續 TASK-017 要注入的 `analyzeDream` 實作），若 `app.ts` 在 import 時就直接建立 client，會讓任何單純想測試路由的測試檔案都被迫需要一組（哪怕是假的）API 金鑰，且違反 `config.ts` 已經建立的「用函式回傳、呼叫方決定何時執行副作用」慣例。改為工廠函式後：`server/index.ts`（真實啟動）與測試檔（`dream-analysis.test.ts`）都可以各自注入自己的 client / mock，`app.ts` 本身不再有任何 import-time 副作用。
  - **`analyzeDream` 用依賴注入而非直接在路由裡呼叫 Gemini**：滿足任務卡「不得在此卡片實作最終 prompt 內容或圖片組裝邏輯」的限制，同時滿足「路由骨架可被後續卡片擴充而不需重構」的驗收標準——TASK-017 只需要實作一個符合 `AnalyzeDream` 型別的函式並傳入 `createApp`／`createDreamAnalysisRouter`，不需要碰路由本身的驗證/錯誤處理邏輯。
  - 錯誤回應統一格式 `{ errorType, message }`，`errorType` 型別先把 feature-spec 列出的五種都定義好（`invalid_request`/`timeout`/`quota_exceeded`/`invalid_response`/`upstream_error`），但本卡只會實際觸發 `invalid_request`（驗證失敗）與 `upstream_error`（`analyzeDream` 尚未實作或拋錯的預設 fallback）；其餘三種留給 TASK-017／TASK-021 依實際 Gemini 呼叫情境觸發。
- 設計系統對照：不適用（純後端，無 UI 變更）。
- 執行過的指令：
  - `npm install @google/genai` → 新增 33 個套件，0 個已知漏洞。
  - `npx tsc --noEmit` → 通過（含修正 `api/index.ts` 因介面變更產生的型別錯誤）。
  - `npx eslint .` → 通過。
  - `npx vitest run` → 通過（22 個測試檔案、90 個測試全數通過，含本卡新增的 6 個測試）。
  - `npx vite build` → 建置成功；額外用 `grep -rl "GEMINI\|genai\|GoogleGenAI" dist/` 確認前端建置產物完全不含後端相關字串（正式的金鑰洩漏掃描留給高風險的 TASK-020，這裡只是本卡順手做的健檢）。
  - 手動啟動驗證：`GEMINI_API_KEY=fake-test-key PORT=3099 npx tsx server/index.ts`，以 `curl` 分別打 `GET /api/health`（200 `{"status":"ok"}`）、`POST /api/dream-analysis` 空 body（400 `invalid_request`）、`POST /api/dream-analysis` 帶合法 `content`（502 `upstream_error`，符合「尚未實作 analyzeDream」的預期行為）。
- 測試輸出：`Test Files  22 passed (22)` / `Tests  90 passed (90)`。
- 螢幕截圖：不適用（純後端 API，無 UI）。
- 安全性檢查：`GEMINI_API_KEY` 全程只透過 `server/index.ts`／`api/index.ts` 呼叫既有的 `loadConfig()` 從 `process.env` 讀取一次、傳給 `createGeminiClient`；`server/app.ts`、`server/routes/dream-analysis.ts` 都只透過參數接收已初始化的 client，本身不讀取任何環境變數，也未把金鑰放進任何回應或錯誤訊息。完整的金鑰洩漏掃描（原始碼＋build 產物系統性搜尋、`.gitignore` 覆蓋確認）屬於高風險的 TASK-020，本卡不重複做。
- 已知限制：
  - 本卡完全沒有呼叫真實 Gemini API（不允許碰 prompt/分析邏輯），因此無法驗證 `@google/genai` 實際打 API 是否順利；等使用者提供 `GEMINI_API_KEY` 並完成 TASK-017 實作後，會在 TASK-017 補做一次真實呼叫驗證。
  - Review gates：本卡風險等級為「中」，依 `AGENTS.md`「高風險工作需要架構、安全性與測試審查關卡」的規則不強制觸發，但仍待人工驗收；若人工希望比照高風險流程多一層架構審查，也歡迎另外要求。
- 後續任務：TASK-017（Gemini 結構化分析 API 實作）可直接在 `createDreamAnalysisRouter` 現有骨架上，實作真正的 `AnalyzeDream` 函式並注入，不需重構本卡的路由/驗證/錯誤處理程式碼。

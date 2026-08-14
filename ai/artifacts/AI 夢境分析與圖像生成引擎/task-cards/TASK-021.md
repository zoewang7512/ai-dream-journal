# AI-Ready 任務卡

## Metadata

- 任務：Gemini/Pollinations 呼叫失敗、逾時、額度超限的錯誤處理
- 上層規格：ai/artifacts/AI 夢境分析與圖像生成引擎/feature-spec.md
- 上層 Epic：AI 夢境分析與圖像生成引擎
- 上層 User Story：呼叫失敗/逾時/額度超限的錯誤處理
- 分軌：後端
- 前置任務（dependsOn）：TASK-017
- 狀態：完成
- 風險等級：低
- Agent owner：Claude Code
- 人工核准者：zoewang7512（2026-08-14，審核完成證據並驗收）

## 目標

為 Gemini 呼叫加上逾時與錯誤分類處理，回傳結構化錯誤供前端顯示對應提示，並加上基本防濫用機制。

## 情境包（Context Pack）

- 相關檔案：
  - server/routes/dream-analysis.ts
  - server/lib/gemini-client.ts
- 既有模式：
  - 逾時門檻 15 秒；錯誤分類：timeout/quota_exceeded/invalid_response/upstream_error
- 假設：
  - 防濫用機制以基本 origin 檢查或簡易記憶體內速率限制實作即可，不需引入額外資料庫（單人專案、低流量）
- 未知事項：
  - 無
- 允許變更的檔案：
  - server/**
- 不得觸碰：
  - 依 AGENTS.md 一般規則：不得變更不相關檔案

## 需求

- Gemini 呼叫逾時（>15 秒）需主動中止並回傳 errorType=timeout。
- Gemini 回傳額度/配額錯誤時，對應 errorType=quota_exceeded。
- 端點加上基本 origin 檢查或速率限制，非預期來源或超額請求回傳 429/403。

## 驗收標準

- 模擬逾時、額度錯誤、非預期格式三種情境，皆回傳對應 errorType 而非讓請求掛住或 500 崩潰。
- 模擬異常來源或高頻請求，防濫用機制生效。

## 實作備註

- 開工前先讀 `ai/context/design-system.md`（若為前端/UI 任務），能重用既有 token 與元件就必須重用。
- 若需要探索現成套件（例如圖表函式庫），列 2-3 個選項附優劣與建議，只有明顯唯一選擇時才不用問。

## 驗證契約

- 單元測試：錯誤分類與逾時邏輯測試
- 整合測試：mock 逾時/額度錯誤情境的整合測試
- E2E 測試：無
- 型別檢查：tsc --noEmit
- Lint：專案 lint 指令
- Build：無額外
- 螢幕截圖：無
- 安全性檢查：防濫用機制（origin 檢查/速率限制）驗證

## 完成證據

- 變更的檔案：
  - `server/lib/analyze-dream.ts`（呼叫 Gemini 時帶上 `abortSignal: AbortSignal.timeout(15000)`；`catch` 區塊改為先判斷 `ApiError` 且 `status === 429` → `quota_exceeded`，再判斷 `error.name` 為 `TimeoutError`/`AbortError` → `timeout`，其餘才落回既有的 `upstream_error`）
  - `server/lib/analyze-dream.test.ts`（新增 4 個測試：429 ApiError 分類為 quota_exceeded、非 429 ApiError 仍為 upstream_error、TimeoutError 分類為 timeout、確認 generateContent 有收到 abortSignal）
  - `server/lib/rate-limiter.ts`（新增，`createRateLimiter({ windowMs, max })`：單一 process 記憶體內、依 `req.ip` 分桶的固定視窗限流器，超過門檻回 429 + `{ errorType: "rate_limited" }`）
  - `server/lib/rate-limiter.test.ts`（新增，5 個單元測試：正常放行、超過門檻擋下、不同 IP 互不影響、視窗過期後重置）
  - `server/lib/dream-analysis-types.ts`（`DreamAnalysisErrorType` 新增 `"rate_limited"`）
  - `server/routes/dream-analysis.ts`（`ERROR_STATUS` 新增 `rate_limited: 429`；`POST /api/dream-analysis` 掛上 `createRateLimiter`，預設每 IP 每 60 秒最多 10 次；`createDreamAnalysisRouter` 新增第三個可選參數 `rateLimitOptions` 供測試調整門檻）
  - `server/routes/dream-analysis.test.ts`（新增整合測試：同一 IP 超過設定門檻時回 429 + `errorType=rate_limited`）
  - `server/app.ts`（`createApp` 新增可選參數 `dreamAnalysisRateLimit`，向下傳遞給 `createDreamAnalysisRouter`，供測試與未來調整門檻使用）
- 決策摘要：
  - 逾時偵測：透過 `AbortSignal.timeout(15000)` 讓 SDK 在 15 秒後主動中止請求；分類時同時容忍 `TimeoutError`（`AbortSignal.timeout` 的標準 reason 名稱）與 `AbortError`（一般手動 abort 的名稱），避免依賴單一 SDK 版本的確切錯誤命名。
  - 額度超限偵測：`@google/genai` 的 `ApiError` 帶有 `status`（HTTP 狀態碼），429 對應 Gemini 的 Resource Exhausted，用它分類比字串比對 `error.message` 更穩定。
  - 防濫用機制依任務卡假設選用「簡易記憶體內速率限制」（而非 origin 檢查）：每個 IP 固定視窗計數，超過回 429，不需額外資料庫或套件，符合單人專案、低流量的情境；已知限制見下方。
- 設計系統對照：不適用（純後端，無 UI）。
- 執行過的指令：
  - `npx tsc --noEmit` → 通過。
  - `npx eslint .` → 通過。
  - `npx vitest run` → 通過（29 個測試檔案、153 個測試全數通過，含本卡新增的 10 個測試）。
  - `npx vite build` → 建置成功，前端 bundle 大小與前一版本相同（本卡為純後端改動，不影響前端 bundle）。
- 測試輸出：`Test Files  29 passed (29)` / `Tests  153 passed (153)`。
- 螢幕截圖：不適用（純後端任務，無 UI）。
- 已知限制：
  - 記憶體內速率限制只在單一 Node process 內生效；若未來部署到會啟動多個平行 serverless 實例的環境，同一使用者的請求可能分散到不同實例、限流門檻形同虛設。任務卡的假設已明確接受這個取捨（單人專案、低流量），但若之後改成多實例部署需重新評估（例如改用 Redis 等共享狀態）。
  - `req.ip` 在無自訂 `trust proxy` 設定下依 Express 預設行為（socket 位址，或受信任代理鏈的 X-Forwarded-For）判斷；未針對此專案的實際部署環境做進一步 proxy 信任鏈調整，維持 Express 預設值。
  - 逾時（15 秒）與額度分類邏輯依賴 `@google/genai` SDK 目前版本（2.17.1）的 `ApiError.status` 與中止時的 `error.name` 慣例；SDK 大版本升級時應重新確認這兩個假設仍成立。
- 後續任務：無（本卡完成 TASK-021 全部驗收範圍）。

# AI-Ready 任務卡

## Metadata

- 任務：Gemini 上游錯誤訊息脫敏
- 上層規格：ai/artifacts/AI 夢境分析與圖像生成引擎/feature-spec.md
- 上層 Epic：AI 夢境分析與圖像生成引擎
- 上層 User Story：Gemini 結構化分析 API
- 分軌：後端
- 前置任務（dependsOn）：TASK-017、TASK-020
- 狀態：完成
- 風險等級：中
- Agent owner：Claude Code
- 人工核准者：zoewang7512（2026-08-14，審核完成證據並驗收）

## 目標

`/api/dream-analysis` 呼叫 Gemini 失敗時，不得把上游 SDK 的原始錯誤訊息（`error.message`）原樣回傳給前端，避免夾帶專案代號、模型名稱、配額等內部細節，並降低未來傳輸機制變動時意外洩漏敏感資訊的風險。

## 情境包（Context Pack）

- 相關檔案：
  - server/lib/analyze-dream.ts（第 73-76 行：`catch` 區塊把 `error.message` 包進 `DreamAnalysisError`）
  - server/lib/dream-analysis-types.ts（`DreamAnalysisError` 定義）
  - server/routes/dream-analysis.ts（第 55-65 行左右：把 `DreamAnalysisError` 的訊息放進 HTTP 回應 body）
  - server/routes/dream-analysis.test.ts
- 既有模式：
  - 非 `DreamAnalysisError` 的例外走固定文案分支（已存在，可參考其寫法）。
- 假設：
  - 伺服器端 log／debug 仍可保留完整原始錯誤，只有回給前端的 HTTP 回應需要脫敏。
- 未知事項：
  - 無
- 允許變更的檔案：
  - server/**
- 不得觸碰：
  - 前端 src/**（此卡純後端錯誤處理）

## 需求

- `upstream_error` 類型的錯誤，回應前端的訊息改為固定文案（不含 `error.message` 原文）。
- 原始錯誤訊息可保留在伺服器端（例如傳給 log 或維持在 `cause` 供伺服器內部除錯），不得出現在 HTTP response body。
- 其餘既有錯誤分類（`invalid_response` 等）行為不變。

## 驗收標準

- 對 `/api/dream-analysis` 送出會觸發 Gemini SDK 拋錯的情境（測試以 mock 模擬），回應 body 不含任何 mock 的原始錯誤字串，只含固定文案。
- 既有測試（`server/routes/dream-analysis.test.ts`、`server/lib/analyze-dream.test.ts`）全數通過，不因此改動而回歸。

## 實作備註

- 本卡源自 TASK-020 Security Gate 審查的附帶發現（F1），詳見 [TASK-020.md](TASK-020.md) 完成證據。
- 開工前先讀 `ai/context/design-system.md`：不適用（無 UI 變更）。

## 驗證契約

- 單元測試：analyze-dream.ts 錯誤處理分支測試
- 整合測試：dream-analysis 路由回應內容測試（確認不含原始錯誤字串）
- E2E 測試：無
- 型別檢查：tsc --noEmit
- Lint：專案 lint 指令
- Build：vite build 成功
- 螢幕截圖：無
- 安全性檢查：確認回應 body 不含上游錯誤原文

## 完成證據

- 變更的檔案：
  - `server/lib/analyze-dream.ts`（`upstream_error` 分支不再把 `error.message` 原文包進 `DreamAnalysisError`，改用固定文案「Gemini API 呼叫失敗，請稍後再試。」；原始錯誤仍透過 `{ cause: error }` 保留，並在拋出前加一行 `console.error("[analyzeDream] Gemini API 呼叫失敗：", error)` 寫進伺服器端 log，避免脫敏後完全失去除錯資訊）
  - `server/lib/analyze-dream.test.ts`（新增測試：模擬 Gemini 拋出含敏感字串的錯誤，斷言 `DreamAnalysisError.message` 不含原文、等於固定文案，`cause` 仍保留原始錯誤，且 `console.error` 有被呼叫）
  - `server/routes/dream-analysis.test.ts`（新增端到端整合測試：用真正的 `analyzeDream` 實作＋會拋出敏感字串的假 Gemini client，透過真實 HTTP 呼叫 `/api/dream-analysis`，斷言回應 body 全文不含該敏感字串，且仍是 `{errorType: "upstream_error", message: string}` 的既有格式）
- 決策摘要：
  - 只調整 `analyze-dream.ts` 這一個節點（錯誤產生源頭），不改動 `server/routes/dream-analysis.ts` 的轉發邏輯——路由層本來就單純把 `DreamAnalysisError.message` 原樣回傳，這個行為本身沒問題，問題在於 `analyze-dream.ts` 之前把不受信任的上游原文塞進了這個本該安全的欄位。修好源頭比在路由層加白名單/過濾邏輯更小、更不會有遺漏。
  - `invalid_response`／`timeout`／`quota_exceeded` 三種既有分類本來就已經是專案自訂的固定文案（非上游原文），不受影響，維持原樣。
  - 新增 `console.error` 是為了不讓脫敏後完全失去伺服器端除錯能力（任務卡假設明確允許「伺服器端 log／debug 仍可保留完整原始錯誤」）；只在真正落到 `upstream_error`（未被歸類為 timeout/quota_exceeded 的例外）時記錄一次，不影響其他分支。
- 設計系統對照：不適用（純後端，無 UI）。
- 執行過的指令：
  - `npx tsc --noEmit` → 通過。
  - `npx eslint .` → 通過。
  - `npx vitest run` → 通過（29 個測試檔案、155 個測試全數通過，含本卡新增的 2 個測試）。
  - `npx vite build` → 建置成功，前端 bundle 大小與前一版本相同（純後端改動）。
- 測試輸出：`Test Files  29 passed (29)` / `Tests  155 passed (155)`。
- 螢幕截圖：不適用（純後端任務，無 UI）。
- 已知限制：
  - `console.error` 目前只是印到 stdout/stderr，尚未接上任何集中式 log 服務；若之後要做正式的錯誤監控/告警，需要另外規劃（不在本卡範圍）。
  - 本卡只處理 `/api/dream-analysis`（Gemini 文字分析端點）；`/api/dream-image`（Pollinations 圖片端點）目前的錯誤處理已經是固定文案，未發現同類洩漏問題，故未變動。
- 後續任務：無（TASK-020 Security Gate 審查的 F1 發現已由本卡解決）。

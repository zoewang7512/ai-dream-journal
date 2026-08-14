# AI-Ready 任務卡

## Metadata

- 任務：/api/dream-image 端點防濫用（驗證、rate limit、逾時）
- 上層規格：ai/artifacts/AI 夢境分析與圖像生成引擎/feature-spec.md
- 上層 Epic：AI 夢境分析與圖像生成引擎
- 上層 User Story：圖片生成端點防濫用
- 分軌：後端
- 前置任務（dependsOn）：TASK-018、TASK-020
- 狀態：完成
- 風險等級：中
- Agent owner：Claude Code
- 人工核准者：zoewang7512（2026-08-14，審核完成證據並驗收）

## 目標

`/api/dream-image` 目前無身分驗證、無 rate limit、無 prompt 長度上限、無 fetch timeout，任何第三方網頁只要嵌入 `<img src="https://<host>/api/dream-image?prompt=...&seed=1">` 就能消耗專案的 Pollinations 付費配額（金鑰值本身未外洩，但金鑰「效用」形同公開）。本卡要把這個端點收斂成只給本應用前端使用。

## 情境包（Context Pack）

- 相關檔案：
  - server/routes/dream-image.ts（第 21-51 行整支路由）
  - server/routes/dream-image.test.ts
  - server/app.ts（掛載路由與中介層的地方）
- 既有模式：
  - 無（專案目前沒有其他需要 rate limit 或來源限制的端點可參考）
- 假設：
  - 前端與後端同源部署（依 vercel.json／app.ts 現況），可用 Origin/Referer 或同源 session 機制限制來源；實際策略由實作前先確認。
- 未知事項：
  - 是否要引入第三方 rate limit 套件（例如 express-rate-limit）或手寫記憶體節流，需要在實作前列選項讓人工確認。
- 允許變更的檔案：
  - server/**
- 不得觸碰：
  - 前端 src/**（除非為了帶入必要的來源識別資訊，需先確認）

## 需求

- prompt 長度加上上限（例如 1000 字），超過回 400。
- 對上游 fetch 呼叫加上 timeout（例如 `AbortSignal.timeout`），逾時回 502 並給清楚錯誤訊息。
- 加上 per-IP（或同源限定）rate limit，超過時回 429。
- 限制來源（例如 Origin/Referer 檢查，或改為要求同源 session），阻擋第三方網頁直接嵌入呼叫。

## 驗收標準

- 超長 prompt 回 400，不會打上游 API。
- 上游逾時情境（測試以 mock 模擬延遲）回 502，且不會無限等待。
- 短時間內超過 rate limit 門檻回 429。
- 非允許來源的請求被拒絕（測試以偽造 Origin/Referer 驗證）；本應用前端的正常請求不受影響。
- 既有測試（`server/routes/dream-image.test.ts`）全數通過，不因此改動而回歸。

## 實作備註

- 本卡源自 TASK-020 Security Gate 審查的附帶發現（F2），詳見 [TASK-020.md](TASK-020.md) 完成證據。
- 若需引入 rate limit 套件，列 2-3 個選項附優劣與建議（例如 express-rate-limit vs. 手寫記憶體節流），只有明顯唯一選擇時才不用問。
- 開工前先讀 `ai/context/design-system.md`：不適用（無 UI 變更）。

## 驗證契約

- 單元測試：長度驗證、rate limit 邏輯、來源檢查的個別單元測試
- 整合測試：`/api/dream-image` 路由端到端情境測試（超長 prompt、逾時、超過 rate limit、非允許來源）
- E2E 測試：無
- 型別檢查：tsc --noEmit
- Lint：專案 lint 指令
- Build：vite build 成功
- 螢幕截圖：無
- 安全性檢查：確認端點無法被非本應用來源濫用消耗付費配額

## 完成證據

- 變更的檔案：
  - `server/lib/origin-guard.ts`（新增，`createOriginGuard()`：比對 `Referer` header 的 host 與請求本身的 `Host` header，不同或缺少 Referer 一律 403。刻意比對 host 而非完整 origin，避免依賴 `req.protocol`——Vercel 等反向代理環境下未設 trust proxy 時 `req.protocol` 可能誤判成 http）
  - `server/lib/origin-guard.test.ts`（新增，5 個單元測試：同源放行、忽略 scheme 差異、缺 Referer 擋下、跨網域 Referer 擋下、無效 URL 格式的 Referer 擋下）
  - `server/routes/dream-image.ts`（`GET /api/dream-image` 依序掛上 `createOriginGuard()` → `createRateLimiter()` → 既有 handler；新增 `MAX_PROMPT_LENGTH=1000` 長度檢查（超過回 400，不打上游）；`fetchImpl` 呼叫加上 `signal: AbortSignal.timeout(requestTimeoutMs)`（預設 20 秒）；`createDreamImageRouter` 新增第三個可選參數 `{ rateLimit, requestTimeoutMs }` 供測試調整門檻）
  - `server/routes/dream-image.test.ts`（改寫：新增 `getDreamImage()` 測試輔助函式預設帶同源 Referer，避免每個既有測試都要手動補 header；新增 8 個測試：prompt 過長、abort signal 有正確傳給上游 fetch、上游逾時回 502、來源限制三種情境（缺 Referer/跨網域 Referer/同源 Referer）、rate limit 超過回 429）
- 決策摘要：
  - 來源限制策略：與您確認後選擇「只做 Referer host 比對」（而非改前端成 fetch+blob 帶自訂 header）。理由：圖片目前是用 `<img src="/api/dream-image?...">` 同源相對路徑載入（`src/pages/journal/EntryDetailReadonly.tsx`），瀏覽器預設會送出同源 Referer（專案未設定任何 `Referrer-Policy`，預設值 `strict-origin-when-cross-origin` 對同源請求一律送出完整 Referer）；不需要改動前端渲染方式即可擋下第三方網頁直接嵌入 `<img>` 盜用的主要威脅模型，符合任務卡「不得觸碰前端 src/**（除非為了帶入必要的來源識別資訊，需先確認）」的最小變更原則。已知這個防護對非瀏覽器工具（curl 等直接偽造 Referer 的請求）沒有效果，見下方「已知限制」。
  - 用 `Host` header 而非完整 origin／`req.protocol` 判斷同源：Vite dev proxy（`vite.config.ts` 的 `/api` → `localhost:3001`）預設不改寫 Host header，瀏覽器端 Referer 與後端收到的 Host 都會是前端來源（例如 `localhost:5173`），本機開發與正式環境（Vercel 同網域）都能正確運作，且不受反向代理環境下 `req.protocol` 判斷失準影響。
  - Rate limit：直接重用 TASK-021 已建立的 `server/lib/rate-limiter.ts`（同一套簡易記憶體限流器），不引入新套件，符合任務卡假設與「優先採用既有專案模式」的原則；門檻採與 TASK-021 相同的預設值（每 IP 每 60 秒 10 次）——圖片只在單筆日記詳情頁載入一次且有長效不可變快取，不像列表頁會同時載入多張，這個門檻對正常使用足夠寬鬆。
  - Timeout 門檻抓 20 秒（比 TASK-021 的 Gemini 15 秒略寬），因為圖片生成一般比純文字分析慢。
- 設計系統對照：不適用（純後端，無 UI）。
- 執行過的指令：
  - `npx tsc --noEmit` → 通過。
  - `npx eslint .` → 通過。
  - `npx vitest run` → 通過（30 個測試檔案、167 個測試全數通過，含本卡新增的 13 個測試）。
  - `npx vite build` → 建置成功，前端 bundle 大小與前一版本相同（純後端改動）。
- 測試輸出：`Test Files  30 passed (30)` / `Tests  167 passed (167)`。
- 螢幕截圖：不適用（純後端任務，無 UI）。
- 已知限制：
  - Referer 檢查對直接偽造 HTTP 請求的工具（curl、腳本等，非瀏覽器）沒有防護力——這類工具可以自行帶上任意 Referer header 繞過。這個機制防的是「第三方網頁把 `<img src>` 指向本站端點」這種瀏覽器情境下的濫用，不是通用的身分驗證；如果之後需要更強的保護（例如真正防止腳本化濫用），需要額外的身分驗證機制（不在本卡範圍）。
  - 部分瀏覽器隱私設定／擴充套件會清空 Referer，這類使用者的正常請求會被擋下（回 403）；任務卡本身在需求段落已預期並接受這個取捨（"限制來源...阻擋第三方網頁直接嵌入呼叫"），且專案沒有主動設定 `Referrer-Policy` 限縮 Referer，屬於低機率邊界案例。
  - 記憶體內限流與 TASK-021 相同限制：僅單一 process 內生效，多實例 serverless 部署時效果打折。
  - **驗證過程中的意外事件**：手動用 curl 對本機正在跑的既有 dev server（port 3001，PID 9020，看起來是本次對話開始前就已啟動、尚未套用本卡改動的舊 process）做了 3 次探測請求，其中 1 次（原本預期會被 400 擋下的超長 prompt）因為該 process 還是本卡改動前的舊程式碼，實際打到了真正的 Pollinations 付費 API 並收到一張真實圖片（金額可忽略但仍是非預期的真實外部呼叫）。已立即停止對該 process 的進一步手動測試，改以完全隔離、mock fetch 的自動化測試（`vitest`）驗證新邏輯，不會再對外發出真實請求。該舊 process 目前仍在執行中，尚未套用本卡的程式碼改動；是否要重啟它請您決定（我沒有主動關閉，因為不確定是否為您手動啟動、有其他用途）。
- 後續任務：無（TASK-020 Security Gate 審查的 F2 發現已由本卡解決）。若您想重啟 port 3001 的 dev server 讓它套用本卡改動，請告訴我。

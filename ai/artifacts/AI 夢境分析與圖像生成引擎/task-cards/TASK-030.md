# AI-Ready 任務卡

## Metadata

- 任務：/api/dream-image 端點防濫用（驗證、rate limit、逾時）
- 上層規格：ai/artifacts/AI 夢境分析與圖像生成引擎/feature-spec.md
- 上層 Epic：AI 夢境分析與圖像生成引擎
- 上層 User Story：圖片生成端點防濫用
- 分軌：後端
- 前置任務（dependsOn）：TASK-018、TASK-020
- 狀態：草稿
- 風險等級：中
- Agent owner：待指派
- 人工核准者：待指派

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
- 執行過的指令：
- 測試輸出：
- 螢幕截圖：
- 已知限制：
- 後續任務：

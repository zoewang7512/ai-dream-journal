# AI-Ready 任務卡

## Metadata

- 任務：建立 .env 規範與金鑰啟動檢查
- 上層規格：ai/artifacts/專案設置/feature-spec.md
- 上層 Epic：專案設置
- 上層 User Story：環境變數與金鑰設定
- 分軌：後端
- 前置任務（dependsOn）：無
- 狀態：完成
- 風險等級：中
- Agent owner：Claude Code
- 人工核准者：zoewang7512（指示「接續 TASK-002」，2026-08-13；任務卡範圍已明確，未有待決設計選項，故未另外提問即開工；審核完成並驗收，2026-08-13）

## 目標

建立 .env.example 與 .gitignore 規則，確保 GEMINI_API_KEY 等機密只存在後端環境變數，且缺少時後端啟動要 fail fast。

## 情境包（Context Pack）

- 相關檔案：
  - .env.example
  - .gitignore
  - server/config.ts 或等效設定載入模組
- 既有模式：
  - Node 內建 process.env 讀取，不需額外套件也可（若專案已引入 dotenv 則沿用）
- 假設：
  - 需要的變數至少含 GEMINI_API_KEY；其餘變數視後端實作需要於實作時補上並同步更新 .env.example
- 未知事項：
  - 無
- 允許變更的檔案：
  - .env.example
  - .gitignore
  - server/**
- 不得觸碰：
  - 不得提交任何真實金鑰到版本控制
  - ai/、tools/kanban/ 治理檔案不得修改

## 需求

- `.env.example` 列出所有後端需要的環境變數名稱與說明（不含真實值）。
- `.gitignore` 排除 `.env`。
- 後端啟動時若缺少 GEMINI_API_KEY，需記錄明確錯誤並中止啟動（fail fast），不得靜默略過。

## 驗收標準

- 刻意移除 .env 後啟動後端，會看到明確的缺少金鑰錯誤訊息且進程結束，而非後續呼叫時才失敗。
- `git status` 確認 .env 不會被追蹤。

## 實作備註

- 開工前先讀 `ai/context/design-system.md`（若為前端/UI 任務），能重用既有 token 與元件就必須重用。
- 若需要探索現成套件（例如圖表函式庫），列 2-3 個選項附優劣與建議，只有明顯唯一選擇時才不用問。

## 驗證契約

- 單元測試：啟動檢查邏輯的單元測試（mock 環境變數缺失情境）
- 整合測試：無
- E2E 測試：無
- 型別檢查：tsc --noEmit
- Lint：專案 lint 指令
- Build：無額外
- 螢幕截圖：無
- 安全性檢查：確認 .env 不在 git 追蹤範圍內、金鑰不出現在任何已提交檔案

## 完成證據

- 變更的檔案：
  - `.env.example`（新增，列出 `GEMINI_API_KEY`、`PORT`）
  - `.gitignore`（新增 `!.env.example` 例外，避免既有的 `.env.*` 規則連 `.env.example` 一起忽略）
  - `server/config.ts`（新增，`loadConfig(env?)` 讀取並驗證 `GEMINI_API_KEY`，缺少時 throw 明確錯誤訊息；一併解析 `PORT`，預設 3001；以 `process.loadEnvFile(".env")` 盡力載入本機 `.env`，檔案不存在或不支援時安靜略過，不影響檢查本身）
  - `server/config.test.ts`（新增，涵蓋缺少/空值 `GEMINI_API_KEY` 會 throw、有金鑰時回傳正確設定、`PORT` 可覆寫預設值）
  - `server/index.ts`（本機啟動入口改為先呼叫 `loadConfig()`，失敗時 `console.error` 明確訊息並 `process.exit(1)`，成功才 `app.listen()`）
  - `api/index.ts`（serverless 進入點在模組頂層呼叫 `loadConfig()`，冷啟動時若缺金鑰即丟出例外並終止該次呼叫，不會等到實際呼叫 Gemini 才失敗）
- 設計決策：
  - 沿用 Node 內建 `process.loadEnvFile`，未引入 `dotenv` 套件（符合任務卡「不需額外套件也可」的假設，專案目前也還沒有引入 dotenv）。
  - `loadConfig` 接受可選的 `env` 參數（預設 `process.env`），方便單元測試以 mock 物件驗證缺失情境，不需要動到真正的 `process.env`。
  - 沒有新增整合測試：任務卡驗證契約明確寫「整合測試：無」，改以手動啟動情境驗證（見下方指令）涵蓋 fail-fast 行為。
- 執行過的指令與結果：
  - `git check-ignore .env` → exit 0（已忽略）；`git check-ignore .env.example` → exit 1（未忽略，可正常追蹤）。
  - `npx tsc --noEmit` → 通過。
  - `npx eslint .` → 通過。
  - `npx vitest run` → 2 個測試檔、5 個測試全數通過（含新增的 4 個 `config.test.ts` 案例）。
  - `npm run build` → 成功產出 `dist/`。
  - 手動驗證 fail-fast：確認本機無 `.env` 檔案，執行 `GEMINI_API_KEY= npx tsx server/index.ts` → 立即印出「Missing required environment variable: GEMINI_API_KEY. Copy .env.example to .env and set a value.」且 `exit code: 1`，未啟動 HTTP 伺服器、也未等到後續呼叫才失敗。
  - 手動驗證正常啟動：執行 `GEMINI_API_KEY=fake-test-key npx tsx server/index.ts`，伺服器成功監聽 3001，`curl http://localhost:3001/api/health` → `{"status":"ok"}`。
  - `git grep -n "GEMINI_API_KEY"`（排除 node_modules）→ 僅出現在文件與程式碼的變數名稱，未發現任何硬編碼的真實金鑰值。
- 已知限制：
  - `api/index.ts` 的 fail-fast 是讓例外在模組頂層拋出，交由 Vercel 平台將該次呼叫標記為失敗並記錄清楚錯誤；與本機 `process.exit(1)` 的語意略有不同（serverless 情境沒有「進程」可退出），但同樣做到「不落到呼叫 Gemini 時才失敗」。
  - 尚未有任何路由實際使用 `geminiApiKey`（目前只有 `/api/health`），實際串接 Gemini API 代理留給後續 Epic 任務。
  - Review gates（product/ui/architecture/security/test/code_review）尚待人工審核確認。
- 後續任務：後續 Epic（AI 夢境分析與圖像生成引擎，見 TASK-016）串接 Gemini client 時可直接沿用 `server/config.ts` 的 `geminiApiKey`。

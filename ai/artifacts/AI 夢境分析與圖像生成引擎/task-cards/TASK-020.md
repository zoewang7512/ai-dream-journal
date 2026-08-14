# AI-Ready 任務卡

## Metadata

- 任務：API 金鑰安全代理驗證
- 上層規格：ai/artifacts/AI 夢境分析與圖像生成引擎/feature-spec.md
- 上層 Epic：AI 夢境分析與圖像生成引擎
- 上層 User Story：API 金鑰安全代理
- 分軌：後端
- 前置任務（dependsOn）：TASK-016
- 狀態：完成
- 風險等級：高
- Agent owner：Claude Code
- 人工核准者：zoewang7512（2026-08-14，審核完成證據並驗收）

## 目標

確保 Gemini API 金鑰全程只存在後端環境變數，前端 bundle 與版本控制皆搜尋不到金鑰字串。

## 情境包（Context Pack）

- 相關檔案：
  - server/lib/gemini-client.ts
  - src/**（僅供搜尋驗證，不應找到金鑰）
- 既有模式：
  - 無
- 假設：
  - 無
- 未知事項：
  - 無
- 允許變更的檔案：
  - server/**
  - 文件/驗證腳本
- 不得觸碰：
  - 不得在任何前端可讀取的檔案（含 .env 若被前端建置工具讀取的變數前綴，例如 Vite 的 VITE_ 前綴）存放金鑰

## 需求

- 確認金鑰僅透過後端 process.env 讀取。
- 確認前端建置產物（dist/）搜尋不到金鑰字串。
- 確認 .env 未被提交進版本控制歷史。

## 驗收標準

- 對 build 產物與原始碼做字串搜尋，皆搜尋不到金鑰值。
- 此卡片需通過 Security Gate 審查（ai/process/review-gates.md）。

## 實作備註

- 開工前先讀 `ai/context/design-system.md`（若為前端/UI 任務），能重用既有 token 與元件就必須重用。
- 若需要探索現成套件（例如圖表函式庫），列 2-3 個選項附優劣與建議，只有明顯唯一選擇時才不用問。

## 驗證契約

- 單元測試：無
- 整合測試：無
- E2E 測試：無
- 型別檢查：無
- Lint：無
- Build：vite build 後對 dist/ 做金鑰字串搜尋
- 螢幕截圖：無
- 安全性檢查：金鑰洩漏掃描（原始碼與建置產物）、.gitignore 覆蓋確認

## 完成證據

- 變更的檔案：無（本卡為稽核驗證性質，現有實作已符合驗收標準，未變更任何檔案）。
- 執行過的指令：
  - `npx vite build`（產生 dist/）
  - `grep -rl "$GEMINI_API_KEY" dist/ src/`、`grep -rl "$POLLINATIONS_API_KEY" dist/ src/`（以 .env 中實際金鑰值搜尋，皆無命中）
  - `grep -rn "VITE_" .env .env.example`（確認未以 VITE_ 前綴暴露金鑰）
  - `grep -rln "GEMINI_API_KEY|POLLINATIONS_API_KEY" src/ dist/`（確認前端無金鑰變數名稱參照）
  - `git log --all -p -- .env`（確認 .env 從未進入任何 commit）
  - `git rev-list --objects --all` 逐一比對全部 480 個 git 物件內容（安全性審查 agent 執行，含歷史殘留 blob 檢查）
  - `git fsck --unreachable`（確認無殘留物件）
  - `npm audit`（0 vulnerabilities）
- 測試輸出：
  - 金鑰值於 dist/ 與 src/ 搜尋皆為 0 命中；GEMINI/POLLINATIONS 變數名稱於前端程式碼 0 命中。
  - .env 於完整 git 歷史（含不可達物件）搜尋 0 命中；.gitignore 已涵蓋 `.env`、`.env.*` 並排除 `.env.example`。
  - `vite.config.ts` 無 `define` 或自訂 `envPrefix`（僅預設 `VITE_`）；`vercel.json` 無 `env`／`build.env` 區塊會把金鑰注入前端。
  - Gemini SDK（`@google/genai@2.17.1`）以 `x-goog-api-key` header 傳送金鑰，非 URL query，錯誤訊息不會夾帶金鑰。
  - 獨立安全性審查 agent 結論：**Security Gate PASS**（本卡驗收範圍：金鑰不外洩至原始碼／建置產物／版控歷史）。
- 螢幕截圖：無（後端稽核任務，無 UI 變更）。
- 已知限制：
  - 安全性審查過程中額外發現 2 項與本卡範圍相鄰但不在「金鑰不外洩」驗收標準內的風險，建議另開任務卡處理：
    1. `server/routes/dream-analysis.ts:60-63` 將 Gemini SDK 原始錯誤訊息（`error.message`）原樣回傳前端，可能夾帶上游專案/配額細節，未來若傳輸機制變動有洩漏風險。
    2. `server/routes/dream-image.ts` 的 `/api/dream-image` 端點無身分驗證、無 rate limit、無 prompt 長度上限，等同無上限開放代理，可被第三方消耗 Pollinations 付費配額（金鑰值本身未外洩，但金鑰「效用」形同公開）。
  - 上述兩點金鑰值本身皆未外洩，不影響本卡 PASS 結論，但建議盡快另開卡修正。
- 後續任務：建議新增任務卡處理上述 F1（錯誤訊息脫敏）與 F2（`/api/dream-image` 加驗證與 rate limit）。

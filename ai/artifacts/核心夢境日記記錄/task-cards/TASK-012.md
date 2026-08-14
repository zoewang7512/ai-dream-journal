# AI-Ready 任務卡

## Metadata

- 任務：完成當天日記並觸發 AI 分析與圖片生成（含確認 dialog）
- 上層規格：ai/artifacts/核心夢境日記記錄/feature-spec.md
- 上層 Epic：核心夢境日記記錄
- 上層 User Story：完成當天日記並觸發 AI 生成
- 分軌：前後端串接
- 前置任務（dependsOn）：TASK-010、TASK-017、TASK-019
- 狀態：完成
- 風險等級：中
- Agent owner：Claude Code
- 人工核准者：zoewang7512（2026-08-14，審核完成證據並驗收，含真實瀏覽器＋真實 Gemini／Pollinations flux API 端到端驗證，以及後續的 flux 遷移修正）

## 目標

使用者標記今日日記完成後，先跳出確認 dialog 提醒即將消耗一次 AI 免費額度，確認後呼叫 AI 引擎並將結果寫回、鎖定該篇不可再次觸發。

## 情境包（Context Pack）

- 相關檔案：
  - src/pages/journal/CompleteEntryDialog.tsx
  - src/pages/journal/useCompleteEntry.ts
- 既有模式：
  - 沿用 S4 的 modal/dialog 元件；呼叫「AI 夢境分析與圖像生成引擎」Epic 提供的 /api/dream-analysis 端點；沿用該 Epic 的前端 Pollinations URL 組裝工具
- 假設：
  - 無
- 未知事項：
  - 無
- 允許變更的檔案：
  - src/pages/journal/**
- 不得觸碰：
  - 不得在後端 AI 引擎程式碼內修改 prompt 邏輯（屬另一 Epic）

## 需求

- 按下「完成」顯示確認 dialog；取消則不觸發任何呼叫、日記維持 draft。
- 確認後呼叫 /api/dream-analysis，顯示 loading 狀態。
- 成功後將 analysis（mood/keywords/imagePrompt/seed）與組好的圖片 URL 寫回該篇紀錄，status 更新為 completed。
- 失敗時顯示錯誤訊息與重試選項，該篇仍維持 draft（不得卡在無回應狀態）。
- 一篇日記成功 completed 後，不再提供「完成」入口，也不可重複觸發生成。

## 驗收標準

- 確認/取消兩分支皆正確運作。
- 成功後畫面顯示分析結果與圖片，且日記無法再次觸發生成。
- 失敗時可重試且不會重複扣抵/卡死。

## 實作備註

- 開工前先讀 `ai/context/design-system.md`（若為前端/UI 任務），能重用既有 token 與元件就必須重用。
- 若需要探索現成套件（例如圖表函式庫），列 2-3 個選項附優劣與建議，只有明顯唯一選擇時才不用問。

## 驗證契約

- 單元測試：狀態機與 dialog 邏輯測試
- 整合測試：呼叫 /api/dream-analysis 的 mock 整合測試（成功/逾時/錯誤三路徑）
- E2E 測試：完成日記→看到分析與圖片→確認無法重複觸發
- 型別檢查：tsc --noEmit
- Lint：專案 lint 指令
- Build：vite build 成功
- 螢幕截圖：確認 dialog、loading、成功、失敗四種狀態截圖
- 安全性檢查：確認前端未直接持有或呼叫 Gemini API 金鑰

## 完成證據

- 變更的檔案：
  - `src/pages/journal/useCompleteEntry.ts`（新增，完成日記＋AI 生成的狀態機：管理確認 dialog 開關、loading、錯誤訊息；`confirm()` 呼叫 `/api/dream-analysis`，成功後用 TASK-019 的 `buildDreamImageUrl` 組圖片 URL 並呼叫 `dream-storage.update` 寫回 `status=completed`）
  - `src/pages/journal/CompleteEntryDialog.tsx`（新增，完成確認 Modal，說明將觸發 AI 分析與圖片生成、內容會傳送給第三方服務）
  - `src/pages/journal/CompleteEntryDialog.test.tsx`（新增，4 個單元測試）
  - `src/pages/journal/useCompleteEntry.test.ts`（新增，7 個單元測試：確認/取消、成功寫回、失敗訊息、網路例外防洩漏、重試不卡死、清除錯誤）
  - `src/pages/journal/TodayEntryEditor.tsx`（更新，新增「完成」按鈕（空內容時 disabled）、串接 `useCompleteEntry`／`CompleteEntryDialog`／`Toast`；AI 請求進行中時停用 textarea／存檔／刪除，避免使用者在生成過程中修改或刪除底層紀錄）
  - `src/pages/journal/TodayEntryEditor.module.css`（更新，`.actions` 補上 `.actionsGroup` 讓「存檔」＋「完成」分組靠右，對應 mockup-decision 的按鈕分組要求）
  - `src/pages/journal/TodayEntryEditor.test.tsx`（更新，新增「完成 flow」測試群組：disabled/enabled 切換、確認/取消、成功寫回、失敗顯示 Toast、loading 期間鎖定其他操作、`onCompletingChange` 回呼）
  - `src/pages/journal/useJournalViewState.ts`（更新，新增 `refresh()`：把一個內部 tick state 遞增，強制容器重新從 LocalStorage 讀取最新狀態，讓「完成」後不需要整頁重新整理就能切到唯讀模式）
  - `src/pages/journal/JournalPage.tsx`（更新，把 `view.refresh` 當 `onCompleted` 傳給 `TodayEntryEditor`；新增 `isCompleting` state 讓右頁在 AI 生成中顯示「AI 正在解析你的夢境……」而非預設提示）
  - `src/pages/journal/JournalPage.test.tsx`（更新，新增 2 個 E2E 測試：完整「撰寫→確認→AI loading→唯讀顯示分析與圖片、無法再次觸發」旅程；生成失敗時顯示 Toast 且維持可編輯可重試）
  - `.claude/launch.json`（更新，本機驗證期間曾嘗試改用 `npm run dev`（同時起 web+api）但發現預覽工具會把自己的 `PORT=5173` 注入子行程、與後端衝突，最終改回 `dev:web`，API 另用 Bash 手動在 3001 啟動；詳見已知限制）
- 決策摘要：
  - 架構延續既有慣例：`useCompleteEntry`（狀態機）＋`CompleteEntryDialog`（純呈現 Modal）的切分，呼應 TASK-011/015 已建立的「hook 管邏輯、元件管呈現」模式。
  - **確認 Modal 立即關閉、loading 態顯示在頁面本身**（而非 Modal 內）：對照 screen-spec 的狀態表——「今日·AI 生成中」描述的是「完成」按鈕轉 loading、右頁顯示「AI 正在解析你的夢境⋯⋯」，而非 Modal 內部有 loading 態，因此 `confirm()` 一開始就 `setIsDialogOpen(false)`，讓 Modal 立刻消失，改由頁面上的「完成」按鈕（`loading` prop）與右頁文字呈現進度。
  - **`ensureSaved` 在 `confirm()` 一開始就先確保底層有 draft 紀錄**：如果使用者打完字直接按「完成」、從未點過「存檔」，`dream-storage.update` 會因為找不到紀錄而拋錯；`useCompleteEntry` 不自己管「有沒有存過」這件事（那是 `TodayEntryEditor` 的 `hasStoredRecord` 狀態），而是接受一個 `ensureSaved` callback，由呼叫端注入既有的 `persist` 邏輯，避免兩處重複維護「create 還是 update」的判斷。
  - **`JournalPage` 用 `refresh()` tick 而非重新整理頁面**：完成後 `record.status` 已經是 completed，但 React 不會自動知道要重新讀 LocalStorage；`useJournalViewState` 新增一個「沒有實際用途、只用來強制觸發重新 render」的 tick state，呼叫端 `onCompleted` 直接指到這個 `refresh`，重新 render 時 `record`/`mode` 會重新從 storage 算一次，自然切到 readonly。
  - **右頁的 loading 文字用 lift-state-up 的方式跨越左右兩個獨立面板**：`isCompleting` 狀態實際存在 `JournalPage`（不是 `TodayEntryEditor` 自己），透過 `onCompletingChange` callback 讓子元件回報進度，因為 S5 版型的左右兩頁是 DOM 上完全獨立的兄弟節點，`TodayEntryEditor` 本身只掛在左頁，沒辦法直接影響右頁內容。
- **開發過程中發現並修正一個真實的 React bug（非測試假象）**：`useCompleteEntry` 原本用 `isMountedRef`（`useRef(true)`＋卸載時的 cleanup 設成 `false`）防止「元件已卸載後才 resolve 的非同步呼叫還去 setState」。但 cleanup 函式只有「設成 false」，setup 函式沒有對稱地把它「設回 true」。React 18 `StrictMode`（`main.tsx` 已包裹，`npm run dev` 開發模式必經）會在每個元件**首次掛載時**刻意跑一次「掛載→卸載→再掛載」的模擬循環，藉此揪出這類清理邏輯沒寫對稱的 bug——這個模擬卸載讓 `isMountedRef.current` 永久卡在 `false`，即使元件其實一路都活著。結果是：「完成」流程的 API 呼叫無論成功或失敗都會在 `if (!isMountedRef.current) return;` 提早中止，不會呼叫 `onCompleted()`、不會顯示錯誤、`isSubmitting` 也不會重置——畫面卡在 loading 態的按鈕永遠不會恢復。**這個 bug 在 Vitest（jsdom + React Testing Library）中完全測不出來**，因為測試直接 `render(<TodayEntryEditor .../>)`，沒有包在 `<StrictMode>` 裡，所以从來不會觸發那次模擬卸載；只有在真實瀏覽器（`npm run dev`，StrictMode 生效）裡才會現形。修法：`useEffect` 的 setup 函式也要把 `isMountedRef.current = true`，讓 StrictMode 的第二次掛載能正確「復原」這個旗標。已在真實瀏覽器＋真實 Gemini API 呼叫下重新驗證通過。
- 設計系統對照：
  - 重用的元件：`Modal`（完成確認）、`Toast`（danger，生成失敗）、`Button`（primary「完成」、loading 態）。
  - 重用的 token：既有 `.actionsGroup`／`space-12`。未新增元件，元件庫 inventory 無需更動。
- 執行過的指令：
  - `npx tsc --noEmit` → 通過。
  - `npx eslint .` → 通過。
  - `npx vitest run` → 通過（27 個測試檔案、134 個測試全數通過，含本卡新增/調整的測試）。
  - `npx vite build` → 建置成功（`dist/assets/index-*.js` 252.50 kB）。
  - `grep -rl "GEMINI\|GoogleGenAI\|@google/genai" dist/` → 無比對結果，確認前端 bundle 未持有金鑰或 Gemini SDK。
  - **真實瀏覽器＋真實 Gemini API 端到端驗證**：`.env` 已由使用者填入真實 `GEMINI_API_KEY`；分別用 `preview_start`（Vite，`dev:web`）與 Bash 背景執行 `PORT=3001 npx tsx server/index.ts` 起兩個獨立行程（見上方「已知限制」說明為何不能直接用 `npm run dev`），在瀏覽器中完整走一次「輸入內容→點完成→確認 Modal→確定→loading（右頁顯示『AI 正在解析你的夢境……』、textarea/存檔/刪除皆鎖定）→完成後左頁變唯讀、右頁顯示 AI 分析關鍵字與真實生成的黑白鉛筆素描插圖（內容與夢境描述吻合）→上一篇/下一篇導覽正確出現、找不到任何「完成」入口」的完整旅程，並截圖存證。過程中意外重現一次真實的 502（`upstream_error`，推測是短時間內重複呼叫 Gemini 觸發限流）：畫面正確維持 draft、輸入框與按鈕正確恢復可用，重新點擊「完成」後第二次呼叫成功——驗證「失敗時可重試且不會卡死」在真實環境下也成立。
- 測試輸出：`Test Files  27 passed (27)` / `Tests  134 passed (134)`。
- 螢幕截圖：已於本次 Browser pane session 中即時檢視確認四種狀態（確認 dialog、loading、成功含真實生成圖片、失敗後可重試），詳見上方執行紀錄。
- 安全性檢查：確認前端原始碼與 `dist/` 建置產物皆搜尋不到 `GEMINI_API_KEY`、`GoogleGenAI`、`@google/genai` 字串；前端只透過相對路徑 `/api/dream-analysis` 呼叫後端，未直接持有或呼叫 Gemini API。
- 已知限制：
  - **本機驗證環境限制**：本次會話的 Browser pane 預覽工具（`preview_start`）會把自己的 `PORT` 環境變數注入子行程，若直接用 `npm run dev`（`concurrently` 同時起 `dev:web`＋`dev:api`）會導致後端 Express 行程的 `PORT` 被覆蓋成與 Vite 相同的 5173，造成埠號衝突。已改為 `.claude/launch.json` 只跑 `dev:web`（Vite），後端另外用 Bash 手動 `PORT=3001 npx tsx server/index.ts` 啟動，兩者透過 `vite.config.ts` 既有的 `/api` proxy 銜接。這只是本次驗證環境的變通做法，不影響實際部署（Vercel 走 `api/index.ts` serverless function，不受此問題影響）；純本機 `npm run dev` 若在一般終端機（無 harness 注入 PORT）執行則不會有這個問題。
  - `gemini-flash-latest` 為浮動別名（見 TASK-017 已知限制），生成內容風格可能隨 Google 更新模型而略有變化。
  - 尚未做速率限制/防濫用（那是 TASK-021 的範圍），這次驗證過程中意外撞到的 502 很可能就是缺乏節流保護下短時間重複呼叫的直接後果。
  - Review gates（架構／安全性／測試）尚待人工或對應 agent 審查確認；本卡風險等級為「中」（前後端串接＋觸發第三方 API 呼叫），依 AGENTS.md 未強制要求多關卡審查，但仍待人工驗收；鑑於本卡發現並修正了一個真實的 StrictMode 相關 bug，建議人工驗收時额外留意任何涉及非同步操作＋卸載防護（`isMountedRef` 類模式）的程式碼。
- 後續任務：「核心夢境日記記錄」Epic 至此六張任務卡（TASK-010～015）全數完成。剩餘工作為「AI 夢境分析與圖像生成引擎」Epic 的 TASK-020（高風險，API 金鑰安全代理驗證）與 TASK-021（逾時/額度超限/防濫用錯誤處理，可望修正本卡驗證時撞到的限流問題），以及「夢境數據分析看板」Epic（TASK-022～026，尚未開工，可用本卡累積的 `mood`／`analysis` 真實資料格式作為圖表資料來源參考）。

## 後續修正記錄（2026-08-14，Pollinations flux 遷移）

人工驗收過程中實際比對生成圖片，發現風格「比較像黑白照片、不像鉛筆素描」。調查後確認根本原因並完成修正，記錄如下（此修正變更了本卡「成功後將…組好的圖片 URL 寫回該篇紀錄」這個需求的實際實作方式，故補記在本卡完成證據內，而非另開任務卡）。

- **問題根因**：TASK-019 當初設計時假設的 Pollinations.ai 免金鑰端點（`image.pollinations.ai/prompt/...?model=flux`）目前僅剩 `sana` 模型可用（用 `GET https://image.pollinations.ai/models` 直接查證，回傳 `["sana"]`）；即使 URL 帶 `model=flux`，Pollinations 也會靜默改用 `sana`（用下載圖片的 EXIF `manufacturer` 欄位證實）。`sana` 對「鉛筆素描」風格詞的遵從度很低，測試多組 prompt／negative_prompt／不同 seed 皆維持強烈的照片感，屬模型能力上限，非 prompt 工程可解。真正的 `flux`（FLUX.1 Schnell）現在只存在於 Pollinations 新的認證閘道 `gen.pollinations.ai`，需要 Secret API 金鑰（`sk_` 開頭，Bearer Token 或 `?key=` 皆可，無流量限制）。
- **架構決策**：前端原本直接組 Pollinations 圖片網址、用 `<img src>` 載入（TASK-019 的設計），若沿用同一模式改打 `gen.pollinations.ai` 會被迫把 Secret 金鑰放進瀏覽器可見的網址（違反「Secret key 絕不可出現在前端」的基本原則，等同把一把無限流的金鑰整個攤在瀏覽器開發者工具裡）。曾考慮改用「Publishable key（`pk_`，官方文件明載可安全用於前端）」維持原架構，但 Pollinations dashboard 已把 `pk_` 建立流程標示為 deprecated（改推 BYOP OAuth+PKCE 流程，對單人個人專案是不成比例的複雜度）。最終決定：**新增後端圖片代理端點 `GET /api/dream-image`**，前端只傳 `prompt`／`seed`，Secret 金鑰與實際呼叫 Pollinations 的動作完全留在後端，前端 `<img src>` 只打自家 `/api/dream-image`。
- **變更的檔案**：
  - `server/routes/dream-image.ts`（新增）：`createDreamImageRouter(pollinationsApiKey, fetchImpl?)`，驗證 `prompt`／`seed`（缺漏或格式錯回 400）、代為呼叫 `gen.pollinations.ai/image/{prompt}?model=flux&width=800&height=800&seed={seed}`（帶 `Authorization: Bearer` header）、把圖片位元組原樣串流回前端並設定 `Cache-Control: public, max-age=31536000, immutable`（同 prompt+seed 恆定產生同一張圖，可安全長期快取）；上游失敗一律回 502，不外洩任何內部錯誤細節。`fetchImpl` 採依賴注入（預設為全域 `fetch`），測試可注入假實作，不需攔截全域 fetch。
  - `server/routes/dream-image.test.ts`（新增）：7 個測試，涵蓋參數驗證、成功代理、金鑰只出現在送往上游的 header（不會外洩到回應內容）、上游失敗／fetch 例外皆回 502、快取標頭正確。
  - `server/config.ts`／`server/config.test.ts`（更新）：`AppConfig` 新增 `pollinationsApiKey`，比照 `GEMINI_API_KEY` 做 fail-fast 檢查（缺少即拒絕啟動）。
  - `server/app.ts`（更新）：`createApp` 新增 `pollinationsApiKey` 參數，掛載 `createDreamImageRouter`。
  - `server/index.ts`、`api/index.ts`（更新）：改傳入 `config.pollinationsApiKey`。
  - `server/routes/dream-analysis.test.ts`（更新）：`createApp()` 呼叫補上假的 `pollinationsApiKey` 引數。
  - `server/lib/analyze-dream.ts`（更新）：**修正一個真實 bug**——`generateSeed()` 原本用 `Math.random() * 2 ** 32`，產生範圍到約 42.9 億，但 Pollinations 圖片 API 要求 `seed <= 2147483647`（signed 32-bit 上限），約有一半機率超標導致圖片端點回傳 400、圖片整個載入失敗；已重現這個錯誤（比較圖片風格時親自撞到）並修正為 `Math.random() * 2147483648`（範圍收斂到 0～2147483647）。
  - `server/lib/analyze-dream.test.ts`（更新）：新增迴圈跑 200 次 `analyzeDream`，斷言每次 `seed` 都落在 `[0, 2147483647]`。
  - `src/lib/pollinations.ts`（更新）：`buildDreamImageUrl` 改為組相對路徑 `/api/dream-image?prompt=...&seed=...`（不再直接組 Pollinations 網址），函式簽章與純函式特性不變。
  - `src/lib/pollinations.test.ts`（更新）：斷言改對齊新的相對路徑格式，其餘測試意圖（可重現性、特殊字元/非 ASCII/長 prompt 編碼、seed 格式）不變。
  - `src/pages/journal/useCompleteEntry.test.ts`、`src/pages/journal/JournalPage.test.tsx`（更新）：`imageUrl` 斷言從 `toContain("image.pollinations.ai")` 改為 `toContain("/api/dream-image")`。
  - `.env.example`（更新）：新增 `POLLINATIONS_API_KEY` 說明（Secret key，僅後端使用，缺少時伺服器拒絕啟動；明確註記絕不可加 `VITE_` 前綴）。
- **人工已自行申請並設定金鑰**：使用者於 `enter.pollinations.ai` 建立 Secret key（budget 3 pollen）並填入本機 `.env` 的 `POLLINATIONS_API_KEY`。
- **執行過的指令**：
  - `npx tsc --noEmit` → 通過。
  - `npx eslint .` → 通過。
  - `npx vitest run` → 通過（28 個測試檔案、144 個測試全數通過）。
  - `npx vite build` → 建置成功（`dist/assets/index-*.js` 252.46 kB）。
  - `grep -rl "POLLINATIONS\|GEMINI\|GoogleGenAI\|gen.pollinations\|sk_" dist/` → 無比對結果，確認 Pollinations 金鑰與網域字串皆未進入前端 bundle。
- **真實驗證**：
  - 直接 `curl /api/dream-image?prompt=...&seed=...` 確認回傳真實圖片，EXIF `manufacturer=flux`（非先前的 `sana`），畫質與風格明顯是手繪鉛筆素描（交叉排線、紙張紋理），與使用者原始抱怨的「像黑白照片」形成鮮明對比。
  - 真實瀏覽器完整走一次「輸入內容→完成→確認→loading→完成」旅程：`<img>` 的 `src` 正確指向自家 `/api/dream-image?...`（非 Pollinations 網址），status 正確變 `completed`。過程中 `/api/dream-analysis`（Gemini 端）又隨機撞到一次 502，行為與 TASK-012 原始驗證一致（正確退回 draft、可重試、重試後成功）——與本次圖片修正無關，屬 Gemini 端既有的已知限制（見 TASK-021）。
  - 用伺服器端（後端持有的金鑰）呼叫 `GET /account/balance` 確認實際帳戶餘額，驗證量測值與 Pollinations 公開定價 API（`flux` 每張圖約 0.002 pollen，flat rate）互相印證，供使用者評估額度是否足夠（詳見對話記錄，本卡不重複列出商業性額度規劃，屬帳號管理範疇非程式碼變更）。
- **安全性檢查（更新）**：新增的 `POLLINATIONS_API_KEY`（Secret，無限流）比照 `GEMINI_API_KEY` 的保護等級：只在後端 `process.env` 讀取一次，只出現在 `server/routes/dream-image.ts` 送往上游的 `Authorization` header 裡；已用測試明確斷言金鑰字串不會出現在任何回應內容（`dream-image.test.ts` 的「never exposes the key to the response」案例）；`grep dist/` 確認未進入前端 bundle。
- **已知限制（新增）**：
  - `/api/dream-image` 目前沒有存取控制或速率限制——任何知道端點路徑的人都可以用它消耗你帳戶的 Pollinations 額度（雖然單張圖成本極低，且本卡評估額度非常寬裕，短期無實際風險，但屬於「防濫用」範疇，建議與 TASK-021 一併規劃，或至少限制只接受同源請求）。
  - 圖片本身仍不落地儲存（沿用 feature-spec 原始設計），瀏覽器快取到期或清除後，重新檢視舊日記會讓後端再打一次 Pollinations（雖是同 prompt+seed、同一張圖、成本可忽略不計，但仍是一次真實的外部請求）。
  - 尚未實際驗證 `POLLINATIONS_API_KEY` 用罄或帳戶餘額不足（402）時的錯誤處理路徑；目前 `dream-image.ts` 把所有非 2xx 上游回應一律歸類成 502，未針對 402 做特別分類或訊息客製化，使用者只會看到通用的「圖片生成服務暫時無法使用」。

# AI-Ready 任務卡

## Metadata

- 任務：前端串接 Pollinations.ai 圖片生成
- 上層規格：ai/artifacts/AI 夢境分析與圖像生成引擎/feature-spec.md
- 上層 Epic：AI 夢境分析與圖像生成引擎
- 上層 User Story：前端串接 Pollinations.ai 圖片生成
- 分軌：前端
- 前置任務（dependsOn）：TASK-017、TASK-018
- 狀態：完成
- 風險等級：低
- Agent owner：Claude Code
- 人工核准者：zoewang7512（2026-08-14，審核完成證據並驗收）

## 目標

前端將後端回傳的 imagePrompt 與 seed 編碼組成 Pollinations.ai 動態圖片 URL 並提供給呼叫方顯示。

## 情境包（Context Pack）

- 相關檔案：
  - src/lib/pollinations.ts
- 既有模式：
  - URL 格式：https://image.pollinations.ai/prompt/{encodeURIComponent(imagePrompt)}?width=800&height=800&model=flux&nologo=true&seed={seed}
- 假設：
  - 無
- 未知事項：
  - 無
- 允許變更的檔案：
  - src/lib/**
- 不得觸碰：
  - 依 AGENTS.md 一般規則：不得變更不相關檔案

## 需求

- 提供純函式 buildDreamImageUrl(imagePrompt, seed): string。
- 相同 imagePrompt + seed 需產生完全相同的 URL（供歷史紀錄重現同一張圖）。

## 驗收標準

- 單元測試確認相同輸入產生相同 URL、特殊字元正確編碼。

## 實作備註

- 開工前先讀 `ai/context/design-system.md`（若為前端/UI 任務），能重用既有 token 與元件就必須重用。
- 若需要探索現成套件（例如圖表函式庫），列 2-3 個選項附優劣與建議，只有明顯唯一選擇時才不用問。

## 驗證契約

- 單元測試：URL 組裝函式測試（含特殊字元、長 prompt 邊界）
- 整合測試：無
- E2E 測試：併入 Epic1 TASK-012 的 E2E
- 型別檢查：tsc --noEmit
- Lint：專案 lint 指令
- Build：vite build 成功
- 螢幕截圖：無
- 安全性檢查：無

## 完成證據

- 變更的檔案：
  - `src/lib/pollinations.ts`（新增，`buildDreamImageUrl(imagePrompt, seed)` 純函式，依既有模式組出 Pollinations.ai 圖片 URL）
  - `src/lib/pollinations.test.ts`（新增，7 個單元測試：固定 query 參數、重現性、seed 不同結果不同、特殊字元編碼、非 ASCII／中文字元編碼、長 prompt 不截斷、大數 seed 不會變成科學記號）
- 決策摘要：
  - 完全依情境包既有模式實作，無需額外技術選型（純字串組裝＋`encodeURIComponent`，無第三方套件）。
  - 函式保持純函式（同輸入必同輸出、無副作用），滿足「歷史紀錄重新載入時顯示相同圖片」的可重現性要求——測試也直接驗證了這點（同 `imagePrompt`+`seed` 呼叫兩次比對輸出相等）。
  - 目前尚未在任何元件裡呼叫這個函式：依 `src/types/dream.ts` 的 `DreamRecord` 結構，`imageUrl` 是完成當下計算一次就寫入紀錄的固定字串（不是每次渲染都重新組 URL），所以實際呼叫點會在 TASK-012（完成日記＋觸發 AI 生成）——那張卡在拿到 `analyzeDream` 的 `imagePrompt`／`seed` 後，呼叫本卡的 `buildDreamImageUrl` 算出 `imageUrl` 存進紀錄。本卡只負責把這個可重用、有完整測試覆蓋的純函式準備好。
- 設計系統對照：不適用（純函式庫，無 UI）。
- 執行過的指令：
  - `npx tsc --noEmit` → 通過。
  - `npx eslint .` → 通過。
  - `npx vitest run` → 通過（25 個測試檔案、115 個測試全數通過，含本卡新增的 7 個測試）。
  - `npx vite build` → 建置成功；體積與前幾卡完全相同（230.03 kB）——因為 `pollinations.ts` 目前還沒有任何元件 import 它，tree-shaking 後不會進入實際 bundle，等 TASK-012 接上呼叫點後才會真的打包進去。
- 測試輸出：`Test Files  25 passed (25)` / `Tests  115 passed (115)`。
- 螢幕截圖：不適用（純函式庫，無 UI）。E2E 驗證依任務卡規劃併入 TASK-012 的完整旅程測試。
- 安全性檢查：無（純字串組裝，`encodeURIComponent` 是瀏覽器/Node 內建的標準跳脫函式，不涉及任何使用者輸入的程式碼執行或敏感資料）。
- 已知限制：
  - 尚未實際串接到任何畫面（見上方決策摘要），本卡驗收標準只涵蓋「URL 組裝正確性」，實際圖片能否成功載入需等 TASK-012／TASK-014 接上後才能視覺驗證。
  - Review gates（架構／測試）尚待人工或對應 agent 審查確認；本卡風險等級為「低」，依 AGENTS.md 未強制要求架構/安全性審查，但仍待人工驗收。
- 後續任務：「AI 夢境分析與圖像生成引擎」Epic 的主線（TASK-016→017→018→019）至此全數完成，TASK-012（完成日記＋AI 生成確認 dialog）現在已解鎖，可以把 `analyzeDream` + `buildDreamImageUrl` 接進「核心夢境日記記錄」Epic 的完成流程；TASK-020（高風險，API 金鑰安全代理驗證）與 TASK-021（逾時/額度超限/防濫用錯誤處理）仍待後續安排。

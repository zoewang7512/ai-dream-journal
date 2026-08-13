# 功能規格書

## Metadata

- 功能：AI 夢境分析與圖像生成引擎（後端代理 + Gemini + Pollinations.ai 整合層）
- 負責人：待指派
- 狀態：草稿
- 風險等級：中（涉及第三方 API 金鑰、外部服務呼叫、潛在濫用風險）

## 問題

需要一個安全、風格穩定的後端服務，把使用者的夢境文字轉換成結構化情緒/關鍵字分析，並產生強制黑白手繪素描風格的圖片，同時不能讓 Gemini API 金鑰暴露，也不能讓歷史紀錄每次重新載入時顯示不同的圖片。

## 使用者

直接使用者是「核心夢境日記記錄」Epic 的前端呼叫；間接使用者是最終產品使用者（透過完成日記觸發）。

## 目標

- 提供後端 API，將夢境文字經 Gemini 轉為結構化 JSON（情緒、關鍵字、imagePrompt）。
- 確保 imagePrompt 強制帶有手繪素描風格修飾詞，且不產生色彩。
- 產生並回傳可重現的 `seed`，讓前端組出的 Pollinations.ai 圖片 URL 在任何時候重新載入都顯示同一張圖片。
- Gemini API 金鑰全程只存在後端，不暴露於前端或版本控制。
- 呼叫失敗/逾時/額度超限時，提供結構化錯誤供前端顯示對應提示與重試選項。
- 防止此端點被當成公開免費 Gemini proxy 濫用。

## 非目標

- 不負責前端的 UI 呈現、確認 dialog 或日記狀態管理（屬「核心夢境日記記錄」Epic）。
- 不實作使用者可自訂藝術風格的功能（目前固定為黑白鉛筆素描風）。
- 不快取或落地儲存生成圖片本身；只保存 `imagePrompt` 與 `seed`，圖片一律透過 Pollinations.ai 動態 URL 即時載入。

## 使用者故事（User Stories）

| 故事 | 身為／我想要／以便 | 驗收標準 |
|---|---|---|
| Gemini 結構化分析 API | 身為前端呼叫者／我想要送出夢境文字並取回結構化分析／以便呈現情緒關鍵字與生成圖片 | POST 端點接受 `{ content }`，成功回傳 `{ mood, keywords[], imagePrompt, seed }`；失敗回傳結構化錯誤格式 |
| 手繪風格 Prompt 工程 | 身為系統／我想要強制在 imagePrompt 前後加入素描風格修飾詞／以便 Pollinations.ai 穩定產出黑白手繪風格 | 產生的 imagePrompt 開頭與結尾皆含指定修飾詞清單；不含任何色彩相關描述詞 |
| 前端串接 Pollinations.ai 圖片生成 | 身為使用者／我想要看到根據我的夢境生成的手繪圖片／以便視覺化我的夢境 | 前端以 `encodeURIComponent` 編碼 imagePrompt 並帶入固定 seed 組成圖片 URL；相同 prompt+seed 重新載入時顯示相同圖片 |
| API 金鑰安全代理 | 身為開發者／我想要 Gemini 金鑰只存在後端／以便防止金鑰外洩 | 前端原始碼與 build 產物中搜尋不到金鑰字串；`.env` 已被 gitignore |
| 呼叫失敗/逾時/額度超限的錯誤處理 | 身為使用者／我想要在 AI 生成失敗時得到清楚提示與重試選項／以便不會卡住 | 逾時或 Gemini 回傳錯誤時，後端回傳結構化錯誤碼；前端顯示對應訊息並提供「重試」按鈕，重試不會讓該篇日記提前被標記為已完成 |

## 使用者旅程

```text
身為前端（核心夢境日記記錄 Epic）
我想要呼叫一個安全的分析端點並取得可重現的圖片 URL
以便使用者完成日記後立刻看到一致、風格穩定的手繪插圖
```

## 功能需求

- WHEN 後端收到 `POST /api/dream-analysis` 且 body 含非空 `content` THE SYSTEM SHALL 呼叫 Gemini API 並要求回傳結構化 JSON（`mood`、`keywords`、`imagePrompt`）。
- WHEN Gemini 回傳 imagePrompt THE SYSTEM SHALL 在其前後加入固定的素描風格修飾詞清單（pencil sketch、graphite sketch、cross-hatching、monochromatic 等），並產生一個隨機 `seed` 一併回傳。
- WHEN 前端收到 `{ imagePrompt, seed }` THE SYSTEM SHALL 組成 `https://image.pollinations.ai/prompt/{encoded}?width=800&height=800&model=flux&nologo=true&seed={seed}`，並持久化 `imagePrompt` 與 `seed`（而非圖片本身）供未來重新載入時重建相同圖片。
- WHEN Gemini API 逾時（>15 秒）或回傳非預期格式 THE SYSTEM SHALL 回傳結構化錯誤（含錯誤類型：`timeout`/`quota_exceeded`/`invalid_response`），不得讓前端無限等待。
- WHEN 請求缺少或 `content` 為空 THE SYSTEM SHALL 回傳 400 並拒絕呼叫 Gemini（避免浪費額度）。
- THE SYSTEM SHALL 對 `/api/dream-analysis` 端點加上基本 origin 檢查或速率限制，避免被當成公開免費 Gemini proxy 濫用。

## 畫面

此 Epic 為後端服務，無獨立畫面；loading/錯誤狀態顯示於「核心夢境日記記錄」Epic 的「今日日記撰寫」畫面。

## 資料與 API

- 輸入：`POST /api/dream-analysis { content: string }`。
- 輸出：`200 { mood: string, keywords: string[], imagePrompt: string, seed: number }` ｜ `4xx/5xx { errorType, message }`。
- 驗證：`content` 非空、長度上限與「核心夢境日記記錄」Epic 一致（暫定 2000 字）。
- 錯誤：`timeout` / `quota_exceeded` / `invalid_response` / `upstream_error` 四類，前端依類型顯示不同文案。

## 安全性與隱私

- 身分驗證：無（單人本機使用，但此 API 仍需防止被外部濫用當公開 proxy）。
- 權限：無。
- 敏感資料：夢境文字會傳送給 Gemini（第三方）；後端為無狀態代理，不記錄、不落地儲存使用者內容。
- 濫用情境：金鑰外洩風險（已用後端代理防護）；API 被盜用當公開代理消耗額度風險（已用 origin 檢查/速率限制因應）。此 Epic 需在合併前通過 `ai/process/review-gates.md` 的 Security Gate。

## 驗收標準

- API 金鑰不出現在前端 bundle 或版本控制。
- imagePrompt 一律含強制風格修飾詞、不含色彩詞彙。
- 相同 prompt+seed 的圖片 URL 重新載入顯示相同圖片。
- 逾時/錯誤情況有結構化錯誤回應與前端對應提示。
- 端點具備基本防濫用機制（origin 檢查或速率限制）。

## 驗證計畫

- 單元測試：prompt 組裝函式（修飾詞注入）、錯誤分類邏輯。
- 整合測試：mock Gemini 回應測試成功/逾時/錯誤三種路徑。
- E2E：由「核心夢境日記記錄」Epic 的 E2E 涵蓋端到端。
- 視覺：無獨立畫面。
- 手動：實際呼叫一次 Gemini + Pollinations 確認風格與可重現性。

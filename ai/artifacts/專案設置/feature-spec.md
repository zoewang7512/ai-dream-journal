# 功能規格書

## Metadata

- 功能：專案設置（Epic 0：技術骨架、環境變數、核心資料模型、UI 設計系統）
- 負責人：待指派
- 狀態：草稿
- 風險等級：中（涉及 API 金鑰管理與代理架構）

## 問題

目前專案只有治理文件與看板骨架，沒有任何可執行程式碼。需要建立可執行、可部署的技術地基，讓後續四個功能 Epic 有共用的專案結構、資料模型與視覺風格可以依附，避免每個 Epic 各自發明一套規範。

## 使用者

所有後續開發（人工或 AI agent）是這個 Epic 的直接使用者；最終產品使用者（單一夢境紀錄使用者）間接受益於穩定骨架與一致視覺風格。

## 目標

- 建立可執行的 React 18 + Vite + TypeScript 前端與 Node.js + Express 後端代理專案骨架，並可部署到 Vercel Serverless Functions。
- 定義 Gemini API 金鑰的安全存放與代理呼叫規範，金鑰不外洩至前端或版本控制。
- 定義夢境紀錄的 LocalStorage 資料結構與型別化存取工具，作為日記頁與分析看板共用的單一事實來源。
- 依五階段流程建立仿手繪素描本風格的 UI 設計系統，定案於 `ai/context/design-system.md`。

## 非目標

- 不在此 Epic 實作夢境日記的實際 CRUD 互動、AI 分析呼叫或圖表（屬於後續 Epic）。
- 不引入使用者帳號／登入機制（已確認單人、無登入）。
- 不建立後端資料庫（已確認純前端 LocalStorage）。

## 使用者故事（User Stories）

| 故事 | 身為／我想要／以便 | 驗收標準 |
|---|---|---|
| 技術骨架初始化 | 身為開發者／我想要一鍵啟動前後端開發環境／以便開始實作功能 | 單一指令可同時啟動前端 Vite dev server 與後端 Express 代理，且有 build/lint/test 腳本可執行並通過 |
| 環境變數與金鑰設定 | 身為開發者／我想要有清楚的 .env 規範／以便不會誤把金鑰提交進版本控制 | `.env.example` 存在且列出所需變數；`.env` 已加入 `.gitignore`；後端啟動時若缺少必要金鑰會明確報錯並拒絕啟動 |
| 核心資料模型基礎 | 身為開發者／我想要有型別化的資料存取工具／以便日記頁與分析看板讀寫一致的資料結構 | TypeScript type 定義夢境紀錄欄位；提供 CRUD 存取函式並有對應單元測試 |
| UI 設計系統／風格指引 | 身為開發者／我想要有定案的 design token 與元件庫／以便後續畫面不用重新發明風格 | `design-system.md` 五階段皆有人工核准紀錄；至少涵蓋 button/input/select/checkbox/card/nav/modal/table/form/toast 等基礎元件 |

## 使用者旅程

```text
身為開發者
我想要 clone 專案後執行單一指令即可啟動前後端開發環境
以便立即開始實作後續功能 Epic
```

## 功能需求

- WHEN 開發者執行安裝與啟動指令 THE SYSTEM SHALL 同時啟動 Vite 前端開發伺服器與 Express 後端代理。
- WHEN 後端啟動時缺少 `GEMINI_API_KEY` 環境變數 THE SYSTEM SHALL 記錄明確錯誤訊息並拒絕啟動（fail fast），不得靜默失敗。
- THE SYSTEM SHALL 在架構上不提供任何前端可直接呼叫 Gemini API 的路徑或金鑰——所有 Gemini 呼叫必須經由後端代理。
- WHEN 呼叫核心資料模型的存取函式（新增/查詢/更新/刪除）THE SYSTEM SHALL 對 LocalStorage 資料進行對應 CRUD 並回傳型別化結果。
- WHEN `design-system.md` 任一階段（S1–S5）尚未經人工核准 THE SYSTEM SHALL 不允許後續階段或功能 Epic 的 mockup 開始。

## 畫面

此 Epic 本身不產出終端使用者畫面（S1–S4 產出的是框架決策／token／元件，非完整版面）；S5（各介面版面 mockup）留給後續功能 Epic 各自套用 `ui-mockup-gate`。

## 資料與 API

- 輸入：夢境紀錄物件草案欄位：`id`、`date`（YYYY-MM-DD）、`content`、`status`（`draft` | `completed`）、`analysis?`（`{ mood, keywords[], imagePrompt, seed }`）、`imageUrl?`、`createdAt`、`completedAt?`。
- 輸出：LocalStorage 讀寫結果；`.env.example` 列出 `GEMINI_API_KEY` 等變數名稱。
- 驗證：資料模型欄位以 TypeScript type 靜態驗證；執行期以簡易 schema 檢查避免壞資料寫入。
- 錯誤：LocalStorage 寫入失敗（容量超限、隱私模式限制等）時，存取函式需拋出可辨識的錯誤供上層顯示提示。

## 安全性與隱私

- 身分驗證：無（單人本機使用）。
- 權限：無角色區分。
- 敏感資料：夢境日記內容涉及使用者個人隱私與心理狀態，僅存於使用者本機 LocalStorage，不落地至任何後端資料庫；觸發 AI 生成時，日記文字會暫時傳送給 Gemini API（第三方）。
- 濫用情境：Gemini API 金鑰若外洩可能被濫用消耗額度，故金鑰只存後端環境變數，不進版本控制、不回傳給前端。

## 驗收標準

- 專案可在本機以單一指令啟動前後端。
- `.env.example` 存在且 `.env` 已被 `.gitignore` 排除。
- 資料模型與存取工具有對應單元測試並通過。
- `design-system.md` 五階段皆有人工核准紀錄與對應 token/元件產出。

## 驗證計畫

- 單元測試：資料模型存取函式（CRUD、邊界情況如空值/超長文字）。
- 整合測試：後端代理啟動時的環境變數檢查。
- E2E：無（此 Epic 尚無終端使用者流程，留待功能 Epic）。
- 視覺：`design-system.md` 各階段核准紀錄與截圖。
- 手動：開發者本機啟動流程走一遍。

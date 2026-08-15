import { Router, type Request, type Response } from "express";
import type { GoogleGenAI } from "@google/genai";
import {
  DreamAnalysisError,
  type AnalyzeDream,
  type DreamAnalysisErrorBody,
  type DreamAnalysisErrorType,
  type DreamAnalysisSuccessBody,
} from "../lib/dream-analysis-types.js";
import { createRateLimiter, type RateLimiterOptions } from "../lib/rate-limiter.js";

export type {
  AnalyzeDream,
  DreamAnalysisErrorBody,
  DreamAnalysisErrorType,
  DreamAnalysisSuccessBody,
} from "../lib/dream-analysis-types.js";
export { DreamAnalysisError } from "../lib/dream-analysis-types.js";

const ERROR_STATUS: Record<DreamAnalysisErrorType, number> = {
  invalid_request: 400,
  timeout: 504,
  quota_exceeded: 429,
  invalid_response: 502,
  upstream_error: 502,
  rate_limited: 429,
};

/**
 * 單人專案、低流量情境下的基本防濫用門檻：每個 IP 每分鐘最多 10 次分析請求。
 * Gemini 呼叫成本較高，超過此頻率已明顯不是正常單人使用模式。
 */
const DEFAULT_RATE_LIMIT: RateLimiterOptions = { windowMs: 60_000, max: 10 };

/**
 * TASK-017 會傳入真正呼叫 Gemini 的實作；本卡（TASK-016）只搭骨架，
 * 尚未接上分析邏輯時任何有效請求都先回傳 upstream_error，避免路由層在
 * 沒有 analyzeDream 實作時假裝成功。
 */
const notImplemented: AnalyzeDream = () => {
  return Promise.reject(new Error("analyzeDream not implemented yet"));
};

export function createDreamAnalysisRouter(
  client: GoogleGenAI,
  analyzeDream: AnalyzeDream = notImplemented,
  rateLimitOptions: RateLimiterOptions = DEFAULT_RATE_LIMIT
): Router {
  const router = Router();

  router.post("/api/dream-analysis", createRateLimiter(rateLimitOptions), async (req: Request, res: Response) => {
    const content: unknown = req.body?.content;

    if (typeof content !== "string" || content.trim().length === 0) {
      const body: DreamAnalysisErrorBody = {
        errorType: "invalid_request",
        message: "content 為必填，且不可為空白字串。",
      };
      res.status(400).json(body);
      return;
    }

    try {
      const result = await analyzeDream(client, content);
      res.status(200).json(result satisfies DreamAnalysisSuccessBody);
    } catch (error) {
      const errorType: DreamAnalysisErrorType =
        error instanceof DreamAnalysisError ? error.errorType : "upstream_error";
      const message =
        error instanceof DreamAnalysisError
          ? error.message
          : "夢境分析暫時無法使用，請稍後再試。";
      const body: DreamAnalysisErrorBody = { errorType, message };
      res.status(ERROR_STATUS[errorType]).json(body);
    }
  });

  return router;
}

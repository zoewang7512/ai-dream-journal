import type { NextFunction, Request, RequestHandler, Response } from "express";

export interface RateLimiterOptions {
  windowMs: number;
  max: number;
}

/**
 * 單一 process 記憶體內的固定視窗（fixed-window）限流器，依 req.ip 分桶。
 * 單人專案、低流量情境下已足夠；不追求跨 process/跨 serverless 實例共享狀態。
 */
export function createRateLimiter({ windowMs, max }: RateLimiterOptions): RequestHandler {
  const hits = new Map<string, { count: number; windowStart: number }>();

  return (req: Request, res: Response, next: NextFunction) => {
    const key = req.ip ?? "unknown";
    const now = Date.now();
    const entry = hits.get(key);

    if (!entry || now - entry.windowStart >= windowMs) {
      hits.set(key, { count: 1, windowStart: now });
      next();
      return;
    }

    if (entry.count >= max) {
      res.status(429).json({
        errorType: "rate_limited",
        message: "請求過於頻繁，請稍後再試。",
      });
      return;
    }

    entry.count += 1;
    next();
  };
}

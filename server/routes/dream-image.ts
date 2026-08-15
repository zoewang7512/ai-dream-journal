import { Router, type Request, type Response } from "express";
import { createOriginGuard } from "../lib/origin-guard.js";
import { createRateLimiter, type RateLimiterOptions } from "../lib/rate-limiter.js";

const POLLINATIONS_IMAGE_BASE = "https://gen.pollinations.ai/image";
const IMAGE_WIDTH = 800;
const IMAGE_HEIGHT = 800;

/** prompt 上限：Gemini 產出的 imagePrompt 正常不會超過這個長度，超過視為異常/濫用。 */
const MAX_PROMPT_LENGTH = 1000;

/** 圖片生成比純文字分析慢，逾時門檻抓寬一點，避免請求無限期掛住。 */
const DEFAULT_REQUEST_TIMEOUT_MS = 20_000;

/**
 * 單人專案、低流量情境下的基本防濫用門檻：每個 IP 每分鐘最多 10 次圖片請求。
 * 圖片會被瀏覽器以長效不可變快取（見下方 Cache-Control）快取，正常使用不會重複打這支端點。
 */
const DEFAULT_RATE_LIMIT: RateLimiterOptions = { windowMs: 60_000, max: 10 };

export interface DreamImageRouterOptions {
  rateLimit?: RateLimiterOptions;
  requestTimeoutMs?: number;
}

/**
 * 圖片一律透過本端點代理：Pollinations.ai 的 flux 模型需要 Secret key
 * （sk_ 開頭、無限流），這把金鑰絕對不能落到前端／瀏覽器。前端只組
 * prompt/seed 傳給這支路由，實際帶金鑰打 Pollinations 的動作全部在
 * 伺服器端完成，回傳的仍是即時圖片位元組，不落地儲存。
 *
 * 端點只接受與本站同源（Referer host 相符）的請求、加上每 IP 速率限制、
 * prompt 長度上限與上游逾時，避免第三方網頁直接嵌入消耗付費配額
 * （見 TASK-020 Security Gate 審查附帶發現 F2）。
 *
 * fetchImpl 預設用全域 fetch；測試時可注入假的實作，避免真的打 Pollinations。
 */
export function createDreamImageRouter(
  pollinationsApiKey: string,
  fetchImpl: typeof fetch = fetch,
  { rateLimit = DEFAULT_RATE_LIMIT, requestTimeoutMs = DEFAULT_REQUEST_TIMEOUT_MS }: DreamImageRouterOptions = {}
): Router {
  const router = Router();

  router.get(
    "/api/dream-image",
    createOriginGuard(),
    createRateLimiter(rateLimit),
    async (req: Request, res: Response) => {
      const { prompt, seed } = req.query;

      if (typeof prompt !== "string" || prompt.trim().length === 0) {
        res.status(400).json({ message: "prompt 為必填，且不可為空白字串。" });
        return;
      }

      if (prompt.length > MAX_PROMPT_LENGTH) {
        res.status(400).json({ message: `prompt 長度不可超過 ${MAX_PROMPT_LENGTH} 字。` });
        return;
      }

      if (typeof seed !== "string" || !/^\d+$/.test(seed)) {
        res.status(400).json({ message: "seed 為必填，且必須是非負整數。" });
        return;
      }

      const upstreamUrl =
        `${POLLINATIONS_IMAGE_BASE}/${encodeURIComponent(prompt)}` +
        `?model=flux&width=${IMAGE_WIDTH}&height=${IMAGE_HEIGHT}&seed=${seed}`;

      try {
        const upstreamResponse = await fetchImpl(upstreamUrl, {
          headers: { Authorization: `Bearer ${pollinationsApiKey}` },
          signal: AbortSignal.timeout(requestTimeoutMs),
        });

        if (!upstreamResponse.ok) {
          res.status(502).json({ message: "圖片生成服務暫時無法使用，請稍後再試。" });
          return;
        }

        const imageBuffer = Buffer.from(await upstreamResponse.arrayBuffer());
        res.setHeader("Content-Type", upstreamResponse.headers.get("content-type") ?? "image/jpeg");
        res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
        res.status(200).send(imageBuffer);
      } catch {
        res.status(502).json({ message: "圖片生成服務暫時無法使用，請稍後再試。" });
      }
    }
  );

  return router;
}

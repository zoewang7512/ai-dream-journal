import { Router, type Request, type Response } from "express";

const POLLINATIONS_IMAGE_BASE = "https://gen.pollinations.ai/image";
const IMAGE_WIDTH = 800;
const IMAGE_HEIGHT = 800;

/**
 * 圖片一律透過本端點代理：Pollinations.ai 的 flux 模型需要 Secret key
 * （sk_ 開頭、無限流），這把金鑰絕對不能落到前端／瀏覽器。前端只組
 * prompt/seed 傳給這支路由，實際帶金鑰打 Pollinations 的動作全部在
 * 伺服器端完成，回傳的仍是即時圖片位元組，不落地儲存。
 *
 * fetchImpl 預設用全域 fetch；測試時可注入假的實作，避免真的打 Pollinations。
 */
export function createDreamImageRouter(
  pollinationsApiKey: string,
  fetchImpl: typeof fetch = fetch
): Router {
  const router = Router();

  router.get("/api/dream-image", async (req: Request, res: Response) => {
    const { prompt, seed } = req.query;

    if (typeof prompt !== "string" || prompt.trim().length === 0) {
      res.status(400).json({ message: "prompt 為必填，且不可為空白字串。" });
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
  });

  return router;
}

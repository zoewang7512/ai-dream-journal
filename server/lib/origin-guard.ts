import type { NextFunction, Request, RequestHandler, Response } from "express";

/**
 * 只放行 Referer 與目前請求同 host（req.headers.host）的請求；缺少或跨網域 Referer 一律
 * 擋下（403）。比對 host 而非完整 origin，是為了不依賴 req.protocol——部署在 Vercel 等
 * 反向代理後面時，若未設定 trust proxy，req.protocol 可能誤判成 http，導致誤擋合法的
 * https 請求；host（含 port）已足以判斷是否同一個網站來源。
 */
export function createOriginGuard(): RequestHandler {
  return (req: Request, res: Response, next: NextFunction) => {
    const referer = req.headers.referer;
    const host = req.headers.host;

    let refererHost: string | undefined;
    if (referer) {
      try {
        refererHost = new URL(referer).host;
      } catch {
        refererHost = undefined;
      }
    }

    if (!refererHost || !host || refererHost !== host) {
      res.status(403).json({ message: "來源不允許。" });
      return;
    }

    next();
  };
}

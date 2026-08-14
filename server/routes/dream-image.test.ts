import express from "express";
import { createServer, type Server } from "node:http";
import type { AddressInfo } from "node:net";
import { describe, expect, it, vi } from "vitest";
import { createDreamImageRouter, type DreamImageRouterOptions } from "./dream-image";

interface RunningServer {
  url: string;
  close: () => Promise<void>;
}

function startServer(fetchImpl: typeof fetch, options?: DreamImageRouterOptions): Promise<RunningServer> {
  const app = express();
  app.use(createDreamImageRouter("test-pollinations-key", fetchImpl, options));
  const server: Server = createServer(app);

  return new Promise((resolve) => {
    server.listen(0, "127.0.0.1", () => {
      const { port } = server.address() as AddressInfo;
      resolve({
        url: `http://127.0.0.1:${port}`,
        close: () => new Promise((res) => server.close(() => res())),
      });
    });
  });
}

function fakeImageResponse(bytes: number[] = [1, 2, 3]): Response {
  return new Response(Buffer.from(bytes), {
    status: 200,
    headers: { "content-type": "image/jpeg" },
  });
}

/** 大多數測試只在意端點本身的行為，所以預設帶上同源 Referer，讓來源檢查不擋路。 */
function getDreamImage(baseUrl: string, query: string, headers: Record<string, string> = {}) {
  return fetch(`${baseUrl}/api/dream-image?${query}`, {
    headers: { referer: `${baseUrl}/journal`, ...headers },
  });
}

describe("GET /api/dream-image", () => {
  it("returns 400 when prompt is missing", async () => {
    const { url, close } = await startServer(vi.fn());
    try {
      const res = await getDreamImage(url, "seed=123");
      expect(res.status).toBe(400);
    } finally {
      await close();
    }
  });

  it("returns 400 when seed is missing or not a non-negative integer", async () => {
    const { url, close } = await startServer(vi.fn());
    try {
      const res1 = await getDreamImage(url, "prompt=a+cat");
      expect(res1.status).toBe(400);

      const res2 = await getDreamImage(url, "prompt=a+cat&seed=-5");
      expect(res2.status).toBe(400);

      const res3 = await getDreamImage(url, "prompt=a+cat&seed=abc");
      expect(res3.status).toBe(400);
    } finally {
      await close();
    }
  });

  it("returns 400 when prompt exceeds the length limit, without calling the upstream API", async () => {
    const fetchImpl = vi.fn();
    const { url, close } = await startServer(fetchImpl);
    try {
      const overlongPrompt = "a".repeat(1001);
      const res = await getDreamImage(url, `prompt=${encodeURIComponent(overlongPrompt)}&seed=1`);

      expect(res.status).toBe(400);
      expect(fetchImpl).not.toHaveBeenCalled();
    } finally {
      await close();
    }
  });

  it("proxies the image bytes and forwards the content type on success", async () => {
    const fetchImpl = vi.fn().mockResolvedValue(fakeImageResponse([9, 8, 7, 6]));
    const { url, close } = await startServer(fetchImpl);

    try {
      const res = await getDreamImage(url, "prompt=a+cat&seed=42");
      expect(res.status).toBe(200);
      expect(res.headers.get("content-type")).toBe("image/jpeg");

      const bytes = new Uint8Array(await res.arrayBuffer());
      expect(Array.from(bytes)).toEqual([9, 8, 7, 6]);
    } finally {
      await close();
    }
  });

  it("sends the Pollinations Authorization header and never exposes the key to the response", async () => {
    const fetchImpl = vi.fn().mockResolvedValue(fakeImageResponse());
    const { url, close } = await startServer(fetchImpl);

    try {
      const res = await getDreamImage(url, "prompt=a+cat&seed=42");
      await res.arrayBuffer();

      expect(fetchImpl).toHaveBeenCalledOnce();
      const [, init] = fetchImpl.mock.calls[0] as [string, RequestInit];
      const headers = init.headers as Record<string, string>;
      expect(headers.Authorization).toBe("Bearer test-pollinations-key");

      const responseText = await (await getDreamImage(url, "prompt=a+cat&seed=1")).text();
      expect(responseText).not.toContain("test-pollinations-key");
    } finally {
      await close();
    }
  });

  it("passes an abort signal to the upstream fetch so a stalled request cannot hang forever", async () => {
    const fetchImpl = vi.fn().mockResolvedValue(fakeImageResponse());
    const { url, close } = await startServer(fetchImpl);

    try {
      await getDreamImage(url, "prompt=a+cat&seed=42");

      const [, init] = fetchImpl.mock.calls[0] as [string, RequestInit];
      expect(init.signal).toBeInstanceOf(AbortSignal);
    } finally {
      await close();
    }
  });

  it("returns 502 when the upstream Pollinations request fails", async () => {
    const fetchImpl = vi.fn().mockResolvedValue(new Response("nope", { status: 401 }));
    const { url, close } = await startServer(fetchImpl);

    try {
      const res = await getDreamImage(url, "prompt=a+cat&seed=42");
      expect(res.status).toBe(502);
    } finally {
      await close();
    }
  });

  it("returns 502 when the fetch itself throws", async () => {
    const fetchImpl = vi.fn().mockRejectedValue(new Error("network down"));
    const { url, close } = await startServer(fetchImpl);

    try {
      const res = await getDreamImage(url, "prompt=a+cat&seed=42");
      expect(res.status).toBe(502);
    } finally {
      await close();
    }
  });

  it("returns 502 when the upstream request times out", async () => {
    const fetchImpl = vi.fn().mockImplementation((_url: string, init?: RequestInit) => {
      return new Promise((_resolve, reject) => {
        const signal = init?.signal;
        signal?.addEventListener("abort", () => reject(signal.reason));
      });
    });
    const { url, close } = await startServer(fetchImpl, { requestTimeoutMs: 20 });

    try {
      const res = await getDreamImage(url, "prompt=a+cat&seed=42");
      expect(res.status).toBe(502);
    } finally {
      await close();
    }
  });

  it("sets a long-lived, immutable cache header on success (same prompt+seed always produce the same image)", async () => {
    const fetchImpl = vi.fn().mockResolvedValue(fakeImageResponse());
    const { url, close } = await startServer(fetchImpl);

    try {
      const res = await getDreamImage(url, "prompt=a+cat&seed=42");
      expect(res.headers.get("cache-control")).toBe("public, max-age=31536000, immutable");
    } finally {
      await close();
    }
  });

  describe("origin restriction", () => {
    it("returns 403 when the Referer header is missing", async () => {
      const fetchImpl = vi.fn().mockResolvedValue(fakeImageResponse());
      const { url, close } = await startServer(fetchImpl);

      try {
        const res = await fetch(`${url}/api/dream-image?prompt=a+cat&seed=42`);
        expect(res.status).toBe(403);
        expect(fetchImpl).not.toHaveBeenCalled();
      } finally {
        await close();
      }
    });

    it("returns 403 when the Referer host is a different (third-party) origin", async () => {
      const fetchImpl = vi.fn().mockResolvedValue(fakeImageResponse());
      const { url, close } = await startServer(fetchImpl);

      try {
        const res = await getDreamImage(url, "prompt=a+cat&seed=42", {
          referer: "https://attacker.example/embed-page",
        });
        expect(res.status).toBe(403);
        expect(fetchImpl).not.toHaveBeenCalled();
      } finally {
        await close();
      }
    });

    it("allows the request when the Referer host matches the request host", async () => {
      const fetchImpl = vi.fn().mockResolvedValue(fakeImageResponse());
      const { url, close } = await startServer(fetchImpl);

      try {
        const res = await getDreamImage(url, "prompt=a+cat&seed=42");
        expect(res.status).toBe(200);
      } finally {
        await close();
      }
    });
  });

  describe("rate limiting", () => {
    it("returns 429 once a single IP exceeds the configured request rate", async () => {
      const fetchImpl = vi.fn().mockResolvedValue(fakeImageResponse());
      const { url, close } = await startServer(fetchImpl, { rateLimit: { windowMs: 60_000, max: 1 } });

      try {
        const first = await getDreamImage(url, "prompt=a+cat&seed=1");
        expect(first.status).toBe(200);

        const second = await getDreamImage(url, "prompt=a+cat&seed=2");
        expect(second.status).toBe(429);
      } finally {
        await close();
      }
    });
  });
});

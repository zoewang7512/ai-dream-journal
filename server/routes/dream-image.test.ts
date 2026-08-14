import express from "express";
import { createServer, type Server } from "node:http";
import type { AddressInfo } from "node:net";
import { describe, expect, it, vi } from "vitest";
import { createDreamImageRouter } from "./dream-image";

interface RunningServer {
  url: string;
  close: () => Promise<void>;
}

function startServer(fetchImpl: typeof fetch): Promise<RunningServer> {
  const app = express();
  app.use(createDreamImageRouter("test-pollinations-key", fetchImpl));
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

describe("GET /api/dream-image", () => {
  it("returns 400 when prompt is missing", async () => {
    const { url, close } = await startServer(vi.fn());
    try {
      const res = await fetch(`${url}/api/dream-image?seed=123`);
      expect(res.status).toBe(400);
    } finally {
      await close();
    }
  });

  it("returns 400 when seed is missing or not a non-negative integer", async () => {
    const { url, close } = await startServer(vi.fn());
    try {
      const res1 = await fetch(`${url}/api/dream-image?prompt=a+cat`);
      expect(res1.status).toBe(400);

      const res2 = await fetch(`${url}/api/dream-image?prompt=a+cat&seed=-5`);
      expect(res2.status).toBe(400);

      const res3 = await fetch(`${url}/api/dream-image?prompt=a+cat&seed=abc`);
      expect(res3.status).toBe(400);
    } finally {
      await close();
    }
  });

  it("proxies the image bytes and forwards the content type on success", async () => {
    const fetchImpl = vi.fn().mockResolvedValue(fakeImageResponse([9, 8, 7, 6]));
    const { url, close } = await startServer(fetchImpl);

    try {
      const res = await fetch(`${url}/api/dream-image?prompt=a+cat&seed=42`);
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
      const res = await fetch(`${url}/api/dream-image?prompt=a+cat&seed=42`);
      await res.arrayBuffer();

      expect(fetchImpl).toHaveBeenCalledOnce();
      const [, init] = fetchImpl.mock.calls[0] as [string, RequestInit];
      const headers = init.headers as Record<string, string>;
      expect(headers.Authorization).toBe("Bearer test-pollinations-key");

      const responseText = await (await fetch(`${url}/api/dream-image?prompt=a+cat&seed=1`)).text();
      expect(responseText).not.toContain("test-pollinations-key");
    } finally {
      await close();
    }
  });

  it("returns 502 when the upstream Pollinations request fails", async () => {
    const fetchImpl = vi.fn().mockResolvedValue(new Response("nope", { status: 401 }));
    const { url, close } = await startServer(fetchImpl);

    try {
      const res = await fetch(`${url}/api/dream-image?prompt=a+cat&seed=42`);
      expect(res.status).toBe(502);
    } finally {
      await close();
    }
  });

  it("returns 502 when the fetch itself throws", async () => {
    const fetchImpl = vi.fn().mockRejectedValue(new Error("network down"));
    const { url, close } = await startServer(fetchImpl);

    try {
      const res = await fetch(`${url}/api/dream-image?prompt=a+cat&seed=42`);
      expect(res.status).toBe(502);
    } finally {
      await close();
    }
  });

  it("sets a long-lived, immutable cache header on success (same prompt+seed always produce the same image)", async () => {
    const fetchImpl = vi.fn().mockResolvedValue(fakeImageResponse());
    const { url, close } = await startServer(fetchImpl);

    try {
      const res = await fetch(`${url}/api/dream-image?prompt=a+cat&seed=42`);
      expect(res.headers.get("cache-control")).toBe("public, max-age=31536000, immutable");
    } finally {
      await close();
    }
  });
});

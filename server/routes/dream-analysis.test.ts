import { createServer, type Server } from "node:http";
import type { AddressInfo } from "node:net";
import type { GoogleGenAI } from "@google/genai";
import { describe, expect, it, vi } from "vitest";
import { createApp } from "../app";
import { analyzeDream as realAnalyzeDream } from "../lib/analyze-dream";
import { DreamAnalysisError } from "../lib/dream-analysis-types";
import type { AnalyzeDream, DreamAnalysisSuccessBody } from "./dream-analysis";

const fakeClient = {} as GoogleGenAI;
const fakePollinationsApiKey = "test-pollinations-key";

interface RunningServer {
  url: string;
  close: () => Promise<void>;
}

function startServer(
  analyzeDream?: AnalyzeDream,
  rateLimit?: { windowMs: number; max: number }
): Promise<RunningServer> {
  const app = createApp(fakeClient, fakePollinationsApiKey, analyzeDream, rateLimit);
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

async function postDreamAnalysis(url: string, body: unknown) {
  return fetch(`${url}/api/dream-analysis`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/dream-analysis", () => {
  it("returns 400 with errorType=invalid_request when content is missing", async () => {
    const { url, close } = await startServer();
    try {
      const res = await postDreamAnalysis(url, {});
      expect(res.status).toBe(400);
      expect(await res.json()).toEqual({
        errorType: "invalid_request",
        message: expect.any(String),
      });
    } finally {
      await close();
    }
  });

  it("returns 400 with errorType=invalid_request when content is a blank string", async () => {
    const { url, close } = await startServer();
    try {
      const res = await postDreamAnalysis(url, { content: "   " });
      expect(res.status).toBe(400);
      expect((await res.json()).errorType).toBe("invalid_request");
    } finally {
      await close();
    }
  });

  it("returns 200 with the analysis result when analyzeDream succeeds", async () => {
    const result: DreamAnalysisSuccessBody = {
      mood: "平靜",
      keywords: ["湖泊", "月光"],
      imagePrompt: "pencil sketch of a lake under moonlight",
      seed: 42,
    };
    const analyzeDream: AnalyzeDream = async () => result;
    const { url, close } = await startServer(analyzeDream);

    try {
      const res = await postDreamAnalysis(url, { content: "夢到在湖邊看月光" });
      expect(res.status).toBe(200);
      expect(await res.json()).toEqual(result);
    } finally {
      await close();
    }
  });

  it("returns 502 with errorType=upstream_error when no analyzeDream implementation is wired yet", async () => {
    const { url, close } = await startServer();

    try {
      const res = await postDreamAnalysis(url, { content: "夢到在飛" });
      expect(res.status).toBe(502);
      expect((await res.json()).errorType).toBe("upstream_error");
    } finally {
      await close();
    }
  });

  it("returns 502 with errorType=upstream_error when analyzeDream throws a plain error", async () => {
    const analyzeDream: AnalyzeDream = async () => {
      throw new Error("boom");
    };
    const { url, close } = await startServer(analyzeDream);

    try {
      const res = await postDreamAnalysis(url, { content: "夢到在飛" });
      expect(res.status).toBe(502);
      expect((await res.json()).errorType).toBe("upstream_error");
    } finally {
      await close();
    }
  });

  it("maps a DreamAnalysisError(invalid_response) to 502 and preserves the errorType", async () => {
    const analyzeDream: AnalyzeDream = async () => {
      throw new DreamAnalysisError("invalid_response", "Gemini 回傳格式不符合預期的分析結構。");
    };
    const { url, close } = await startServer(analyzeDream);

    try {
      const res = await postDreamAnalysis(url, { content: "夢到在飛" });
      expect(res.status).toBe(502);
      expect(await res.json()).toEqual({
        errorType: "invalid_response",
        message: "Gemini 回傳格式不符合預期的分析結構。",
      });
    } finally {
      await close();
    }
  });

  it("maps a DreamAnalysisError(timeout) to 504", async () => {
    const analyzeDream: AnalyzeDream = async () => {
      throw new DreamAnalysisError("timeout", "Gemini 呼叫逾時。");
    };
    const { url, close } = await startServer(analyzeDream);

    try {
      const res = await postDreamAnalysis(url, { content: "夢到在飛" });
      expect(res.status).toBe(504);
      expect((await res.json()).errorType).toBe("timeout");
    } finally {
      await close();
    }
  });

  it("maps a DreamAnalysisError(quota_exceeded) to 429", async () => {
    const analyzeDream: AnalyzeDream = async () => {
      throw new DreamAnalysisError("quota_exceeded", "已超過額度。");
    };
    const { url, close } = await startServer(analyzeDream);

    try {
      const res = await postDreamAnalysis(url, { content: "夢到在飛" });
      expect(res.status).toBe(429);
      expect((await res.json()).errorType).toBe("quota_exceeded");
    } finally {
      await close();
    }
  });

  it("does not leak the raw Gemini SDK error message in the HTTP response when the upstream call throws", async () => {
    const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const sensitiveMessage = "project=secret-internal-project-456, quota key=xyz";
    const throwingClient = {
      models: {
        generateContent: async () => {
          throw new Error(sensitiveMessage);
        },
      },
    } as unknown as GoogleGenAI;

    const app = createApp(throwingClient, fakePollinationsApiKey, realAnalyzeDream);
    const server: Server = createServer(app);

    try {
      const { url, close } = await new Promise<RunningServer>((resolve) => {
        server.listen(0, "127.0.0.1", () => {
          const { port } = server.address() as AddressInfo;
          resolve({
            url: `http://127.0.0.1:${port}`,
            close: () => new Promise((res) => server.close(() => res())),
          });
        });
      });

      try {
        const res = await postDreamAnalysis(url, { content: "夢到在飛" });
        const bodyText = await res.text();

        expect(res.status).toBe(502);
        expect(bodyText).not.toContain(sensitiveMessage);
        expect(JSON.parse(bodyText)).toEqual({
          errorType: "upstream_error",
          message: expect.any(String),
        });
      } finally {
        await close();
      }
    } finally {
      consoleErrorSpy.mockRestore();
    }
  });

  it("returns 429 with errorType=rate_limited once a single IP exceeds the configured request rate", async () => {
    const result: DreamAnalysisSuccessBody = {
      mood: "平靜",
      keywords: ["湖泊"],
      imagePrompt: "pencil sketch of a lake",
      seed: 1,
    };
    const analyzeDream: AnalyzeDream = async () => result;
    const { url, close } = await startServer(analyzeDream, { windowMs: 60_000, max: 1 });

    try {
      const first = await postDreamAnalysis(url, { content: "夢到在湖邊看月光" });
      expect(first.status).toBe(200);

      const second = await postDreamAnalysis(url, { content: "夢到在湖邊看月光" });
      expect(second.status).toBe(429);
      expect((await second.json()).errorType).toBe("rate_limited");
    } finally {
      await close();
    }
  });
});

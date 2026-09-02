import { ApiError, type GoogleGenAI } from "@google/genai";
import { describe, expect, it, vi } from "vitest";
import { analyzeDream } from "./analyze-dream";
import { DreamAnalysisError } from "./dream-analysis-types";
import { STYLE_MODIFIERS } from "./prompt-templates";

function fakeClient(generateContent: () => Promise<{ text: string | undefined }>): GoogleGenAI {
  return { models: { generateContent } } as unknown as GoogleGenAI;
}

describe("analyzeDream", () => {
  it("returns a structured analysis with a generated seed on success", async () => {
    const client = fakeClient(async () => ({
      text: JSON.stringify({ mood: "平靜", keywords: ["湖泊", "月光"], imagePrompt: "a calm lake" }),
    }));

    const result = await analyzeDream(client, "夢到在湖邊散步");

    expect(result.mood).toBe("平靜");
    expect(result.keywords).toEqual(["湖泊", "月光"]);
    expect(result.imagePrompt).toContain("a calm lake");
    expect(Number.isInteger(result.seed)).toBe(true);
  });

  it("never generates a seed above Pollinations.ai's signed 32-bit limit (2147483647)", async () => {
    const client = fakeClient(async () => ({
      text: JSON.stringify({ mood: "平靜", keywords: ["湖泊"], imagePrompt: "a calm lake" }),
    }));

    for (let i = 0; i < 200; i++) {
      const result = await analyzeDream(client, "夢到在湖邊散步");
      expect(result.seed).toBeGreaterThanOrEqual(0);
      expect(result.seed).toBeLessThanOrEqual(2147483647);
    }
  });

  it("runs the returned imagePrompt through the sketch-style enforcement (missing modifiers get appended)", async () => {
    const client = fakeClient(async () => ({
      text: JSON.stringify({
        mood: "平靜",
        keywords: ["湖泊"],
        imagePrompt: "a calm lake",
      }),
    }));

    const result = await analyzeDream(client, "夢到在湖邊散步");

    for (const modifier of STYLE_MODIFIERS) {
      expect(result.imagePrompt.toLowerCase()).toContain(modifier.toLowerCase());
    }
  });

  it("strips chromatic color words from the returned imagePrompt", async () => {
    const client = fakeClient(async () => ({
      text: JSON.stringify({
        mood: "平靜",
        keywords: ["湖泊"],
        imagePrompt: "a calm lake beside a red barn under a golden sunset",
      }),
    }));

    const result = await analyzeDream(client, "夢到在湖邊散步");

    expect(result.imagePrompt.toLowerCase()).not.toMatch(/\bred\b/);
    expect(result.imagePrompt.toLowerCase()).not.toMatch(/\bgolden\b/);
  });

  it("generates a fresh random seed on every call rather than a fixed value", async () => {
    const client = fakeClient(async () => ({
      text: JSON.stringify({ mood: "平靜", keywords: ["湖泊"], imagePrompt: "a calm lake" }),
    }));

    const first = await analyzeDream(client, "夢到在湖邊散步");
    const second = await analyzeDream(client, "夢到在湖邊散步");

    expect(first.seed).not.toBe(second.seed);
  });

  it("throws a DreamAnalysisError(invalid_response) when Gemini returns no text", async () => {
    const client = fakeClient(async () => ({ text: undefined }));

    await expect(analyzeDream(client, "夢到在飛")).rejects.toMatchObject({
      errorType: "invalid_response",
    });
  });

  it("throws invalid_response when Gemini returns malformed JSON", async () => {
    const client = fakeClient(async () => ({ text: "not json" }));

    await expect(analyzeDream(client, "夢到在飛")).rejects.toMatchObject({
      errorType: "invalid_response",
    });
  });

  it("throws invalid_response when a required field is missing", async () => {
    const client = fakeClient(async () => ({
      text: JSON.stringify({ mood: "平靜", keywords: [] }),
    }));

    await expect(analyzeDream(client, "夢到在飛")).rejects.toMatchObject({
      errorType: "invalid_response",
    });
  });

  it("throws invalid_response when mood is not one of the fixed options", async () => {
    const client = fakeClient(async () => ({
      text: JSON.stringify({ mood: "生氣", keywords: ["測試"], imagePrompt: "x" }),
    }));

    await expect(analyzeDream(client, "夢到在飛")).rejects.toMatchObject({
      errorType: "invalid_response",
    });
  });

  it("throws upstream_error, wrapped in DreamAnalysisError, when the Gemini call itself throws", async () => {
    const client = fakeClient(() => {
      throw new Error("network down");
    });

    const error = await analyzeDream(client, "夢到在飛").catch((caught: unknown) => caught);
    expect(error).toBeInstanceOf(DreamAnalysisError);
    expect((error as DreamAnalysisError).errorType).toBe("upstream_error");
  });

  it("does not leak the raw upstream error message into the upstream_error DreamAnalysisError", async () => {
    const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const sensitiveMessage = "project=secret-internal-project-123, quota key=abc";
    const client = fakeClient(() => {
      throw new Error(sensitiveMessage);
    });

    const error = await analyzeDream(client, "夢到在飛").catch((caught: unknown) => caught);

    expect(error).toBeInstanceOf(DreamAnalysisError);
    expect((error as DreamAnalysisError).message).not.toContain(sensitiveMessage);
    expect((error as DreamAnalysisError).message).toBe("Gemini API 呼叫失敗，請稍後再試。");
    // 原始錯誤仍要保留在伺服器端（cause／log），只是不能出現在要回傳前端的訊息裡。
    expect((error as DreamAnalysisError).cause).toBeInstanceOf(Error);
    expect(((error as DreamAnalysisError).cause as Error).message).toBe(sensitiveMessage);
    expect(consoleErrorSpy).toHaveBeenCalled();

    consoleErrorSpy.mockRestore();
  });

  it("classifies a 429 ApiError from Gemini as quota_exceeded", async () => {
    const client = fakeClient(() => {
      throw new ApiError({ message: "Resource exhausted", status: 429 });
    });

    const error = await analyzeDream(client, "夢到在飛").catch((caught: unknown) => caught);
    expect(error).toBeInstanceOf(DreamAnalysisError);
    expect((error as DreamAnalysisError).errorType).toBe("quota_exceeded");
  });

  it("does not classify a non-429 ApiError as quota_exceeded", async () => {
    const client = fakeClient(() => {
      throw new ApiError({ message: "Internal error", status: 500 });
    });

    const error = await analyzeDream(client, "夢到在飛").catch((caught: unknown) => caught);
    expect(error).toBeInstanceOf(DreamAnalysisError);
    expect((error as DreamAnalysisError).errorType).toBe("upstream_error");
  });

  it("classifies an AbortError (e.g. from the request timeout signal) as timeout after exhausting retries", async () => {
    vi.useFakeTimers();
    try {
      const client = fakeClient(() => {
        const abortError = new Error("The operation was aborted.");
        abortError.name = "TimeoutError";
        throw abortError;
      });

      const pending = analyzeDream(client, "夢到在飛").catch((caught: unknown) => caught);
      await vi.runAllTimersAsync();
      const error = await pending;

      expect(error).toBeInstanceOf(DreamAnalysisError);
      expect((error as DreamAnalysisError).errorType).toBe("timeout");
    } finally {
      vi.useRealTimers();
    }
  });

  it("retries once after a timeout and returns the result from the successful second attempt", async () => {
    vi.useFakeTimers();
    try {
      let callCount = 0;
      const client = fakeClient(() => {
        callCount++;
        if (callCount === 1) {
          const abortError = new Error("The operation was aborted.");
          abortError.name = "TimeoutError";
          throw abortError;
        }
        return Promise.resolve({
          text: JSON.stringify({ mood: "平靜", keywords: ["湖泊"], imagePrompt: "a calm lake" }),
        });
      });

      const pending = analyzeDream(client, "夢到在湖邊散步");
      await vi.runAllTimersAsync();
      const result = await pending;

      expect(callCount).toBe(2);
      expect(result.mood).toBe("平靜");
    } finally {
      vi.useRealTimers();
    }
  });

  it("does not retry non-timeout errors", async () => {
    let callCount = 0;
    const client = fakeClient(() => {
      callCount++;
      throw new Error("network down");
    });

    const error = await analyzeDream(client, "夢到在飛").catch((caught: unknown) => caught);
    expect(callCount).toBe(1);
    expect((error as DreamAnalysisError).errorType).toBe("upstream_error");
  });

  it("passes an abortSignal to generateContent so the call is aborted after the timeout threshold", async () => {
    let receivedSignal: AbortSignal | undefined;
    const client = {
      models: {
        generateContent: async (params: { config?: { abortSignal?: AbortSignal } }) => {
          receivedSignal = params.config?.abortSignal;
          return { text: JSON.stringify({ mood: "平靜", keywords: ["湖泊"], imagePrompt: "a calm lake" }) };
        },
      },
    } as unknown as GoogleGenAI;

    await analyzeDream(client, "夢到在湖邊散步");

    expect(receivedSignal).toBeInstanceOf(AbortSignal);
  });
});

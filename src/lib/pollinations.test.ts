import { describe, expect, it } from "vitest";
import { buildDreamImageUrl } from "./pollinations";

function getQueryParam(url: string, key: string): string | null {
  return new URL(url, "http://localhost").searchParams.get(key);
}

describe("buildDreamImageUrl", () => {
  it("builds a relative URL to the backend's /api/dream-image proxy", () => {
    const url = buildDreamImageUrl("a calm lake at dawn", 42);
    expect(url).toBe("/api/dream-image?prompt=a+calm+lake+at+dawn&seed=42");
  });

  it("produces an identical URL for the same imagePrompt and seed on repeated calls", () => {
    const first = buildDreamImageUrl("pencil sketch of a forest, monochromatic", 1234567890);
    const second = buildDreamImageUrl("pencil sketch of a forest, monochromatic", 1234567890);
    expect(first).toBe(second);
  });

  it("produces different URLs when the seed differs", () => {
    const a = buildDreamImageUrl("a calm lake", 1);
    const b = buildDreamImageUrl("a calm lake", 2);
    expect(a).not.toBe(b);
  });

  it("URL-encodes special characters in the prompt (spaces, punctuation, symbols)", () => {
    const url = buildDreamImageUrl("a dream: fog, rain & shadows (100%)", 7);
    expect(getQueryParam(url, "prompt")).toBe("a dream: fog, rain & shadows (100%)");
  });

  it("URL-encodes non-ASCII characters in the prompt", () => {
    const url = buildDreamImageUrl("夢境 dream café", 7);
    expect(getQueryParam(url, "prompt")).toBe("夢境 dream café");
  });

  it("handles a long prompt without truncation", () => {
    const longPrompt = "pencil sketch, ".repeat(150).trim();
    const url = buildDreamImageUrl(longPrompt, 99);
    expect(getQueryParam(url, "prompt")).toBe(longPrompt);
  });

  it("passes the seed through as a plain decimal string", () => {
    const url = buildDreamImageUrl("a calm lake", 2147483647);
    expect(getQueryParam(url, "seed")).toBe("2147483647");
  });
});

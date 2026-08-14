import { describe, expect, it } from "vitest";
import { createGeminiClient } from "./gemini-client";

describe("createGeminiClient", () => {
  it("creates a client instance without throwing given an API key", () => {
    expect(() => createGeminiClient("test-key")).not.toThrow();
  });
});

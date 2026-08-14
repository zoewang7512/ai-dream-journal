import { describe, expect, it } from "vitest";
import { loadConfig } from "./config";

describe("loadConfig", () => {
  it("throws a clear error when GEMINI_API_KEY is missing", () => {
    expect(() => loadConfig({ POLLINATIONS_API_KEY: "test-key" })).toThrow(/GEMINI_API_KEY/);
  });

  it("throws a clear error when GEMINI_API_KEY is empty", () => {
    expect(() =>
      loadConfig({ GEMINI_API_KEY: "", POLLINATIONS_API_KEY: "test-key" })
    ).toThrow(/GEMINI_API_KEY/);
  });

  it("throws a clear error when POLLINATIONS_API_KEY is missing", () => {
    expect(() => loadConfig({ GEMINI_API_KEY: "test-key" })).toThrow(/POLLINATIONS_API_KEY/);
  });

  it("throws a clear error when POLLINATIONS_API_KEY is empty", () => {
    expect(() =>
      loadConfig({ GEMINI_API_KEY: "test-key", POLLINATIONS_API_KEY: "" })
    ).toThrow(/POLLINATIONS_API_KEY/);
  });

  it("returns the config with a default port when both keys are set", () => {
    const config = loadConfig({ GEMINI_API_KEY: "test-key", POLLINATIONS_API_KEY: "test-pk" });
    expect(config.geminiApiKey).toBe("test-key");
    expect(config.pollinationsApiKey).toBe("test-pk");
    expect(config.port).toBe(3001);
  });

  it("uses PORT from env when provided", () => {
    const config = loadConfig({
      GEMINI_API_KEY: "test-key",
      POLLINATIONS_API_KEY: "test-pk",
      PORT: "4000",
    });
    expect(config.port).toBe(4000);
  });
});

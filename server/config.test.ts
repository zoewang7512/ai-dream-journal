import { describe, expect, it } from "vitest";
import { loadConfig } from "./config";

describe("loadConfig", () => {
  it("throws a clear error when GEMINI_API_KEY is missing", () => {
    expect(() => loadConfig({})).toThrow(/GEMINI_API_KEY/);
  });

  it("throws a clear error when GEMINI_API_KEY is empty", () => {
    expect(() => loadConfig({ GEMINI_API_KEY: "" })).toThrow(/GEMINI_API_KEY/);
  });

  it("returns the config with a default port when GEMINI_API_KEY is set", () => {
    const config = loadConfig({ GEMINI_API_KEY: "test-key" });
    expect(config.geminiApiKey).toBe("test-key");
    expect(config.port).toBe(3001);
  });

  it("uses PORT from env when provided", () => {
    const config = loadConfig({ GEMINI_API_KEY: "test-key", PORT: "4000" });
    expect(config.port).toBe(4000);
  });
});

import { describe, expect, it } from "vitest";
import { formatDisplayDate, getTodayDateString } from "./date";

describe("getTodayDateString", () => {
  it("formats a Date as YYYY-MM-DD in local time", () => {
    expect(getTodayDateString(new Date(2026, 7, 5))).toBe("2026-08-05");
  });

  it("zero-pads single-digit months and days", () => {
    expect(getTodayDateString(new Date(2026, 0, 1))).toBe("2026-01-01");
  });
});

describe("formatDisplayDate", () => {
  it("formats a past date without the today suffix", () => {
    expect(formatDisplayDate("2026-08-10", false)).toBe("2026年8月10日");
  });

  it("appends the today suffix when isToday is true", () => {
    expect(formatDisplayDate("2026-08-13", true)).toBe("2026年8月13日 · 今天");
  });

  it("returns the raw string when the format is unexpected", () => {
    expect(formatDisplayDate("not-a-date", false)).toBe("not-a-date");
  });
});

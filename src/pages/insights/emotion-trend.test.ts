import { describe, expect, it } from "vitest";
import type { DreamRecord } from "../../types/dream";
import { buildEmotionTrendLayout, formatAxisDate, MOOD_ORDER } from "./emotion-trend";

function completedRecord(date: string, mood: string | undefined): DreamRecord {
  return {
    id: date,
    date,
    content: "內容",
    status: "completed",
    analysis: mood ? { mood, keywords: [], imagePrompt: "x", seed: 1 } : undefined,
    createdAt: `${date}T00:00:00.000Z`,
  };
}

describe("buildEmotionTrendLayout", () => {
  it("returns an empty points list for no records, without throwing", () => {
    const layout = buildEmotionTrendLayout([]);

    expect(layout.points).toEqual([]);
    expect(layout.polylinePoints).toBe("");
    expect(layout.moodRows).toHaveLength(MOOD_ORDER.length);
  });

  it("places a single record's point at the horizontal center of the plot area (no divide-by-zero)", () => {
    const layout = buildEmotionTrendLayout([completedRecord("2026-08-10", "平靜")]);

    expect(layout.points).toHaveLength(1);
    const [point] = layout.points;
    expect(point.date).toBe("2026-08-10");
    expect(point.mood).toBe("平靜");
    expect(point.x).toBe((layout.plotLeft + layout.plotRight) / 2);
    expect(Number.isFinite(point.x)).toBe(true);
    expect(Number.isFinite(point.y)).toBe(true);
  });

  it("sorts points chronologically (oldest to newest, left to right) even when given newest-first input", () => {
    // listCompleted() 回傳新到舊；圖表要由舊到新（時間軸由左到右）。
    const layout = buildEmotionTrendLayout([
      completedRecord("2026-08-12", "興奮"),
      completedRecord("2026-08-10", "平靜"),
      completedRecord("2026-08-11", "悲傷"),
    ]);

    expect(layout.points.map((p) => p.date)).toEqual(["2026-08-10", "2026-08-11", "2026-08-12"]);
    // x 座標應隨日期遞增而遞增。
    expect(layout.points[0].x).toBeLessThan(layout.points[1].x);
    expect(layout.points[1].x).toBeLessThan(layout.points[2].x);
  });

  it("maps each mood to a distinct, stable Y position matching MOOD_ORDER", () => {
    const layout = buildEmotionTrendLayout([
      completedRecord("2026-08-10", "焦慮"),
      completedRecord("2026-08-11", "懷舊"),
    ]);

    const [first, second] = layout.points;
    expect(first.y).toBe(layout.moodRows.find((row) => row.mood === "焦慮")?.y);
    expect(second.y).toBe(layout.moodRows.find((row) => row.mood === "懷舊")?.y);
    expect(first.y).not.toBe(second.y);
  });

  it("skips records with a missing or unrecognized mood (defends against malformed LocalStorage data)", () => {
    const layout = buildEmotionTrendLayout([
      completedRecord("2026-08-10", "平靜"),
      completedRecord("2026-08-11", undefined),
      completedRecord("2026-08-12", "不存在的情緒"),
    ]);

    expect(layout.points).toHaveLength(1);
    expect(layout.points[0].date).toBe("2026-08-10");
  });

  it("produces a valid (non-NaN, finite) polyline points string for multiple records", () => {
    const layout = buildEmotionTrendLayout([
      completedRecord("2026-08-10", "平靜"),
      completedRecord("2026-08-11", "開心"),
      completedRecord("2026-08-12", "困惑"),
    ]);

    expect(layout.polylinePoints).not.toContain("NaN");
    expect(layout.polylinePoints.split(" ")).toHaveLength(3);
  });
});

describe("formatAxisDate", () => {
  it("formats a YYYY-MM-DD date as the compact M/D form", () => {
    expect(formatAxisDate("2026-08-07")).toBe("8/7");
    expect(formatAxisDate("2026-12-31")).toBe("12/31");
  });

  it("returns the input unchanged when it doesn't match the expected format", () => {
    expect(formatAxisDate("not-a-date")).toBe("not-a-date");
  });
});

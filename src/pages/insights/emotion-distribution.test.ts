import { describe, expect, it } from "vitest";
import type { DreamRecord } from "../../types/dream";
import { buildEmotionDistribution } from "./emotion-distribution";

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

describe("buildEmotionDistribution", () => {
  it("returns an empty list when there are no records with a recognizable mood", () => {
    expect(buildEmotionDistribution([])).toEqual([]);
    expect(buildEmotionDistribution([completedRecord("2026-08-10", undefined)])).toEqual([]);
  });

  it("skips records with an unrecognized mood", () => {
    const slices = buildEmotionDistribution([
      completedRecord("2026-08-10", "平靜"),
      completedRecord("2026-08-11", "不存在的情緒"),
    ]);

    expect(slices).toHaveLength(1);
    expect(slices[0].mood).toBe("平靜");
  });

  it("assigns 100% to a single mood when every record shares it", () => {
    const slices = buildEmotionDistribution([
      completedRecord("2026-08-10", "平靜"),
      completedRecord("2026-08-11", "平靜"),
    ]);

    expect(slices).toHaveLength(1);
    expect(slices[0].percentage).toBe(100);
    expect(slices[0].fraction).toBe(1);
  });

  it("always sums percentages to exactly 100, even when equal thirds would round to 99", () => {
    // 1/3 each -> 33.33...% -> naive rounding gives 33+33+33=99; largest-remainder must fix this.
    const slices = buildEmotionDistribution([
      completedRecord("2026-08-10", "焦慮"),
      completedRecord("2026-08-11", "平靜"),
      completedRecord("2026-08-12", "興奮"),
    ]);

    const totalPercentage = slices.reduce((sum, slice) => sum + slice.percentage, 0);
    expect(totalPercentage).toBe(100);
    expect(slices).toHaveLength(3);
  });

  it("sums percentages to exactly 100 for an uneven, real-world-like distribution", () => {
    const records = [
      ...Array(5).fill(null).map((_, i) => completedRecord(`2026-08-${10 + i}`, "懷舊")),
      ...Array(3).fill(null).map((_, i) => completedRecord(`2026-08-${20 + i}`, "平靜")),
      ...Array(2).fill(null).map((_, i) => completedRecord(`2026-08-${24 + i}`, "開心")),
      completedRecord("2026-08-30", "困惑"),
    ];

    const slices = buildEmotionDistribution(records);
    const totalPercentage = slices.reduce((sum, slice) => sum + slice.percentage, 0);
    expect(totalPercentage).toBe(100);
  });

  it("sorts slices by descending count and assigns each a distinct color token", () => {
    const slices = buildEmotionDistribution([
      completedRecord("2026-08-10", "興奮"),
      completedRecord("2026-08-11", "平靜"),
      completedRecord("2026-08-12", "平靜"),
    ]);

    expect(slices.map((s) => s.mood)).toEqual(["平靜", "興奮"]);
    expect(slices[0].percentage).toBeGreaterThan(slices[1].percentage);
    expect(new Set(slices.map((s) => s.colorToken)).size).toBe(slices.length);
  });

  it("produces contiguous gradient stops that start at 0% and end at 100%", () => {
    const slices = buildEmotionDistribution([
      completedRecord("2026-08-10", "焦慮"),
      completedRecord("2026-08-11", "平靜"),
      completedRecord("2026-08-12", "平靜"),
    ]);

    expect(slices[0].gradientStart).toBe("0.0000%");
    expect(slices[slices.length - 1].gradientEnd).toBe("100.0000%");
    for (let i = 1; i < slices.length; i++) {
      expect(slices[i].gradientStart).toBe(slices[i - 1].gradientEnd);
    }
  });
});

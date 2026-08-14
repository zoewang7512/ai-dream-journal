import { describe, expect, it } from "vitest";
import type { DreamRecord } from "../../types/dream";
import { buildKeywordCloud } from "./keyword-cloud";

function completedRecord(date: string, keywords: string[] | undefined): DreamRecord {
  return {
    id: date,
    date,
    content: "內容",
    status: "completed",
    analysis: keywords ? { mood: "平靜", keywords, imagePrompt: "x", seed: 1 } : undefined,
    createdAt: `${date}T00:00:00.000Z`,
  };
}

describe("buildKeywordCloud", () => {
  it("returns an empty list when there are no records or no keywords", () => {
    expect(buildKeywordCloud([])).toEqual([]);
    expect(buildKeywordCloud([completedRecord("2026-08-10", undefined)])).toEqual([]);
    expect(buildKeywordCloud([completedRecord("2026-08-10", [])])).toEqual([]);
  });

  it("counts keyword frequency across multiple records and sorts descending", () => {
    const items = buildKeywordCloud([
      completedRecord("2026-08-10", ["飛翔", "森林"]),
      completedRecord("2026-08-11", ["飛翔", "海洋"]),
      completedRecord("2026-08-12", ["飛翔"]),
    ]);

    expect(items[0]).toMatchObject({ keyword: "飛翔", count: 3 });
    expect(items.map((i) => i.keyword)).toEqual(["飛翔", "森林", "海洋"]);
  });

  it("shows all keywords when there are fewer than 20", () => {
    const items = buildKeywordCloud([completedRecord("2026-08-10", ["飛翔", "森林", "海洋"])]);
    expect(items).toHaveLength(3);
  });

  it("truncates to the top 20 keywords when there are more than 20", () => {
    const keywords = Array.from({ length: 25 }, (_, i) => `關鍵字${i}`);
    const items = buildKeywordCloud([completedRecord("2026-08-10", keywords)]);
    expect(items).toHaveLength(20);
  });

  it("uses the maximum font size for every keyword when all counts are equal (avoids divide-by-zero)", () => {
    const items = buildKeywordCloud([completedRecord("2026-08-10", ["飛翔", "森林"])]);

    expect(items.every((item) => item.fontSize === 34)).toBe(true);
  });

  it("scales font size between the min and max for a real frequency spread", () => {
    const items = buildKeywordCloud([
      completedRecord("2026-08-10", ["飛翔", "森林"]),
      completedRecord("2026-08-11", ["飛翔"]),
      completedRecord("2026-08-12", ["飛翔"]),
    ]);

    const flying = items.find((i) => i.keyword === "飛翔")!;
    const forest = items.find((i) => i.keyword === "森林")!;
    expect(flying.count).toBe(3);
    expect(forest.count).toBe(1);
    expect(flying.fontSize).toBeGreaterThan(forest.fontSize);
    expect(flying.fontSize).toBe(34);
    expect(forest.fontSize).toBe(14);
  });

  it("ignores blank/whitespace-only keyword strings", () => {
    const items = buildKeywordCloud([completedRecord("2026-08-10", ["飛翔", "  ", ""])]);
    expect(items.map((i) => i.keyword)).toEqual(["飛翔"]);
  });
});

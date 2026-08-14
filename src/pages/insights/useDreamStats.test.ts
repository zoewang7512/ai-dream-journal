import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import * as dreamStorage from "../../lib/dream-storage";
import { useDreamStats } from "./useDreamStats";

beforeEach(() => {
  window.localStorage.clear();
});

describe("useDreamStats", () => {
  it("returns an empty, zeroed-out result when there are no completed entries", () => {
    const { result } = renderHook(() => useDreamStats());

    expect(result.current).toEqual({
      records: [],
      totalCompleted: 0,
      averageWordCount: 0,
      daysRecorded: 0,
      isEmpty: true,
    });
  });

  it("ignores draft entries and only counts completed ones", () => {
    dreamStorage.create({ date: "2026-08-10", content: "草稿內容", status: "draft" });
    dreamStorage.create({ date: "2026-08-11", content: "完成內容", status: "completed" });

    const { result } = renderHook(() => useDreamStats());

    expect(result.current.totalCompleted).toBe(1);
    expect(result.current.isEmpty).toBe(false);
  });

  it("computes the average word count across all completed entries", () => {
    dreamStorage.create({ date: "2026-08-10", content: "一二三四", status: "completed" });
    dreamStorage.create({ date: "2026-08-11", content: "一二三四五六", status: "completed" });

    const { result } = renderHook(() => useDreamStats());

    // (4 + 6) / 2 = 5
    expect(result.current.averageWordCount).toBe(5);
  });

  it("rounds a non-integer average word count", () => {
    dreamStorage.create({ date: "2026-08-10", content: "一二三", status: "completed" });
    dreamStorage.create({ date: "2026-08-11", content: "一二三四", status: "completed" });

    const { result } = renderHook(() => useDreamStats());

    // (3 + 4) / 2 = 3.5 -> rounds to 4
    expect(result.current.averageWordCount).toBe(4);
  });

  it("counts days recorded as the number of distinct dates with a completed entry", () => {
    dreamStorage.create({ date: "2026-08-10", content: "a", status: "completed" });
    dreamStorage.create({ date: "2026-08-11", content: "b", status: "completed" });
    dreamStorage.create({ date: "2026-08-12", content: "c", status: "completed" });

    const { result } = renderHook(() => useDreamStats());

    expect(result.current.daysRecorded).toBe(3);
    expect(result.current.totalCompleted).toBe(3);
  });

  it("handles exactly one completed entry gracefully (no division-by-zero-style artifacts)", () => {
    dreamStorage.create({ date: "2026-08-10", content: "一二三四五", status: "completed" });

    const { result } = renderHook(() => useDreamStats());

    expect(result.current.totalCompleted).toBe(1);
    expect(result.current.averageWordCount).toBe(5);
    expect(result.current.daysRecorded).toBe(1);
    expect(result.current.isEmpty).toBe(false);
  });
});

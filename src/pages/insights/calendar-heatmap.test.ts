import { describe, expect, it } from "vitest";
import type { DreamRecord } from "../../types/dream";
import { buildCalendarHeatmap, shiftMonth } from "./calendar-heatmap";

function completedRecord(date: string): DreamRecord {
  return {
    id: date,
    date,
    content: "內容",
    status: "completed",
    createdAt: `${date}T00:00:00.000Z`,
  };
}

describe("buildCalendarHeatmap", () => {
  it("returns the correct number of cells (leading blanks + days in month) with no records", () => {
    // 2026-08-01 is a Saturday (day 6), August has 31 days.
    const data = buildCalendarHeatmap([], 2026, 8);

    const leadingBlanks = data.cells.filter((cell) => cell.day === null).length;
    const dayCells = data.cells.filter((cell) => cell.day !== null);

    expect(leadingBlanks).toBe(6);
    expect(dayCells).toHaveLength(31);
    expect(dayCells.every((cell) => !cell.hasRecord)).toBe(true);
  });

  it("marks only the days that have a completed record in the target year/month", () => {
    const data = buildCalendarHeatmap(
      [completedRecord("2026-08-02"), completedRecord("2026-08-15")],
      2026,
      8
    );

    const recordedDays = data.cells.filter((cell) => cell.hasRecord).map((cell) => cell.day);
    expect(recordedDays).toEqual([2, 15]);
  });

  it("ignores records outside the target month or year", () => {
    const data = buildCalendarHeatmap(
      [completedRecord("2026-07-02"), completedRecord("2025-08-02"), completedRecord("2026-08-02")],
      2026,
      8
    );

    const recordedDays = data.cells.filter((cell) => cell.hasRecord).map((cell) => cell.day);
    expect(recordedDays).toEqual([2]);
  });

  it("computes February's day count correctly, including a leap year", () => {
    expect(buildCalendarHeatmap([], 2024, 2).cells.filter((c) => c.day !== null)).toHaveLength(29);
    expect(buildCalendarHeatmap([], 2026, 2).cells.filter((c) => c.day !== null)).toHaveLength(28);
  });
});

describe("shiftMonth", () => {
  it("moves forward within the same year", () => {
    expect(shiftMonth(2026, 8, 1)).toEqual({ year: 2026, month: 9 });
  });

  it("moves backward within the same year", () => {
    expect(shiftMonth(2026, 8, -1)).toEqual({ year: 2026, month: 7 });
  });

  it("rolls over into the next year from December", () => {
    expect(shiftMonth(2026, 12, 1)).toEqual({ year: 2027, month: 1 });
  });

  it("rolls back into the previous year from January", () => {
    expect(shiftMonth(2026, 1, -1)).toEqual({ year: 2025, month: 12 });
  });
});

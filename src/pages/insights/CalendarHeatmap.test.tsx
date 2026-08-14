import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import type { DreamRecord } from "../../types/dream";
import { CalendarHeatmap } from "./CalendarHeatmap";

function completedRecord(date: string): DreamRecord {
  return {
    id: date,
    date,
    content: "內容",
    status: "completed",
    createdAt: `${date}T00:00:00.000Z`,
  };
}

const AUGUST_2026 = new Date(2026, 7, 15); // 固定在 2026-08-15，測試不依賴系統時鐘

describe("CalendarHeatmap", () => {
  it("renders the day-of-week headers and the initial month label", () => {
    render(<CalendarHeatmap records={[]} initialDate={AUGUST_2026} />);

    for (const label of ["日", "一", "二", "三", "四", "五", "六"]) {
      expect(screen.getByText(label)).toBeInTheDocument();
    }
    expect(screen.getByText("2026年8月")).toBeInTheDocument();
  });

  it("highlights only the days that have a completed record, via the cell's title", () => {
    render(
      <CalendarHeatmap
        records={[completedRecord("2026-08-02"), completedRecord("2026-08-15")]}
        initialDate={AUGUST_2026}
      />
    );

    expect(screen.getByTitle("8月2日：已完成紀錄")).toBeInTheDocument();
    expect(screen.getByTitle("8月15日：已完成紀錄")).toBeInTheDocument();
    expect(screen.getByTitle("8月1日")).toBeInTheDocument();
  });

  it("switches to the next month and updates the label and highlighted days accordingly", async () => {
    const user = userEvent.setup();
    render(
      <CalendarHeatmap records={[completedRecord("2026-09-05")]} initialDate={AUGUST_2026} />
    );

    expect(screen.getByText("2026年8月")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "下一月" }));

    expect(screen.getByText("2026年9月")).toBeInTheDocument();
    expect(screen.getByTitle("9月5日：已完成紀錄")).toBeInTheDocument();
  });

  it("switches to the previous month, rolling over the year boundary correctly", async () => {
    const user = userEvent.setup();
    render(<CalendarHeatmap records={[]} initialDate={new Date(2026, 0, 10)} />);

    expect(screen.getByText("2026年1月")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "上一月" }));

    expect(screen.getByText("2025年12月")).toBeInTheDocument();
  });
});

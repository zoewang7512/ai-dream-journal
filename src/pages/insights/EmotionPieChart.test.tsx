import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { DreamRecord } from "../../types/dream";
import { EmotionPieChart } from "./EmotionPieChart";

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

describe("EmotionPieChart", () => {
  it("renders a fallback message instead of a broken chart when there is no usable mood data", () => {
    render(<EmotionPieChart records={[completedRecord("2026-08-10", undefined)]} />);

    expect(screen.getByText("暫無可顯示的情緒資料。")).toBeInTheDocument();
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
  });

  it("renders a single 100% slice and legend entry when every record shares one mood", () => {
    render(
      <EmotionPieChart
        records={[completedRecord("2026-08-10", "平靜"), completedRecord("2026-08-11", "平靜")]}
      />
    );

    expect(screen.getByRole("img", { name: /情緒分佈圓餅圖/ })).toBeInTheDocument();
    expect(screen.getByText(/平靜.*100%/)).toBeInTheDocument();
  });

  it("renders one legend entry per distinct mood, with percentages summing to 100", () => {
    render(
      <EmotionPieChart
        records={[
          completedRecord("2026-08-10", "焦慮"),
          completedRecord("2026-08-11", "平靜"),
          completedRecord("2026-08-12", "興奮"),
        ]}
      />
    );

    const items = screen.getAllByRole("listitem");
    expect(items).toHaveLength(3);
    const total = items.reduce((sum, item) => {
      const match = /(\d+)%/.exec(item.textContent ?? "");
      return sum + (match ? Number(match[1]) : 0);
    }, 0);
    expect(total).toBe(100);
  });
});

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { DreamRecord } from "../../types/dream";
import { EmotionTrendChart } from "./EmotionTrendChart";

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

describe("EmotionTrendChart", () => {
  it("renders a fallback message instead of a broken chart when there is no usable mood data", () => {
    render(<EmotionTrendChart records={[completedRecord("2026-08-10", undefined)]} />);

    expect(screen.getByText("暫無可顯示的情緒資料。")).toBeInTheDocument();
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
  });

  it("renders a single point without a connecting line when there is exactly one record", () => {
    const { container } = render(
      <EmotionTrendChart records={[completedRecord("2026-08-10", "平靜")]} />
    );

    expect(screen.getByRole("img", { name: /情緒趨勢折線圖/ })).toBeInTheDocument();
    expect(container.querySelectorAll("circle")).toHaveLength(1);
    expect(container.querySelector("polyline")).not.toBeInTheDocument();
  });

  it("renders a connected line across multiple points, sorted chronologically", () => {
    const { container } = render(
      <EmotionTrendChart
        records={[
          completedRecord("2026-08-12", "興奮"),
          completedRecord("2026-08-10", "平靜"),
          completedRecord("2026-08-11", "悲傷"),
        ]}
      />
    );

    expect(container.querySelectorAll("circle")).toHaveLength(3);
    const polyline = container.querySelector("polyline");
    expect(polyline).toBeInTheDocument();
    expect(polyline?.getAttribute("points")?.split(" ")).toHaveLength(3);
  });

  it("skips records with an unrecognized mood but still renders the rest", () => {
    const { container } = render(
      <EmotionTrendChart
        records={[
          completedRecord("2026-08-10", "平靜"),
          completedRecord("2026-08-11", "不存在的情緒"),
        ]}
      />
    );

    expect(container.querySelectorAll("circle")).toHaveLength(1);
  });
});

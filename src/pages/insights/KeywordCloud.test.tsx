import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { DreamRecord } from "../../types/dream";
import { KeywordCloud } from "./KeywordCloud";

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

describe("KeywordCloud", () => {
  it("renders a fallback message instead of an empty cloud when there is no usable keyword data", () => {
    render(<KeywordCloud records={[completedRecord("2026-08-10", undefined)]} />);

    expect(screen.getByText("暫無可顯示的關鍵字資料。")).toBeInTheDocument();
  });

  it("renders all keywords when there are fewer than 20, with a title showing the count", () => {
    render(
      <KeywordCloud
        records={[
          completedRecord("2026-08-10", ["飛翔", "森林"]),
          completedRecord("2026-08-11", ["飛翔"]),
        ]}
      />
    );

    expect(screen.getByText("飛翔")).toHaveAttribute("title", "飛翔：出現 2 次");
    expect(screen.getByText("森林")).toHaveAttribute("title", "森林：出現 1 次");
  });

  it("truncates to 20 keywords when there are more, and gives the most frequent one the largest font size", () => {
    const keywords = Array.from({ length: 25 }, (_, i) => `關鍵字${i}`);
    render(<KeywordCloud records={[completedRecord("2026-08-10", keywords)]} />);

    expect(screen.getAllByText(/^關鍵字/)).toHaveLength(20);
  });
});

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";
import { create, update } from "../../lib/dream-storage";
import { getTodayDateString } from "./date";
import JournalPage from "./JournalPage";

const today = getTodayDateString();

beforeEach(() => {
  window.localStorage.clear();
});

describe("JournalPage", () => {
  it("renders the today-editing view when there is no record yet", () => {
    render(<JournalPage />);

    expect(screen.getByRole("heading", { name: "夢境日記" })).toBeInTheDocument();
    expect(screen.getByText("撰寫中")).toBeInTheDocument();
    expect(screen.getByText("今天的夢還記得嗎？寫下來吧。")).toBeInTheDocument();
    expect(
      screen.getByText("完成今天的紀錄後，這裡會顯示 AI 分析與插圖。")
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "← 上一篇" })).toBeDisabled();
    expect(screen.queryByRole("button", { name: "下一篇 →" })).not.toBeInTheDocument();
  });

  it("renders the readonly history view for a completed past record", async () => {
    create({
      date: "2026-08-10",
      content: "夢到在飛",
      status: "completed",
      analysis: { mood: "平靜", keywords: ["飛翔", "自由"], imagePrompt: "flying dream", seed: 1 },
    });

    render(<JournalPage />);

    const previousButton = screen.getByRole("button", { name: "← 上一篇" });
    expect(previousButton).toBeEnabled();
    await userEvent.click(previousButton);

    expect(screen.getByText("已完成")).toBeInTheDocument();
    expect(screen.getByText("夢到在飛")).toBeInTheDocument();
    expect(screen.getByText("平靜")).toBeInTheDocument();
    expect(screen.getByText("飛翔")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "下一篇 →" })).toBeEnabled();

    await userEvent.click(screen.getByRole("button", { name: "下一篇 →" }));
    expect(screen.getByText("撰寫中")).toBeInTheDocument();
  });

  it("switches straight to readonly mode once today's entry is completed", () => {
    create({ date: today, content: "今天的夢" });
    update(today, {
      status: "completed",
      analysis: { mood: "興奮", keywords: ["冒險"], imagePrompt: "adventure", seed: 2 },
    });

    render(<JournalPage />);

    expect(screen.getByText("已完成")).toBeInTheDocument();
    expect(screen.getByText("今天的夢")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "完成" })).not.toBeInTheDocument();
  });
});

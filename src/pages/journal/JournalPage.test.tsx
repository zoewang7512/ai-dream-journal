import { render, screen, within } from "@testing-library/react";
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
    expect(
      screen.getByRole("textbox", { name: "今日夢境日記內容" })
    ).toHaveAttribute("placeholder", "今天的夢還記得嗎？寫下來吧。");
    expect(
      screen.getByText("完成今天的紀錄後，這裡會顯示 AI 分析與插圖。")
    ).toBeInTheDocument();
    expect(
      screen.getByText("還沒有翻頁可看的舊日記，完成今天的第一篇吧。")
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "← 上一篇" })).toBeDisabled();
    expect(screen.queryByRole("button", { name: "下一篇 →" })).not.toBeInTheDocument();
  });

  it("supports the flip-to-history journey: navigate to a past entry, view its full readonly detail, and flip back", async () => {
    create({
      date: "2026-08-10",
      content: "夢到在飛",
      status: "completed",
      analysis: { mood: "平靜", keywords: ["飛翔", "自由"], imagePrompt: "flying dream", seed: 1 },
      imageUrl: "https://example.com/dream.png",
    });

    render(<JournalPage />);

    expect(
      screen.queryByText("還沒有翻頁可看的舊日記，完成今天的第一篇吧。")
    ).not.toBeInTheDocument();

    const previousButton = screen.getByRole("button", { name: "← 上一篇" });
    expect(previousButton).toBeEnabled();
    await userEvent.click(previousButton);

    expect(screen.getByText("已完成")).toBeInTheDocument();
    expect(screen.getByText("夢到在飛")).toBeInTheDocument();
    expect(screen.getByText("平靜")).toBeInTheDocument();
    expect(screen.getByText("飛翔")).toBeInTheDocument();
    expect(
      screen.getByRole("img", { name: "AI 生成的夢境插圖" })
    ).toHaveAttribute("src", "https://example.com/dream.png");
    expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "刪除" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "存檔" })).not.toBeInTheDocument();
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
    expect(screen.queryByRole("button", { name: "刪除" })).not.toBeInTheDocument();
  });

  it("offers no delete entry point when browsing a past completed record", async () => {
    create({
      date: "2026-08-10",
      content: "夢到在飛",
      status: "completed",
      analysis: { mood: "平靜", keywords: ["飛翔"], imagePrompt: "flying dream", seed: 1 },
    });

    render(<JournalPage />);
    await userEvent.click(screen.getByRole("button", { name: "← 上一篇" }));

    expect(screen.getByText("已完成")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "刪除" })).not.toBeInTheDocument();
  });

  it("keeps a saved draft after the page is unmounted and re-rendered (simulated reload)", async () => {
    const { unmount } = render(<JournalPage />);

    await userEvent.type(
      screen.getByRole("textbox", { name: "今日夢境日記內容" }),
      "睡醒後立刻寫下的夢"
    );
    await userEvent.click(screen.getByRole("button", { name: "存檔" }));

    unmount();
    render(<JournalPage />);

    expect(
      screen.getByRole("textbox", { name: "今日夢境日記內容" })
    ).toHaveValue("睡醒後立刻寫下的夢");
  });

  it("supports the full add draft → delete → reload journey with the record fully cleared", async () => {
    const { unmount } = render(<JournalPage />);

    await userEvent.type(
      screen.getByRole("textbox", { name: "今日夢境日記內容" }),
      "打算刪掉的暫存"
    );
    await userEvent.click(screen.getByRole("button", { name: "存檔" }));
    expect(screen.getByRole("button", { name: "刪除" })).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "刪除" }));
    const dialog = screen.getByRole("dialog", { name: "刪除這篇日記？" });
    await userEvent.click(within(dialog).getByRole("button", { name: "刪除" }));

    expect(
      screen.getByRole("textbox", { name: "今日夢境日記內容" })
    ).toHaveValue("");
    expect(screen.queryByRole("button", { name: "刪除" })).not.toBeInTheDocument();

    unmount();
    render(<JournalPage />);

    expect(
      screen.getByRole("textbox", { name: "今日夢境日記內容" })
    ).toHaveValue("");
    expect(screen.queryByRole("button", { name: "刪除" })).not.toBeInTheDocument();
  });
});

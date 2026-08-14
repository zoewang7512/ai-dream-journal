import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { create } from "../../lib/dream-storage";
import InsightsPage from "./InsightsPage";

const CHART_TITLES = ["摘要", "情緒趨勢", "紀錄月曆", "關鍵字文字雲"];

function renderInsightsPage() {
  return render(
    <MemoryRouter initialEntries={["/dashboard"]}>
      <Routes>
        <Route path="/" element={<p>寫日記頁面</p>} />
        <Route path="/dashboard" element={<InsightsPage />} />
      </Routes>
    </MemoryRouter>
  );
}

beforeEach(() => {
  window.localStorage.clear();
});

describe("InsightsPage", () => {
  it("renders the page title and all four chart card headers", () => {
    renderInsightsPage();

    expect(screen.getByRole("heading", { name: "夢境數據看板", level: 1 })).toBeInTheDocument();
    for (const title of CHART_TITLES) {
      expect(screen.getByRole("heading", { name: title, level: 2 })).toBeInTheDocument();
    }
  });

  it("shows a consistent empty-state message and CTA in all four chart blocks when there are 0 completed entries", () => {
    renderInsightsPage();

    const emptyMessages = screen.getAllByText(
      "還沒有足夠的夢境紀錄可以分析。完成第一篇日記後，這裡就會出現圖表。"
    );
    expect(emptyMessages).toHaveLength(4);

    const ctaButtons = screen.getAllByRole("button", { name: "前往寫日記" });
    expect(ctaButtons).toHaveLength(4);
  });

  it("navigates to the journal page when the empty-state CTA is clicked", async () => {
    const user = userEvent.setup();
    renderInsightsPage();

    await user.click(screen.getAllByRole("button", { name: "前往寫日記" })[0]);

    expect(screen.getByText("寫日記頁面")).toBeInTheDocument();
  });

  it("shows real stats and no empty-state CTA once there is at least one completed entry", () => {
    create({
      date: "2026-08-10",
      content: "夢到在湖邊散步",
      status: "completed",
      analysis: { mood: "平靜", keywords: ["湖泊"], imagePrompt: "a lake", seed: 1 },
    });

    renderInsightsPage();

    expect(screen.queryByRole("button", { name: "前往寫日記" })).not.toBeInTheDocument();
    // 總完成篇數與記錄天數皆為 1（單篇資料時兩者剛好相等）。
    expect(screen.getAllByText("1")).toHaveLength(2);
    expect(screen.getByText("總完成篇數")).toBeInTheDocument();
    expect(screen.getByText("平均字數")).toBeInTheDocument();
    expect(screen.getByText("記錄天數")).toBeInTheDocument();
  });

  it("switching the calendar heatmap's month does not affect the other chart blocks (summary stats, emotion trend)", async () => {
    const user = userEvent.setup();
    create({
      date: "2026-08-10",
      content: "夢到在湖邊散步",
      status: "completed",
      analysis: { mood: "平靜", keywords: ["湖泊"], imagePrompt: "a lake", seed: 1 },
    });

    renderInsightsPage();

    const trendChartBefore = screen.getByRole("img", { name: /情緒趨勢折線圖/ }).getAttribute("aria-label");
    const totalBefore = screen.getAllByText("1");

    await user.click(screen.getByRole("button", { name: "下一月" }));

    expect(screen.getByRole("img", { name: /情緒趨勢折線圖/ }).getAttribute("aria-label")).toBe(
      trendChartBefore
    );
    expect(screen.getAllByText("1")).toHaveLength(totalBefore.length);
    expect(screen.getByText("總完成篇數")).toBeInTheDocument();
  });

  it("renders without crashing when there is exactly one completed entry, including a working single-point emotion trend chart", () => {
    create({
      date: "2026-08-10",
      content: "夢到在湖邊散步",
      status: "completed",
      analysis: { mood: "平靜", keywords: ["湖泊"], imagePrompt: "a lake", seed: 1 },
    });

    expect(() => renderInsightsPage()).not.toThrow();
    expect(screen.getByRole("heading", { name: "夢境數據看板", level: 1 })).toBeInTheDocument();
    expect(screen.getByRole("img", { name: /情緒趨勢折線圖/ })).toBeInTheDocument();
  });
});

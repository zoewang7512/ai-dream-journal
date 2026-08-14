import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { StatsSummaryCards } from "./StatsSummaryCards";

describe("StatsSummaryCards", () => {
  it("renders the three stat numbers with their labels", () => {
    render(<StatsSummaryCards totalCompleted={12} averageWordCount={186} daysRecorded={9} />);

    expect(screen.getByText("12")).toBeInTheDocument();
    expect(screen.getByText("總完成篇數")).toBeInTheDocument();
    expect(screen.getByText("186")).toBeInTheDocument();
    expect(screen.getByText("平均字數")).toBeInTheDocument();
    expect(screen.getByText("9")).toBeInTheDocument();
    expect(screen.getByText("記錄天數")).toBeInTheDocument();
  });

  it("renders zeroed-out stats without crashing", () => {
    render(<StatsSummaryCards totalCompleted={0} averageWordCount={0} daysRecorded={0} />);

    expect(screen.getAllByText("0")).toHaveLength(3);
  });
});

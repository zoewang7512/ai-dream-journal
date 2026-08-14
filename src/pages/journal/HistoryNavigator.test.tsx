import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { HistoryNavigator } from "./HistoryNavigator";

describe("HistoryNavigator", () => {
  it("renders an enabled previous button and calls onNavigate when clicked", async () => {
    const onNavigate = vi.fn();
    render(
      <HistoryNavigator direction="previous" visible disabled={false} onNavigate={onNavigate} />
    );

    const button = screen.getByRole("button", { name: "← 上一篇" });
    expect(button).toBeEnabled();
    await userEvent.click(button);
    expect(onNavigate).toHaveBeenCalledOnce();
  });

  it("renders a disabled next button at a boundary", () => {
    render(
      <HistoryNavigator direction="next" visible disabled onNavigate={() => {}} />
    );

    expect(screen.getByRole("button", { name: "下一篇 →" })).toBeDisabled();
  });

  it("renders nothing when visible is false", () => {
    render(
      <HistoryNavigator direction="next" visible={false} disabled={false} onNavigate={() => {}} />
    );

    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });
});

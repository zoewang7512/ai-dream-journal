import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import userEvent from "@testing-library/user-event";
import { Toast } from "./Toast";

describe("Toast", () => {
  it("renders nothing when closed", () => {
    render(
      <Toast open={false} onOpenChange={() => {}} variant="success" title="已儲存" />
    );
    expect(screen.queryByText("已儲存")).not.toBeInTheDocument();
  });

  it("shows the semantic kind label alongside color (not color-only)", () => {
    render(
      <Toast
        open
        onOpenChange={() => {}}
        variant="danger"
        title="儲存失敗"
        description="請稍後再試一次。"
      />
    );

    expect(screen.getByText("錯誤")).toBeInTheDocument();
    expect(screen.getByText("儲存失敗")).toBeInTheDocument();
    expect(screen.getByText("請稍後再試一次。")).toBeInTheDocument();
  });

  it("calls onOpenChange(false) when the close button is clicked", async () => {
    const onOpenChange = vi.fn();
    render(
      <Toast open onOpenChange={onOpenChange} variant="info" title="提醒你今天還沒寫日記" />
    );

    await userEvent.click(screen.getByRole("button", { name: "關閉" }));
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });
});

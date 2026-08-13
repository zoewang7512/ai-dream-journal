import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import userEvent from "@testing-library/user-event";
import { Modal } from "./Modal";

describe("Modal", () => {
  it("renders nothing when closed", () => {
    render(
      <Modal open={false} onOpenChange={() => {}} title="刪除這篇日記？" />
    );
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("renders the title and description when open", () => {
    render(
      <Modal
        open
        onOpenChange={() => {}}
        title="刪除這篇日記？"
        description="刪除後無法復原。"
      />
    );

    expect(screen.getByRole("dialog", { name: "刪除這篇日記？" })).toBeInTheDocument();
    expect(screen.getByText("刪除後無法復原。")).toBeInTheDocument();
  });

  it("calls onOpenChange(false) when the close button is clicked", async () => {
    const onOpenChange = vi.fn();
    render(<Modal open onOpenChange={onOpenChange} title="刪除這篇日記？" />);

    await userEvent.click(screen.getByRole("button", { name: "關閉" }));
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });
});

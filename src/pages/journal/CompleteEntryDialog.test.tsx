import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { CompleteEntryDialog } from "./CompleteEntryDialog";

describe("CompleteEntryDialog", () => {
  it("renders nothing when closed", () => {
    render(<CompleteEntryDialog open={false} onOpenChange={() => {}} onConfirm={() => {}} />);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("shows the confirmation copy mentioning AI generation and the third-party service", () => {
    render(<CompleteEntryDialog open onOpenChange={() => {}} onConfirm={() => {}} />);

    expect(screen.getByRole("dialog", { name: "完成這篇日記？" })).toBeInTheDocument();
    expect(screen.getByText(/AI 分析與圖片生成/)).toBeInTheDocument();
    expect(screen.getByText(/第三方 AI 服務/)).toBeInTheDocument();
  });

  it("calls onOpenChange(false) when 取消 is clicked", async () => {
    const onOpenChange = vi.fn();
    render(<CompleteEntryDialog open onOpenChange={onOpenChange} onConfirm={() => {}} />);

    await userEvent.click(screen.getByRole("button", { name: "取消" }));
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("calls onConfirm when 確定完成 is clicked", async () => {
    const onConfirm = vi.fn();
    render(<CompleteEntryDialog open onOpenChange={() => {}} onConfirm={onConfirm} />);

    await userEvent.click(screen.getByRole("button", { name: "確定完成" }));
    expect(onConfirm).toHaveBeenCalledOnce();
  });
});

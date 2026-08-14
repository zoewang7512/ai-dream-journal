import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { BackupSettingsButton } from "./BackupSettingsButton";

describe("BackupSettingsButton", () => {
  it("does not show the modal content until the gear icon is clicked", () => {
    render(<BackupSettingsButton />);

    expect(screen.getByRole("button", { name: "備份設定" })).toBeInTheDocument();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("opens the modal with both the export and import entry points enabled", async () => {
    const user = userEvent.setup();
    render(<BackupSettingsButton />);

    await user.click(screen.getByRole("button", { name: "備份設定" }));

    expect(screen.getByRole("dialog", { name: "備份設定" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "⬇ 匯出備份" })).toBeEnabled();
    expect(screen.getByRole("button", { name: "⬆ 匯入備份" })).toBeEnabled();
  });
});

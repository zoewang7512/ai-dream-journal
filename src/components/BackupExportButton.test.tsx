import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { BackupExportButton } from "./BackupExportButton";
import * as backup from "../lib/backup";

describe("BackupExportButton", () => {
  it("calls downloadBackup when clicked", async () => {
    const downloadSpy = vi.spyOn(backup, "downloadBackup").mockImplementation(() => {});
    const user = userEvent.setup();

    render(<BackupExportButton />);
    await user.click(screen.getByRole("button", { name: "⬇ 匯出備份" }));

    expect(downloadSpy).toHaveBeenCalledOnce();
    downloadSpy.mockRestore();
  });

  it("shows an error toast when downloadBackup throws, without crashing", async () => {
    const downloadSpy = vi.spyOn(backup, "downloadBackup").mockImplementation(() => {
      throw new Error("blocked");
    });
    const user = userEvent.setup();

    render(<BackupExportButton />);
    await user.click(screen.getByRole("button", { name: "⬇ 匯出備份" }));

    expect(await screen.findByText("匯出失敗，請稍後再試。")).toBeInTheDocument();
    downloadSpy.mockRestore();
  });
});

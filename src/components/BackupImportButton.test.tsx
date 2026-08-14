import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { BackupImportButton } from "./BackupImportButton";
import { BACKUP_VERSION } from "../lib/backup";
import { getByDate, create } from "../lib/dream-storage";

function selectFile(json: string, filename = "backup.json") {
  const file = new File([json], filename, { type: "application/json" });
  const input = screen.getByLabelText("選擇備份檔");
  fireEvent.change(input, { target: { files: [file] } });
}

const VALID_BACKUP_JSON = JSON.stringify({
  version: BACKUP_VERSION,
  exportedAt: "2026-08-14T00:00:00.000Z",
  dreams: [
    {
      id: "a",
      date: "2026-08-20",
      content: "匯入進來的日記",
      status: "completed",
      createdAt: "2026-08-20T00:00:00.000Z",
    },
  ],
});

function stubReload() {
  const reload = vi.fn();
  Object.defineProperty(window, "location", {
    configurable: true,
    value: { ...window.location, reload },
  });
  return reload;
}

beforeEach(() => {
  window.localStorage.clear();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("BackupImportButton", () => {
  it("shows only the trigger button initially, with no confirmation dialog", () => {
    render(<BackupImportButton />);

    expect(screen.getByRole("button", { name: "⬆ 匯入備份" })).toBeInTheDocument();
    expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
  });

  it("shows a confirmation dialog naming the selected file after choosing one", () => {
    render(<BackupImportButton />);

    selectFile(VALID_BACKUP_JSON, "my-backup.json");

    expect(screen.getByText(/my-backup\.json/)).toBeInTheDocument();
    expect(screen.getByText(/將覆蓋目前所有本機資料/)).toBeInTheDocument();
  });

  it("does not write anything when the user cancels the confirmation", async () => {
    const user = userEvent.setup();
    create({ date: "2026-08-10", content: "既有資料", status: "completed" });
    render(<BackupImportButton />);

    selectFile(VALID_BACKUP_JSON);
    await user.click(screen.getByRole("button", { name: "取消" }));

    expect(getByDate("2026-08-10")?.content).toBe("既有資料");
    expect(getByDate("2026-08-20")).toBeUndefined();
  });

  it("overwrites LocalStorage and reloads the page when the import is confirmed with a valid file", async () => {
    const reloadSpy = stubReload();
    const user = userEvent.setup();
    create({ date: "2026-08-10", content: "會被覆蓋掉的資料", status: "completed" });
    render(<BackupImportButton />);

    selectFile(VALID_BACKUP_JSON);
    await user.click(screen.getByRole("button", { name: "確定覆蓋匯入" }));

    expect(getByDate("2026-08-10")).toBeUndefined();
    expect(getByDate("2026-08-20")?.content).toBe("匯入進來的日記");
    expect(reloadSpy).toHaveBeenCalledOnce();
  });

  it("shows a clear error message and does not touch existing data when the file is not valid JSON", async () => {
    const reloadSpy = stubReload();
    const user = userEvent.setup();
    create({ date: "2026-08-10", content: "既有資料", status: "completed" });
    render(<BackupImportButton />);

    selectFile("this is not json {{{");
    await user.click(screen.getByRole("button", { name: "確定覆蓋匯入" }));

    expect(await screen.findByText(/檔案不是合法的 JSON 格式/)).toBeInTheDocument();
    expect(getByDate("2026-08-10")?.content).toBe("既有資料");
    expect(reloadSpy).not.toHaveBeenCalled();
  });

  it("shows a clear error message for an unsupported backup version and does not touch existing data", async () => {
    const user = userEvent.setup();
    create({ date: "2026-08-10", content: "既有資料", status: "completed" });
    render(<BackupImportButton />);

    selectFile(JSON.stringify({ version: 999, exportedAt: "x", dreams: [] }));
    await user.click(screen.getByRole("button", { name: "確定覆蓋匯入" }));

    expect(await screen.findByText(/不支援的備份版本/)).toBeInTheDocument();
    expect(getByDate("2026-08-10")?.content).toBe("既有資料");
  });
});

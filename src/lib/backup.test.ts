import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  BACKUP_VERSION,
  BackupImportError,
  createBackupPayload,
  downloadBackup,
  getBackupFilename,
  parseBackupFile,
} from "./backup";
import { create, listAll, replaceAll } from "./dream-storage";

beforeEach(() => {
  window.localStorage.clear();
});

describe("createBackupPayload", () => {
  it("includes the version, an ISO exportedAt timestamp, and all records regardless of status", () => {
    create({ date: "2026-08-10", content: "完成的日記", status: "completed" });
    create({ date: "2026-08-11", content: "草稿中的日記", status: "draft" });

    const payload = createBackupPayload();

    expect(payload.version).toBe(BACKUP_VERSION);
    expect(() => new Date(payload.exportedAt).toISOString()).not.toThrow();
    expect(payload.dreams).toHaveLength(2);
    expect(payload.dreams.map((d) => d.status).sort()).toEqual(["completed", "draft"]);
  });

  it("produces an empty dreams array when there are no records", () => {
    expect(createBackupPayload().dreams).toEqual([]);
  });
});

describe("getBackupFilename", () => {
  it("formats the filename with the given date", () => {
    expect(getBackupFilename("2026-08-14")).toBe("dreamweaver-backup-2026-08-14.json");
  });

  it("defaults to today's date when no date is given", () => {
    expect(getBackupFilename()).toMatch(/^dreamweaver-backup-\d{4}-\d{2}-\d{2}\.json$/);
  });
});

describe("downloadBackup", () => {
  it("creates a Blob URL, triggers an <a download> click with the backup filename, and revokes the URL", () => {
    create({ date: "2026-08-10", content: "夢到在飛", status: "completed" });

    const createObjectURL = vi.fn<(blob: Blob) => string>(() => "blob:mock-url");
    const revokeObjectURL = vi.fn();
    vi.stubGlobal("URL", { ...URL, createObjectURL, revokeObjectURL });
    const clickSpy = vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {});

    downloadBackup();

    expect(createObjectURL).toHaveBeenCalledOnce();
    const [blob] = createObjectURL.mock.calls[0];
    expect(blob.type).toBe("application/json");
    expect(clickSpy).toHaveBeenCalledOnce();
    expect(revokeObjectURL).toHaveBeenCalledWith("blob:mock-url");

    clickSpy.mockRestore();
    vi.unstubAllGlobals();
  });

  it("still revokes the object URL even if the click throws", () => {
    const createObjectURL = vi.fn(() => "blob:mock-url");
    const revokeObjectURL = vi.fn();
    vi.stubGlobal("URL", { ...URL, createObjectURL, revokeObjectURL });
    const clickSpy = vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {
      throw new Error("blocked by browser");
    });

    expect(() => downloadBackup()).toThrow();
    expect(revokeObjectURL).toHaveBeenCalledWith("blob:mock-url");

    clickSpy.mockRestore();
    vi.unstubAllGlobals();
  });
});

describe("parseBackupFile", () => {
  it("round-trips a real export: parsing a just-created backup payload succeeds and preserves the data", () => {
    create({ date: "2026-08-10", content: "夢到在飛", status: "completed" });
    create({ date: "2026-08-11", content: "草稿", status: "draft" });
    const originalJson = JSON.stringify(createBackupPayload());

    const parsed = parseBackupFile(originalJson);

    expect(parsed.version).toBe(BACKUP_VERSION);
    expect(parsed.dreams).toHaveLength(2);
    expect(parsed.dreams.map((d) => d.date).sort()).toEqual(["2026-08-10", "2026-08-11"]);
  });

  it("accepts a minimal valid record without the optional analysis/imageUrl/completedAt fields", () => {
    const json = JSON.stringify({
      version: BACKUP_VERSION,
      exportedAt: "2026-08-14T00:00:00.000Z",
      dreams: [
        { id: "a", date: "2026-08-10", content: "x", status: "draft", createdAt: "2026-08-10T00:00:00.000Z" },
      ],
    });

    const parsed = parseBackupFile(json);
    expect(parsed.dreams[0].analysis).toBeUndefined();
  });

  it("throws invalid_json for text that isn't valid JSON", () => {
    expect(() => parseBackupFile("not json{{{")).toThrow(
      expect.objectContaining({ reason: "invalid_json" })
    );
  });

  it("throws missing_version when the version field is absent", () => {
    const json = JSON.stringify({ exportedAt: "x", dreams: [] });
    expect(() => parseBackupFile(json)).toThrow(expect.objectContaining({ reason: "missing_version" }));
  });

  it("throws unsupported_version when the version doesn't match", () => {
    const json = JSON.stringify({ version: 999, exportedAt: "x", dreams: [] });
    expect(() => parseBackupFile(json)).toThrow(
      expect.objectContaining({ reason: "unsupported_version" })
    );
  });

  it("throws invalid_shape when dreams is not an array", () => {
    const json = JSON.stringify({ version: BACKUP_VERSION, exportedAt: "x", dreams: "not-an-array" });
    expect(() => parseBackupFile(json)).toThrow(expect.objectContaining({ reason: "invalid_shape" }));
  });

  it("throws invalid_shape when a record is missing a required field", () => {
    const json = JSON.stringify({
      version: BACKUP_VERSION,
      exportedAt: "x",
      dreams: [{ id: "a", date: "2026-08-10", content: "x" /* missing status, createdAt */ }],
    });
    expect(() => parseBackupFile(json)).toThrow(expect.objectContaining({ reason: "invalid_shape" }));
  });

  it("throws invalid_shape when a record's date doesn't match YYYY-MM-DD", () => {
    const json = JSON.stringify({
      version: BACKUP_VERSION,
      exportedAt: "x",
      dreams: [
        { id: "a", date: "08/10/2026", content: "x", status: "draft", createdAt: "2026-08-10T00:00:00.000Z" },
      ],
    });
    expect(() => parseBackupFile(json)).toThrow(expect.objectContaining({ reason: "invalid_shape" }));
  });

  it("throws invalid_shape when a record's status is not draft or completed", () => {
    const json = JSON.stringify({
      version: BACKUP_VERSION,
      exportedAt: "x",
      dreams: [
        {
          id: "a",
          date: "2026-08-10",
          content: "x",
          status: "archived",
          createdAt: "2026-08-10T00:00:00.000Z",
        },
      ],
    });
    expect(() => parseBackupFile(json)).toThrow(expect.objectContaining({ reason: "invalid_shape" }));
  });

  it("throws invalid_shape when analysis is present but malformed", () => {
    const json = JSON.stringify({
      version: BACKUP_VERSION,
      exportedAt: "x",
      dreams: [
        {
          id: "a",
          date: "2026-08-10",
          content: "x",
          status: "completed",
          createdAt: "2026-08-10T00:00:00.000Z",
          analysis: { mood: "平靜", keywords: "not-an-array", imagePrompt: "x", seed: 1 },
        },
      ],
    });
    expect(() => parseBackupFile(json)).toThrow(expect.objectContaining({ reason: "invalid_shape" }));
  });

  it("does not modify any existing LocalStorage data when parsing fails (validate-before-write)", () => {
    create({ date: "2026-08-10", content: "現有資料", status: "completed" });

    expect(() => parseBackupFile("not json{{{")).toThrow(BackupImportError);

    expect(createBackupPayload().dreams).toHaveLength(1);
    expect(createBackupPayload().dreams[0].content).toBe("現有資料");
  });
});

describe("export -> clear -> import round trip", () => {
  it("restores exactly the original data after exporting, clearing storage, and importing the same file", () => {
    create({
      date: "2026-08-10",
      content: "夢到在湖邊散步",
      status: "completed",
      analysis: { mood: "平靜", keywords: ["湖泊", "月光"], imagePrompt: "a calm lake", seed: 42 },
      imageUrl: "/api/dream-image?prompt=a+calm+lake&seed=42",
    });
    create({ date: "2026-08-11", content: "還在寫的草稿", status: "draft" });

    const exportedJson = JSON.stringify(createBackupPayload());
    const before = listAll();

    window.localStorage.clear();
    expect(listAll()).toEqual([]);

    const parsed = parseBackupFile(exportedJson);
    replaceAll(parsed.dreams);

    expect(listAll()).toEqual(before);
  });
});

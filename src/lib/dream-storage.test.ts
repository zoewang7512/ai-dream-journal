import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  create,
  deleteByDate,
  DreamStorageError,
  getByDate,
  listCompleted,
  update,
} from "./dream-storage";

beforeEach(() => {
  window.localStorage.clear();
});

describe("create", () => {
  it("creates a draft record with a generated id and createdAt", () => {
    const record = create({ date: "2026-08-13", content: "夢到在飛" });

    expect(record.id).toBeTruthy();
    expect(record.status).toBe("draft");
    expect(record.createdAt).toBeTruthy();
    expect(getByDate("2026-08-13")).toEqual(record);
  });

  it("allows empty content (an in-progress draft)", () => {
    const record = create({ date: "2026-08-13", content: "" });
    expect(record.content).toBe("");
  });

  it("stores and retrieves very long content without truncation", () => {
    const longContent = "夢".repeat(50_000);
    create({ date: "2026-08-13", content: longContent });

    expect(getByDate("2026-08-13")?.content).toHaveLength(50_000);
  });

  it("rejects an invalid date format", () => {
    expect(() => create({ date: "2026/08/13", content: "x" })).toThrow(DreamStorageError);
  });

  it("throws DUPLICATE_DATE instead of overwriting an existing record", () => {
    create({ date: "2026-08-13", content: "第一篇" });

    expect(() => create({ date: "2026-08-13", content: "第二篇" })).toThrow(DreamStorageError);
    expect(getByDate("2026-08-13")?.content).toBe("第一篇");
  });

  it("throws STORAGE_FULL when localStorage.setItem fails", () => {
    const setItemSpy = vi
      .spyOn(Storage.prototype, "setItem")
      .mockImplementation(() => {
        throw new DOMException("Quota exceeded", "QuotaExceededError");
      });

    expect(() => create({ date: "2026-08-13", content: "x" })).toThrow(
      expect.objectContaining({ code: "STORAGE_FULL" })
    );

    setItemSpy.mockRestore();
  });
});

describe("getByDate", () => {
  it("returns undefined when no record exists for the date", () => {
    expect(getByDate("2026-01-01")).toBeUndefined();
  });
});

describe("update", () => {
  it("merges the patch into the existing record", () => {
    create({ date: "2026-08-13", content: "草稿內容" });

    const updated = update("2026-08-13", { content: "完整內容", status: "completed" });

    expect(updated.content).toBe("完整內容");
    expect(updated.status).toBe("completed");
  });

  it("throws NOT_FOUND when the date has no record", () => {
    expect(() => update("2026-01-01", { content: "x" })).toThrow(
      expect.objectContaining({ code: "NOT_FOUND" })
    );
  });
});

describe("deleteByDate", () => {
  it("removes an existing record and returns true", () => {
    create({ date: "2026-08-13", content: "x" });

    expect(deleteByDate("2026-08-13")).toBe(true);
    expect(getByDate("2026-08-13")).toBeUndefined();
  });

  it("returns false when there is nothing to delete", () => {
    expect(deleteByDate("2026-01-01")).toBe(false);
  });
});

describe("listCompleted", () => {
  it("returns only completed records, newest date first", () => {
    create({ date: "2026-08-10", content: "a", status: "completed" });
    create({ date: "2026-08-13", content: "b", status: "completed" });
    create({ date: "2026-08-12", content: "c", status: "draft" });

    expect(listCompleted().map((r) => r.date)).toEqual(["2026-08-13", "2026-08-10"]);
  });

  it("returns an empty array when there are no records", () => {
    expect(listCompleted()).toEqual([]);
  });
});

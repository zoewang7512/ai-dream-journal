import type { DreamAnalysis, DreamRecord, DreamStatus } from "../types/dream";

const STORAGE_KEY = "ai-dream-journal:dreams";
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export type DreamStorageErrorCode =
  | "INVALID_DATE"
  | "DUPLICATE_DATE"
  | "NOT_FOUND"
  | "STORAGE_FULL";

export class DreamStorageError extends Error {
  readonly code: DreamStorageErrorCode;

  constructor(code: DreamStorageErrorCode, message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = "DreamStorageError";
    this.code = code;
  }
}

function assertValidDate(date: string): void {
  if (!DATE_PATTERN.test(date)) {
    throw new DreamStorageError("INVALID_DATE", `日期格式錯誤，需為 YYYY-MM-DD：${date}`);
  }
}

function readAll(): Record<string, DreamRecord> {
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return {};
  try {
    return JSON.parse(raw) as Record<string, DreamRecord>;
  } catch {
    return {};
  }
}

function writeAll(records: Record<string, DreamRecord>): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  } catch (error) {
    throw new DreamStorageError(
      "STORAGE_FULL",
      "無法寫入 LocalStorage，可能已達容量上限。",
      { cause: error }
    );
  }
}

export interface CreateDreamInput {
  date: string;
  content: string;
  status?: DreamStatus;
  analysis?: DreamAnalysis;
  imageUrl?: string;
}

export function create(input: CreateDreamInput): DreamRecord {
  assertValidDate(input.date);
  const records = readAll();
  if (records[input.date]) {
    throw new DreamStorageError(
      "DUPLICATE_DATE",
      `${input.date} 已經有紀錄，無法覆蓋既有日記。`
    );
  }

  const record: DreamRecord = {
    id: crypto.randomUUID(),
    date: input.date,
    content: input.content,
    status: input.status ?? "draft",
    analysis: input.analysis,
    imageUrl: input.imageUrl,
    createdAt: new Date().toISOString(),
  };

  records[input.date] = record;
  writeAll(records);
  return record;
}

export function getByDate(date: string): DreamRecord | undefined {
  return readAll()[date];
}

export type UpdateDreamInput = Partial<
  Pick<DreamRecord, "content" | "status" | "analysis" | "imageUrl" | "completedAt">
>;

export function update(date: string, patch: UpdateDreamInput): DreamRecord {
  const records = readAll();
  const existing = records[date];
  if (!existing) {
    throw new DreamStorageError("NOT_FOUND", `找不到日期 ${date} 的紀錄。`);
  }

  const updated: DreamRecord = { ...existing, ...patch };
  records[date] = updated;
  writeAll(records);
  return updated;
}

export function deleteByDate(date: string): boolean {
  const records = readAll();
  if (!records[date]) return false;
  delete records[date];
  writeAll(records);
  return true;
}

export function listCompleted(): DreamRecord[] {
  return Object.values(readAll())
    .filter((record) => record.status === "completed")
    .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
}

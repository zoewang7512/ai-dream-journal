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

/** 回傳全部紀錄（含 draft），不限 status；備份/匯出需要完整資料，不只是 completed。 */
export function listAll(): DreamRecord[] {
  return Object.values(readAll()).sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
}

/**
 * 用給定的紀錄整批覆蓋 LocalStorage（依 date 建 key），取代原本全部內容。
 * 供匯入備份使用：呼叫端必須先驗證完 records 再呼叫，這裡不做欄位驗證，
 * 只負責寫入——寫入本身是單次 writeAll，天生就是「全有或全無」。
 */
export function replaceAll(records: DreamRecord[]): void {
  const map: Record<string, DreamRecord> = {};
  for (const record of records) {
    map[record.date] = record;
  }
  writeAll(map);
}

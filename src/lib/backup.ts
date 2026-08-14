import { getTodayDateString } from "../pages/journal/date";
import type { DreamAnalysis, DreamRecord, DreamStatus } from "../types/dream";
import { listAll } from "./dream-storage";

/**
 * 備份檔格式版本。TASK-028（匯入）要靠這個欄位判斷檔案是否相容，
 * 未來若備份結構有不相容的變動，遞增這個數字。
 */
export const BACKUP_VERSION = 1;

export interface BackupFile {
  version: number;
  exportedAt: string;
  dreams: DreamRecord[];
}

/** 產生備份內容：version + 匯出時間 + 全部紀錄（含 draft，不只 completed）。 */
export function createBackupPayload(): BackupFile {
  return {
    version: BACKUP_VERSION,
    exportedAt: new Date().toISOString(),
    dreams: listAll(),
  };
}

export function getBackupFilename(date: string = getTodayDateString()): string {
  return `dreamweaver-backup-${date}.json`;
}

/**
 * 觸發瀏覽器下載備份 JSON 檔。用 Blob + 暫時的 <a> 元素模擬點擊，
 * 這是無伺服器端點的純前端下載標準做法。
 */
export function downloadBackup(): void {
  const json = JSON.stringify(createBackupPayload(), null, 2);
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  try {
    const link = document.createElement("a");
    link.href = url;
    link.download = getBackupFilename();
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } finally {
    URL.revokeObjectURL(url);
  }
}

export type BackupImportErrorReason =
  | "invalid_json"
  | "missing_version"
  | "unsupported_version"
  | "invalid_shape";

export class BackupImportError extends Error {
  readonly reason: BackupImportErrorReason;

  constructor(reason: BackupImportErrorReason, message: string) {
    super(message);
    this.name = "BackupImportError";
    this.reason = reason;
  }
}

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const VALID_STATUSES: ReadonlySet<string> = new Set<DreamStatus>(["draft", "completed"]);

function invalidShape(): never {
  throw new BackupImportError("invalid_shape", "備份檔內容格式不符，找不到有效的日記資料。");
}

function validateAnalysis(value: unknown): DreamAnalysis | undefined {
  if (value === undefined) return undefined;
  if (typeof value !== "object" || value === null) invalidShape();

  const analysis = value as Record<string, unknown>;
  if (
    typeof analysis.mood !== "string" ||
    !Array.isArray(analysis.keywords) ||
    !analysis.keywords.every((keyword) => typeof keyword === "string") ||
    typeof analysis.imagePrompt !== "string" ||
    typeof analysis.seed !== "number"
  ) {
    invalidShape();
  }

  return {
    mood: analysis.mood as string,
    keywords: analysis.keywords as string[],
    imagePrompt: analysis.imagePrompt as string,
    seed: analysis.seed as number,
  };
}

function validateDreamRecord(value: unknown): DreamRecord {
  if (typeof value !== "object" || value === null) invalidShape();
  const record = value as Record<string, unknown>;

  if (
    typeof record.id !== "string" ||
    typeof record.date !== "string" ||
    !DATE_PATTERN.test(record.date) ||
    typeof record.content !== "string" ||
    typeof record.status !== "string" ||
    !VALID_STATUSES.has(record.status) ||
    typeof record.createdAt !== "string"
  ) {
    invalidShape();
  }

  return {
    id: record.id as string,
    date: record.date as string,
    content: record.content as string,
    status: record.status as DreamStatus,
    analysis: validateAnalysis(record.analysis),
    imageUrl: typeof record.imageUrl === "string" ? record.imageUrl : undefined,
    createdAt: record.createdAt as string,
    completedAt: typeof record.completedAt === "string" ? record.completedAt : undefined,
  };
}

/**
 * 解析並驗證備份檔文字內容。任何一個環節不符都直接 throw BackupImportError，
 * 不會回傳部分結果——呼叫端只要 catch 到例外就代表「什麼都沒驗證過」，
 * 確保後續的 replaceAll 寫入是全有或全無（要嘛整批合法資料，要嘛完全不寫）。
 */
export function parseBackupFile(text: string): BackupFile {
  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch {
    throw new BackupImportError("invalid_json", "檔案不是合法的 JSON 格式。");
  }

  if (typeof raw !== "object" || raw === null) invalidShape();
  const parsed = raw as Record<string, unknown>;

  if (typeof parsed.version !== "number") {
    throw new BackupImportError("missing_version", "備份檔缺少版本欄位（version）。");
  }
  if (parsed.version !== BACKUP_VERSION) {
    throw new BackupImportError(
      "unsupported_version",
      `不支援的備份版本（${parsed.version}），目前只支援版本 ${BACKUP_VERSION}。`
    );
  }
  if (!Array.isArray(parsed.dreams)) invalidShape();

  return {
    version: parsed.version,
    exportedAt: typeof parsed.exportedAt === "string" ? parsed.exportedAt : "",
    dreams: parsed.dreams.map(validateDreamRecord),
  };
}

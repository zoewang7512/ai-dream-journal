import type { DreamRecord } from "../../types/dream";

export const DAYS_OF_WEEK = ["日", "一", "二", "三", "四", "五", "六"] as const;

export interface CalendarCell {
  /** null = 該月第一天之前的留白格，用來讓月曆對齊星期幾。 */
  day: number | null;
  hasRecord: boolean;
}

export interface CalendarHeatmapData {
  year: number;
  /** 1-12（非 JS Date 的 0-11），與畫面顯示的月份數字一致，避免每次使用都要 +1/-1。 */
  month: number;
  cells: CalendarCell[];
}

interface ParsedDate {
  year: number;
  month: number;
  day: number;
}

function parseDate(date: string): ParsedDate | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date);
  if (!match) return null;
  return { year: Number(match[1]), month: Number(match[2]), day: Number(match[3]) };
}

/**
 * 把 completed 紀錄聚合成指定年月的月曆格子資料。用 `new Date(year, month-1, day)`
 * 這種帶年月日分量的建構子（而非解析 ISO 字串），避免時區造成的日期偏移——
 * 這是使用者本機牆上時間的月曆，不是 UTC 月曆。
 */
export function buildCalendarHeatmap(
  records: DreamRecord[],
  year: number,
  month: number
): CalendarHeatmapData {
  const recordedDays = new Set<number>();
  for (const record of records) {
    const parsed = parseDate(record.date);
    if (parsed && parsed.year === year && parsed.month === month) {
      recordedDays.add(parsed.day);
    }
  }

  const startOffset = new Date(year, month - 1, 1).getDay();
  const daysInMonth = new Date(year, month, 0).getDate();

  const cells: CalendarCell[] = [];
  for (let i = 0; i < startOffset; i++) {
    cells.push({ day: null, hasRecord: false });
  }
  for (let day = 1; day <= daysInMonth; day++) {
    cells.push({ day, hasRecord: recordedDays.has(day) });
  }

  return { year, month, cells };
}

/** 依 delta（-1 上一月／+1 下一月）算出新的年月，正確處理跨年份的月份進位/借位。 */
export function shiftMonth(year: number, month: number, delta: number): { year: number; month: number } {
  const date = new Date(year, month - 1 + delta, 1);
  return { year: date.getFullYear(), month: date.getMonth() + 1 };
}

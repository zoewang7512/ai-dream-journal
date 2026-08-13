const MONTH_DAY_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

export function getTodayDateString(referenceDate: Date = new Date()): string {
  const year = referenceDate.getFullYear();
  const month = String(referenceDate.getMonth() + 1).padStart(2, "0");
  const day = String(referenceDate.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function formatDisplayDate(date: string, isToday: boolean): string {
  const match = MONTH_DAY_PATTERN.exec(date);
  if (!match) return date;
  const [, year, month, day] = match;
  const base = `${year}年${Number(month)}月${Number(day)}日`;
  return isToday ? `${base} · 今天` : base;
}

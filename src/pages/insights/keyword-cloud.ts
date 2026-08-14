import type { DreamRecord } from "../../types/dream";

const MAX_KEYWORDS = 20;
const MIN_FONT_SIZE = 14;
const MAX_FONT_SIZE = 34;

export interface KeywordCloudItem {
  keyword: string;
  count: number;
  /** px，依出現次數在 MIN_FONT_SIZE～MAX_FONT_SIZE 之間線性縮放。 */
  fontSize: number;
}

/**
 * 統計所有 completed 紀錄裡 analysis.keywords 的出現頻率，依次數由多到少排序，
 * 只取前 20 個（少於 20 個時原樣全部顯示）。字級大小依相對頻率線性縮放；
 * 次數全部相同（含只有 1 個關鍵字）時，一律用最大字級顯示，避免除以 0。
 */
export function buildKeywordCloud(records: DreamRecord[]): KeywordCloudItem[] {
  const counts = new Map<string, number>();
  for (const record of records) {
    for (const keyword of record.analysis?.keywords ?? []) {
      const trimmed = keyword.trim();
      if (!trimmed) continue;
      counts.set(trimmed, (counts.get(trimmed) ?? 0) + 1);
    }
  }

  const sorted = Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, MAX_KEYWORDS);

  if (sorted.length === 0) return [];

  const maxCount = sorted[0][1];
  const minCount = sorted[sorted.length - 1][1];
  const range = maxCount - minCount;

  return sorted.map(([keyword, count]) => ({
    keyword,
    count,
    fontSize:
      range === 0
        ? MAX_FONT_SIZE
        : Math.round(MIN_FONT_SIZE + ((count - minCount) / range) * (MAX_FONT_SIZE - MIN_FONT_SIZE)),
  }));
}

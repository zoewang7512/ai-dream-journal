import type { DreamRecord } from "../../types/dream";
import { MOOD_ORDER, type MoodOption } from "./emotion-trend";

/**
 * 每種情緒對應的圓餅圖／圖例顏色，全部取自 design-system.md 既有色階（不新增 token）。
 * 8 種情緒只有 5 個語意色系（primary/success/warning/info/danger）可用，用同一色系的
 * 不同深淺（500/700）讓 8 種情緒仍能兩兩區分；對應邏輯盡量貼近直覺（開心→success 綠、
 * 困惑→warning 黃、焦慮/恐懼→danger 紅系、平靜/悲傷→info 藍灰系、興奮/懷舊→primary 橘系）。
 */
const MOOD_COLOR_TOKEN: Record<MoodOption, string> = {
  焦慮: "var(--color-danger-500)",
  平靜: "var(--color-info-500)",
  興奮: "var(--color-primary-500)",
  悲傷: "var(--color-info-700)",
  恐懼: "var(--color-danger-700)",
  開心: "var(--color-success-500)",
  困惑: "var(--color-warning-500)",
  懷舊: "var(--color-primary-700)",
};

export interface MoodSlice {
  mood: MoodOption;
  count: number;
  /** 0～1 的精確占比，供 conic-gradient 座標計算使用（避免四捨五入誤差影響圖形）。 */
  fraction: number;
  /** 四捨五入到整數的百分比，用最大餘數法分配捨去的誤差，保證全部加總剛好是 100。 */
  percentage: number;
  colorToken: string;
  /** conic-gradient 的起訖百分比字串（例如 "0%" "40%"），精確值、未四捨五入。 */
  gradientStart: string;
  gradientEnd: string;
}

function isKnownMood(mood: string | undefined): mood is MoodOption {
  return mood !== undefined && (MOOD_ORDER as readonly string[]).includes(mood);
}

/**
 * 依出現次數由多到少排序（次數相同時依 MOOD_ORDER 穩定排序），只列出實際出現過的情緒。
 * 百分比用最大餘數法（largest remainder method）四捨五入，確保 slices 的 percentage
 * 加總「一定」是 100，不會因為每個獨立四捨五入而出現 99 或 101 的誤差。
 */
export function buildEmotionDistribution(records: DreamRecord[]): MoodSlice[] {
  const counts = new Map<MoodOption, number>();
  for (const record of records) {
    const mood = record.analysis?.mood;
    if (isKnownMood(mood)) {
      counts.set(mood, (counts.get(mood) ?? 0) + 1);
    }
  }

  const total = Array.from(counts.values()).reduce((sum, count) => sum + count, 0);
  if (total === 0) return [];

  const ordered = MOOD_ORDER.filter((mood) => (counts.get(mood) ?? 0) > 0).sort(
    (a, b) => (counts.get(b) ?? 0) - (counts.get(a) ?? 0)
  );

  const rawPercentages = ordered.map((mood) => {
    const count = counts.get(mood) ?? 0;
    return { mood, count, raw: (count / total) * 100 };
  });

  const basePercentages = rawPercentages.map((entry) => Math.floor(entry.raw));
  let remainder = 100 - basePercentages.reduce((sum, value) => sum + value, 0);

  const byRemainderDesc = rawPercentages
    .map((entry, index) => ({ index, fraction: entry.raw - Math.floor(entry.raw) }))
    .sort((a, b) => b.fraction - a.fraction);

  const percentages = [...basePercentages];
  for (const { index } of byRemainderDesc) {
    if (remainder <= 0) break;
    percentages[index] += 1;
    remainder -= 1;
  }

  let cumulative = 0;
  return rawPercentages.map((entry, index) => {
    const fraction = entry.count / total;
    const gradientStart = `${(cumulative * 100).toFixed(4)}%`;
    cumulative += fraction;
    const gradientEnd = `${(cumulative * 100).toFixed(4)}%`;

    return {
      mood: entry.mood,
      count: entry.count,
      fraction,
      percentage: percentages[index],
      colorToken: MOOD_COLOR_TOKEN[entry.mood],
      gradientStart,
      gradientEnd,
    };
  });
}

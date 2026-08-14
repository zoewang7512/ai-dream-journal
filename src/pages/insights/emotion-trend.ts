import type { DreamRecord } from "../../types/dream";

/**
 * Y 軸的固定情緒分類順序，必須與後端 server/lib/analyze-dream.ts 的
 * MOOD_OPTIONS 保持一致（分析結果只會是這 8 種之一）。
 */
export const MOOD_ORDER = ["焦慮", "平靜", "興奮", "悲傷", "恐懼", "開心", "困惑", "懷舊"] as const;

export type MoodOption = (typeof MOOD_ORDER)[number];

function isKnownMood(mood: string | undefined): mood is MoodOption {
  return mood !== undefined && (MOOD_ORDER as readonly string[]).includes(mood);
}

export interface EmotionTrendPoint {
  date: string;
  mood: MoodOption;
  x: number;
  y: number;
}

export interface EmotionTrendLayout {
  points: EmotionTrendPoint[];
  polylinePoints: string;
  viewWidth: number;
  viewHeight: number;
  plotLeft: number;
  plotRight: number;
  moodRows: { mood: MoodOption; y: number }[];
}

const VIEW_WIDTH = 600;
const LEFT_LABEL_WIDTH = 56;
const RIGHT_PADDING = 16;
const TOP_PADDING = 12;
const BOTTOM_PADDING = 24;
const ROW_HEIGHT = 18;

const VIEW_HEIGHT = TOP_PADDING + (MOOD_ORDER.length - 1) * ROW_HEIGHT + BOTTOM_PADDING;
const PLOT_WIDTH = VIEW_WIDTH - LEFT_LABEL_WIDTH - RIGHT_PADDING;

/**
 * 只保留有合法 mood 的 completed 紀錄（防禦 LocalStorage 資料異常，例如舊資料
 * 缺 analysis），依日期由舊到新排序（listCompleted 回傳的是新到舊），再算出
 * 每個點在 SVG 座標系裡的位置。只有 1 個點時置中顯示，不做除以 0 的計算。
 */
export function buildEmotionTrendLayout(records: DreamRecord[]): EmotionTrendLayout {
  const entries = records
    .filter((record) => isKnownMood(record.analysis?.mood))
    .map((record) => ({ date: record.date, mood: record.analysis!.mood as MoodOption }))
    .sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));

  const points: EmotionTrendPoint[] = entries.map((entry, index) => {
    const x =
      entries.length === 1
        ? LEFT_LABEL_WIDTH + PLOT_WIDTH / 2
        : LEFT_LABEL_WIDTH + (index / (entries.length - 1)) * PLOT_WIDTH;
    const y = TOP_PADDING + MOOD_ORDER.indexOf(entry.mood) * ROW_HEIGHT;
    return { date: entry.date, mood: entry.mood, x, y };
  });

  const moodRows = MOOD_ORDER.map((mood, index) => ({
    mood,
    y: TOP_PADDING + index * ROW_HEIGHT,
  }));

  return {
    points,
    polylinePoints: points.map((point) => `${point.x},${point.y}`).join(" "),
    viewWidth: VIEW_WIDTH,
    viewHeight: VIEW_HEIGHT,
    plotLeft: LEFT_LABEL_WIDTH,
    plotRight: VIEW_WIDTH - RIGHT_PADDING,
    moodRows,
  };
}

/** 圖表 X 軸標籤用的精簡日期格式（"8/7"），與 journal 頁面完整日期格式分開維護。 */
export function formatAxisDate(date: string): string {
  const match = /^\d{4}-(\d{2})-(\d{2})$/.exec(date);
  if (!match) return date;
  const [, month, day] = match;
  return `${Number(month)}/${Number(day)}`;
}

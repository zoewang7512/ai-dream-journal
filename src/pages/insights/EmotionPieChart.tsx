import type { CSSProperties } from "react";
import type { DreamRecord } from "../../types/dream";
import { buildEmotionDistribution } from "./emotion-distribution";
import styles from "./EmotionPieChart.module.css";

export interface EmotionPieChartProps {
  records: DreamRecord[];
}

export function EmotionPieChart({ records }: EmotionPieChartProps) {
  const slices = buildEmotionDistribution(records);

  if (slices.length === 0) {
    // completed 篇數 > 0（否則 ChartCard 會顯示空狀態），但沒有任何一筆帶有可辨識的 mood。
    return <p className={styles.fallback}>暫無可顯示的情緒資料。</p>;
  }

  const gradient = slices
    .map((slice) => `${slice.colorToken} ${slice.gradientStart} ${slice.gradientEnd}`)
    .join(", ");
  const pieStyle: CSSProperties = { background: `conic-gradient(${gradient})` };
  const summary = slices.map((slice) => `${slice.mood} ${slice.percentage}%`).join("、");

  return (
    <div>
      <div className={styles.pie} style={pieStyle} role="img" aria-label={`情緒分佈圓餅圖：${summary}`} />
      <ul className={styles.legend}>
        {slices.map((slice) => (
          <li key={slice.mood} className={styles.legendItem}>
            <span className={styles.legendDot} style={{ background: slice.colorToken }} />
            {slice.mood} {slice.percentage}%
          </li>
        ))}
      </ul>
    </div>
  );
}

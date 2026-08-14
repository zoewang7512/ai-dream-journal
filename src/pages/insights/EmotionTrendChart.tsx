import type { DreamRecord } from "../../types/dream";
import { buildEmotionTrendLayout, formatAxisDate } from "./emotion-trend";
import styles from "./EmotionTrendChart.module.css";

export interface EmotionTrendChartProps {
  records: DreamRecord[];
}

export function EmotionTrendChart({ records }: EmotionTrendChartProps) {
  const layout = buildEmotionTrendLayout(records);

  if (layout.points.length === 0) {
    // completed 篇數 > 0（否則 ChartCard 會顯示空狀態），但沒有任何一筆帶有可辨識的 mood——
    // 對應 feature-spec 要求的「LocalStorage 資料格式異常時優雅降級」。
    return <p className={styles.fallback}>暫無可顯示的情緒資料。</p>;
  }

  const firstPoint = layout.points[0];
  const lastPoint = layout.points[layout.points.length - 1];
  const isSinglePoint = layout.points.length === 1;

  return (
    <svg
      className={styles.svg}
      viewBox={`0 0 ${layout.viewWidth} ${layout.viewHeight}`}
      preserveAspectRatio="none"
      role="img"
      aria-label={`情緒趨勢折線圖：${firstPoint.date} 到 ${lastPoint.date}，共 ${layout.points.length} 筆紀錄`}
    >
      {layout.moodRows.map((row) => (
        <text key={row.mood} x={4} y={row.y + 4} className={styles.moodLabel}>
          {row.mood}
        </text>
      ))}

      {!isSinglePoint && (
        <polyline points={layout.polylinePoints} className={styles.line} fill="none" />
      )}

      {layout.points.map((point) => (
        <circle key={point.date} cx={point.x} cy={point.y} r={4} className={styles.point}>
          <title>{`${point.date} · ${point.mood}`}</title>
        </circle>
      ))}

      {isSinglePoint ? (
        <text x={firstPoint.x} y={layout.viewHeight - 4} className={styles.axisLabel} textAnchor="middle">
          {formatAxisDate(firstPoint.date)}
        </text>
      ) : (
        <>
          <text x={layout.plotLeft} y={layout.viewHeight - 4} className={styles.axisLabel}>
            {formatAxisDate(firstPoint.date)}
          </text>
          <text
            x={layout.plotRight}
            y={layout.viewHeight - 4}
            className={styles.axisLabel}
            textAnchor="end"
          >
            {formatAxisDate(lastPoint.date)}
          </text>
        </>
      )}
    </svg>
  );
}

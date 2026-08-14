import { useState } from "react";
import { Button } from "../../components/ui/Button/Button";
import type { DreamRecord } from "../../types/dream";
import { buildCalendarHeatmap, DAYS_OF_WEEK, shiftMonth } from "./calendar-heatmap";
import styles from "./CalendarHeatmap.module.css";

export interface CalendarHeatmapProps {
  records: DreamRecord[];
  /** 預設用今天所在的年月起始顯示；測試時可注入固定日期避免依賴系統時鐘。 */
  initialDate?: Date;
}

function toYearMonth(date: Date): { year: number; month: number } {
  return { year: date.getFullYear(), month: date.getMonth() + 1 };
}

export function CalendarHeatmap({ records, initialDate = new Date() }: CalendarHeatmapProps) {
  const [{ year, month }, setYearMonth] = useState(() => toYearMonth(initialDate));
  const data = buildCalendarHeatmap(records, year, month);

  return (
    <div>
      <div className={styles.head}>
        <Button
          variant="ghost"
          onClick={() => setYearMonth(shiftMonth(year, month, -1))}
          aria-label="上一月"
        >
          ← 上一月
        </Button>
        <span className={styles.monthLabel}>
          {year}年{month}月
        </span>
        <Button
          variant="ghost"
          onClick={() => setYearMonth(shiftMonth(year, month, 1))}
          aria-label="下一月"
        >
          下一月 →
        </Button>
      </div>
      <div className={styles.grid}>
        {DAYS_OF_WEEK.map((label) => (
          <div key={label} className={styles.dow}>
            {label}
          </div>
        ))}
        {data.cells.map((cell, index) => (
          <div
            key={cell.day ?? `blank-${index}`}
            className={`${styles.cell} ${cell.hasRecord ? styles.cellRecorded : ""}`}
            title={cell.day ? `${month}月${cell.day}日${cell.hasRecord ? "：已完成紀錄" : ""}` : undefined}
          />
        ))}
      </div>
    </div>
  );
}

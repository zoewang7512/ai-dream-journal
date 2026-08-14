import styles from "./StatsSummaryCards.module.css";

export interface StatsSummaryCardsProps {
  totalCompleted: number;
  averageWordCount: number;
  daysRecorded: number;
}

export function StatsSummaryCards({
  totalCompleted,
  averageWordCount,
  daysRecorded,
}: StatsSummaryCardsProps) {
  return (
    <div className={styles.statRow}>
      <div className={styles.statTile}>
        <span className={styles.statNum}>{totalCompleted}</span>
        <span className={styles.statLabel}>總完成篇數</span>
      </div>
      <div className={styles.statTile}>
        <span className={styles.statNum}>{averageWordCount}</span>
        <span className={styles.statLabel}>平均字數</span>
      </div>
      <div className={styles.statTile}>
        <span className={styles.statNum}>{daysRecorded}</span>
        <span className={styles.statLabel}>記錄天數</span>
      </div>
    </div>
  );
}

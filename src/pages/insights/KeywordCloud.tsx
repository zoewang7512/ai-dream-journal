import type { DreamRecord } from "../../types/dream";
import { buildKeywordCloud } from "./keyword-cloud";
import styles from "./KeywordCloud.module.css";

export interface KeywordCloudProps {
  records: DreamRecord[];
}

export function KeywordCloud({ records }: KeywordCloudProps) {
  const items = buildKeywordCloud(records);

  if (items.length === 0) {
    // completed 篇數 > 0（否則 ChartCard 會顯示空狀態），但沒有任何一筆帶有可用關鍵字。
    return <p className={styles.fallback}>暫無可顯示的關鍵字資料。</p>;
  }

  return (
    <div className={styles.cloud}>
      {items.map((item) => (
        <span
          key={item.keyword}
          className={styles.keyword}
          style={{ fontSize: `${item.fontSize}px` }}
          title={`${item.keyword}：出現 ${item.count} 次`}
        >
          {item.keyword}
        </span>
      ))}
    </div>
  );
}

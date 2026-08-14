import type { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/Button/Button";
import { Card } from "../../components/ui/Card/Card";
import styles from "./ChartCard.module.css";

export interface ChartCardProps {
  title: string;
  isEmpty: boolean;
  children: ReactNode;
}

/** 四個圖表區塊共用同一份空狀態文案與 CTA，確保措辭一致（驗收標準明確要求）。 */
const EMPTY_STATE_MESSAGE = "還沒有足夠的夢境紀錄可以分析。完成第一篇日記後，這裡就會出現圖表。";

export function ChartCard({ title, isEmpty, children }: ChartCardProps) {
  const navigate = useNavigate();

  return (
    <Card className={styles.card}>
      <h2 className={styles.title}>{title}</h2>
      {isEmpty ? (
        <div className={styles.emptyState}>
          <p>{EMPTY_STATE_MESSAGE}</p>
          <Button variant="primary" onClick={() => navigate("/")}>
            前往寫日記
          </Button>
        </div>
      ) : (
        children
      )}
    </Card>
  );
}

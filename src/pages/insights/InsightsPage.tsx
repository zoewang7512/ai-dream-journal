import { CalendarHeatmap } from "./CalendarHeatmap";
import { ChartCard } from "./ChartCard";
import { EmotionPieChart } from "./EmotionPieChart";
import { EmotionTrendChart } from "./EmotionTrendChart";
import { KeywordCloud } from "./KeywordCloud";
import { StatsSummaryCards } from "./StatsSummaryCards";
import { useDreamStats } from "./useDreamStats";
import styles from "./InsightsPage.module.css";

function InsightsPage() {
  const stats = useDreamStats();

  return (
    <section className={styles.page}>
      <h1 className={styles.title}>夢境數據看板</h1>
      <div className={styles.layout}>
        <aside>
          <ChartCard title="摘要" isEmpty={stats.isEmpty}>
            <StatsSummaryCards
              totalCompleted={stats.totalCompleted}
              averageWordCount={stats.averageWordCount}
              daysRecorded={stats.daysRecorded}
            />
            <EmotionPieChart records={stats.records} />
          </ChartCard>
        </aside>

        <div>
          <ChartCard title="情緒趨勢" isEmpty={stats.isEmpty}>
            <EmotionTrendChart records={stats.records} />
          </ChartCard>
          <ChartCard title="紀錄月曆" isEmpty={stats.isEmpty}>
            <CalendarHeatmap records={stats.records} />
          </ChartCard>
          <ChartCard title="關鍵字文字雲" isEmpty={stats.isEmpty}>
            <KeywordCloud records={stats.records} />
          </ChartCard>
        </div>
      </div>
    </section>
  );
}

export default InsightsPage;

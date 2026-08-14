import { useState } from "react";
import { formatDisplayDate } from "./date";
import { EntryDetailReadonly } from "./EntryDetailReadonly";
import { HistoryNavigator } from "./HistoryNavigator";
import { TodayEntryEditor } from "./TodayEntryEditor";
import { useJournalViewState } from "./useJournalViewState";
import styles from "./JournalPage.module.css";

function JournalPage() {
  const view = useJournalViewState();
  const { mode, record, isToday, viewDate, hasHistory } = view;
  const isEditing = mode === "today-editing";
  const [isCompleting, setIsCompleting] = useState(false);

  const badgeClasses = [styles.badge, isEditing && styles.badgeDraft].filter(Boolean).join(" ");

  return (
    <section className={styles.page}>
      <h1 className={styles.title}>夢境日記</h1>
      <div className={styles.spread}>
        <div className={`${styles.panel} ${styles.panelLeft}`}>
          <div className={styles.panelContent}>
            <div className={styles.cardHead}>
              <span className={badgeClasses}>{isEditing ? "撰寫中" : "已完成"}</span>
              <time>{formatDisplayDate(viewDate, isToday)}</time>
            </div>
            {isEditing ? (
              <TodayEntryEditor
                date={viewDate}
                record={record}
                onCompleted={view.refresh}
                onCompletingChange={setIsCompleting}
              />
            ) : (
              <EntryDetailReadonly key={viewDate} part="text" record={record} />
            )}
          </div>
          <div className={styles.cornerNav}>
            <HistoryNavigator
              direction="previous"
              visible
              disabled={!view.canGoPrevious}
              onNavigate={view.goToPrevious}
            />
          </div>
        </div>

        <div className={`${styles.panel} ${styles.panelRight}`}>
          <div className={styles.panelContent}>
            {isEditing ? (
              <div className={styles.rightBlank}>
                <p>
                  {isCompleting
                    ? "AI 正在解析你的夢境……"
                    : "完成今天的紀錄後，這裡會顯示 AI 分析與插圖。"}
                </p>
                {!hasHistory && !isCompleting && (
                  <p className={styles.rightBlankHint}>
                    還沒有翻頁可看的舊日記，完成今天的第一篇吧。
                  </p>
                )}
              </div>
            ) : (
              <EntryDetailReadonly key={viewDate} part="analysis" record={record} />
            )}
          </div>
          <div className={styles.cornerNavRight}>
            <HistoryNavigator
              direction="next"
              visible={!isEditing}
              disabled={!view.canGoNext}
              onNavigate={view.goToNext}
            />
          </div>
        </div>
      </div>
    </section>
  );
}

export default JournalPage;

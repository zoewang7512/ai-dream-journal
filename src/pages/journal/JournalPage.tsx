import { Button } from "../../components/ui/Button/Button";
import { formatDisplayDate } from "./date";
import { useJournalViewState } from "./useJournalViewState";
import styles from "./JournalPage.module.css";

function JournalPage() {
  const view = useJournalViewState();
  const { mode, record, isToday, viewDate } = view;
  const isEditing = mode === "today-editing";

  const badgeClasses = [styles.badge, isEditing && styles.badgeDraft].filter(Boolean).join(" ");
  const keywords = [record?.analysis?.mood, ...(record?.analysis?.keywords ?? [])].filter(
    (value): value is string => Boolean(value)
  );

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
              record?.content ? (
                <p className={styles.readonlyText}>{record.content}</p>
              ) : (
                <p className={styles.placeholderText}>今天的夢還記得嗎？寫下來吧。</p>
              )
            ) : (
              <p className={styles.readonlyText}>{record?.content ?? ""}</p>
            )}
          </div>
          <div className={styles.cornerNav}>
            <Button variant="ghost" onClick={view.goToPrevious} disabled={!view.canGoPrevious}>
              ← 上一篇
            </Button>
          </div>
        </div>

        <div className={`${styles.panel} ${styles.panelRight}`}>
          <div className={styles.panelContent}>
            {isEditing ? (
              <div className={styles.rightBlank}>
                <p>完成今天的紀錄後，這裡會顯示 AI 分析與插圖。</p>
              </div>
            ) : (
              <div>
                <h3 className={styles.analysisTitle}>AI 分析</h3>
                <div className={styles.keywordRow}>
                  {keywords.map((keyword, index) => (
                    <span className={styles.keyword} key={`${keyword}-${index}`}>
                      {keyword}
                    </span>
                  ))}
                </div>
                {record?.imageUrl ? (
                  <img className={styles.image} src={record.imageUrl} alt="AI 生成的夢境插圖" />
                ) : (
                  <div className={styles.imagePlaceholder}>AI 生成圖片準備中</div>
                )}
              </div>
            )}
          </div>
          <div className={styles.cornerNavRight}>
            {!isEditing && (
              <Button variant="ghost" onClick={view.goToNext} disabled={!view.canGoNext}>
                下一篇 →
              </Button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export default JournalPage;

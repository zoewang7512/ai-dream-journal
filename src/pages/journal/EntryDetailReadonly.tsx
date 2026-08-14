import { useState } from "react";
import type { DreamRecord } from "../../types/dream";
import styles from "./EntryDetailReadonly.module.css";

export type EntryDetailReadonlyPart = "text" | "analysis";

export interface EntryDetailReadonlyProps {
  part: EntryDetailReadonlyPart;
  record: DreamRecord | undefined;
}

export function EntryDetailReadonly({ part, record }: EntryDetailReadonlyProps) {
  const [imageFailed, setImageFailed] = useState(false);

  if (part === "text") {
    return <p className={styles.readonlyText}>{record?.content ?? ""}</p>;
  }

  const keywords = [record?.analysis?.mood, ...(record?.analysis?.keywords ?? [])].filter(
    (value): value is string => Boolean(value)
  );
  const imageUrl = record?.imageUrl;

  return (
    <div>
      <h3 className={styles.analysisTitle}>AI 分析</h3>
      <div className={styles.keywordRow}>
        {keywords.map((keyword, index) => (
          <span className={styles.keyword} key={`${keyword}-${index}`}>
            {keyword}
          </span>
        ))}
      </div>
      {imageUrl && !imageFailed ? (
        <img
          className={styles.image}
          src={imageUrl}
          alt="AI 生成的夢境插圖"
          onError={() => setImageFailed(true)}
        />
      ) : (
        <div className={styles.imagePlaceholder}>
          {imageUrl ? "圖片載入失敗，請稍後再試" : "AI 生成圖片準備中"}
        </div>
      )}
    </div>
  );
}

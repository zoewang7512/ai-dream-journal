import { useState } from "react";
import { BackupExportButton } from "./BackupExportButton";
import { BackupImportButton } from "./BackupImportButton";
import { Modal } from "./ui/Modal/Modal";
import styles from "./BackupSettingsButton.module.css";

export function BackupSettingsButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        className={styles.iconButton}
        aria-label="備份設定"
        title="備份設定"
        onClick={() => setOpen(true)}
      >
        ⚙
      </button>
      <Modal open={open} onOpenChange={setOpen} title="備份設定">
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>匯出</h3>
          <p className={styles.sectionDesc}>下載全部夢境紀錄成一個 JSON 檔案。</p>
          <BackupExportButton />
        </div>
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>匯入</h3>
          <p className={styles.sectionDesc}>選擇備份檔，整批覆蓋目前資料。</p>
          <BackupImportButton />
        </div>
      </Modal>
    </>
  );
}

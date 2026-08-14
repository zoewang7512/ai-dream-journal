import { useRef, useState, type ChangeEvent } from "react";
import { Button } from "./ui/Button/Button";
import { Modal } from "./ui/Modal/Modal";
import { Toast } from "./ui/Toast/Toast";
import { BackupImportError, parseBackupFile } from "../lib/backup";
import { replaceAll } from "../lib/dream-storage";

const GENERIC_ERROR_MESSAGE = "匯入失敗，請確認檔案是否為有效的備份檔。";

export function BackupImportButton() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>();

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    // 清空 input value，允許使用者之後重新選同一個檔案也能觸發 onChange。
    event.target.value = "";
    if (file) {
      setErrorMessage(undefined);
      setPendingFile(file);
    }
  }

  function handleCancel() {
    setPendingFile(null);
  }

  async function handleConfirm() {
    if (!pendingFile) return;
    setIsImporting(true);

    try {
      const text = await pendingFile.text();
      const backup = parseBackupFile(text);
      replaceAll(backup.dreams);
      // 匯入的資料橫跨整個 App（日記頁、看板頁都讀 LocalStorage），用整頁重新整理
      // 確保所有畫面都反映新資料，避免另外設計一套跨頁面的資料同步機制。
      window.location.reload();
    } catch (error) {
      setIsImporting(false);
      setPendingFile(null);
      setErrorMessage(error instanceof BackupImportError ? error.message : GENERIC_ERROR_MESSAGE);
    }
  }

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept="application/json"
        onChange={handleFileChange}
        aria-label="選擇備份檔"
        style={{ display: "none" }}
      />
      <Button variant="ghost" onClick={() => inputRef.current?.click()} disabled={isImporting}>
        ⬆ 匯入備份
      </Button>

      <Modal
        open={pendingFile !== null}
        onOpenChange={(open) => {
          if (!open) handleCancel();
        }}
        title="確定要匯入嗎？"
        description={
          pendingFile
            ? `匯入「${pendingFile.name}」將覆蓋目前所有本機資料，此動作無法復原。`
            : undefined
        }
        actions={
          <>
            <Button variant="ghost" onClick={handleCancel} disabled={isImporting}>
              取消
            </Button>
            <Button variant="danger" onClick={handleConfirm} loading={isImporting}>
              確定覆蓋匯入
            </Button>
          </>
        }
      />

      <Toast
        open={Boolean(errorMessage)}
        onOpenChange={(open) => {
          if (!open) setErrorMessage(undefined);
        }}
        variant="danger"
        title="匯入失敗"
        description={errorMessage}
      />
    </>
  );
}

import { useState } from "react";
import { Button } from "./ui/Button/Button";
import { Toast } from "./ui/Toast/Toast";
import { downloadBackup } from "../lib/backup";

const EXPORT_FAILED_MESSAGE = "匯出失敗，請稍後再試。";

export function BackupExportButton() {
  const [errorMessage, setErrorMessage] = useState<string>();

  function handleExport() {
    try {
      downloadBackup();
    } catch {
      setErrorMessage(EXPORT_FAILED_MESSAGE);
    }
  }

  return (
    <>
      <Button variant="primary" onClick={handleExport}>
        ⬇ 匯出備份
      </Button>
      <Toast
        open={Boolean(errorMessage)}
        onOpenChange={(open) => {
          if (!open) setErrorMessage(undefined);
        }}
        variant="danger"
        title="匯出失敗"
        description={errorMessage}
      />
    </>
  );
}

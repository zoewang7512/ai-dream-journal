import { useEffect, useState, type ChangeEvent } from "react";
import { Button } from "../../components/ui/Button/Button";
import { Modal } from "../../components/ui/Modal/Modal";
import { Textarea } from "../../components/ui/Textarea/Textarea";
import { Toast } from "../../components/ui/Toast/Toast";
import { create, deleteByDate, update } from "../../lib/dream-storage";
import type { DreamRecord } from "../../types/dream";
import { CompleteEntryDialog } from "./CompleteEntryDialog";
import { useCompleteEntry } from "./useCompleteEntry";
import styles from "./TodayEntryEditor.module.css";

const MAX_LENGTH = 2000;

export interface TodayEntryEditorProps {
  date: string;
  record: DreamRecord | undefined;
  onCompleted: () => void;
  onCompletingChange?: (isCompleting: boolean) => void;
}

export function TodayEntryEditor({
  date,
  record,
  onCompleted,
  onCompletingChange,
}: TodayEntryEditorProps) {
  const [content, setContent] = useState(record?.content ?? "");
  const [hasStoredRecord, setHasStoredRecord] = useState(record !== undefined);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  function persist(nextContent: string) {
    if (hasStoredRecord) {
      update(date, { content: nextContent });
    } else {
      create({ date, content: nextContent });
      setHasStoredRecord(true);
    }
  }

  const completeEntry = useCompleteEntry(date, content, () => persist(content), onCompleted);

  useEffect(() => {
    onCompletingChange?.(completeEntry.isSubmitting);
  }, [completeEntry.isSubmitting, onCompletingChange]);

  function handleChange(event: ChangeEvent<HTMLTextAreaElement>) {
    setContent(event.target.value);
  }

  function handleSaveClick() {
    persist(content);
  }

  function handleConfirmDelete() {
    deleteByDate(date);
    setContent("");
    setHasStoredRecord(false);
    setIsDeleteDialogOpen(false);
  }

  const isBusy = completeEntry.isSubmitting;
  const canComplete = content.trim().length > 0 && !isBusy;

  return (
    <div className={styles.editor}>
      <Textarea
        aria-label="今日夢境日記內容"
        placeholder="今天的夢還記得嗎？寫下來吧。"
        value={content}
        onChange={handleChange}
        maxLength={MAX_LENGTH}
        showCount
        disabled={isBusy}
      />
      <div className={styles.actions}>
        {hasStoredRecord ? (
          <Button
            variant="danger"
            onClick={() => setIsDeleteDialogOpen(true)}
            disabled={isBusy}
          >
            刪除
          </Button>
        ) : (
          // keeps 存檔/完成 right-aligned via space-between even before there's anything to delete
          <span />
        )}
        <div className={styles.actionsGroup}>
          <Button variant="ghost" onClick={handleSaveClick} disabled={isBusy}>
            存檔
          </Button>
          <Button
            variant="primary"
            onClick={completeEntry.openDialog}
            disabled={!canComplete}
            loading={isBusy}
          >
            完成
          </Button>
        </div>
      </div>

      <Modal
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        title="刪除這篇日記？"
        description="刪除後無法復原，今天的暫存內容將被清空。"
        actions={
          <>
            <Button variant="ghost" onClick={() => setIsDeleteDialogOpen(false)}>
              取消
            </Button>
            <Button variant="danger" onClick={handleConfirmDelete}>
              刪除
            </Button>
          </>
        }
      />

      <CompleteEntryDialog
        open={completeEntry.isDialogOpen}
        onOpenChange={(open) => {
          if (!open) completeEntry.closeDialog();
        }}
        onConfirm={completeEntry.confirm}
      />

      <Toast
        open={Boolean(completeEntry.errorMessage)}
        onOpenChange={(open) => {
          if (!open) completeEntry.dismissError();
        }}
        variant="danger"
        title="生成失敗"
        description={completeEntry.errorMessage}
      />
    </div>
  );
}

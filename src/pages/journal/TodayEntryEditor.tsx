import { useState, type ChangeEvent } from "react";
import { Button } from "../../components/ui/Button/Button";
import { Modal } from "../../components/ui/Modal/Modal";
import { Textarea } from "../../components/ui/Textarea/Textarea";
import { create, deleteByDate, update } from "../../lib/dream-storage";
import type { DreamRecord } from "../../types/dream";
import styles from "./TodayEntryEditor.module.css";

const MAX_LENGTH = 2000;

export interface TodayEntryEditorProps {
  date: string;
  record: DreamRecord | undefined;
}

export function TodayEntryEditor({ date, record }: TodayEntryEditorProps) {
  const [content, setContent] = useState(record?.content ?? "");
  const [hasStoredRecord, setHasStoredRecord] = useState(record !== undefined);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  function handleChange(event: ChangeEvent<HTMLTextAreaElement>) {
    setContent(event.target.value);
  }

  function handleSaveClick() {
    if (hasStoredRecord) {
      update(date, { content });
    } else {
      create({ date, content });
      setHasStoredRecord(true);
    }
  }

  function handleConfirmDelete() {
    deleteByDate(date);
    setContent("");
    setHasStoredRecord(false);
    setIsDeleteDialogOpen(false);
  }

  return (
    <div className={styles.editor}>
      <Textarea
        aria-label="今日夢境日記內容"
        placeholder="今天的夢還記得嗎？寫下來吧。"
        value={content}
        onChange={handleChange}
        maxLength={MAX_LENGTH}
        showCount
      />
      <div className={styles.actions}>
        {hasStoredRecord ? (
          <Button variant="danger" onClick={() => setIsDeleteDialogOpen(true)}>
            刪除
          </Button>
        ) : (
          // keeps 存檔 right-aligned via space-between even before there's anything to delete
          <span />
        )}
        <div className={styles.actionsGroup}>
          <Button variant="ghost" onClick={handleSaveClick}>
            存檔
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
    </div>
  );
}

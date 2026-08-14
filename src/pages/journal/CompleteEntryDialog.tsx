import { Button } from "../../components/ui/Button/Button";
import { Modal } from "../../components/ui/Modal/Modal";

export interface CompleteEntryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

export function CompleteEntryDialog({ open, onOpenChange, onConfirm }: CompleteEntryDialogProps) {
  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title="完成這篇日記？"
      description="確認後將觸發一次 AI 分析與圖片生成，內容會傳送給第三方 AI 服務，且每篇日記只能觸發一次，完成後無法再次生成。"
      actions={
        <>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            取消
          </Button>
          <Button variant="primary" onClick={onConfirm}>
            確定完成
          </Button>
        </>
      }
    />
  );
}

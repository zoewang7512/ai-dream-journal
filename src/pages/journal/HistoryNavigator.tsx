import { Button } from "../../components/ui/Button/Button";

export type HistoryNavigatorDirection = "previous" | "next";

export interface HistoryNavigatorProps {
  direction: HistoryNavigatorDirection;
  visible: boolean;
  disabled: boolean;
  onNavigate: () => void;
}

const LABEL: Record<HistoryNavigatorDirection, string> = {
  previous: "← 上一篇",
  next: "下一篇 →",
};

export function HistoryNavigator({ direction, visible, disabled, onNavigate }: HistoryNavigatorProps) {
  if (!visible) return null;

  return (
    <Button variant="ghost" onClick={onNavigate} disabled={disabled}>
      {LABEL[direction]}
    </Button>
  );
}

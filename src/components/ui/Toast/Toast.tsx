import * as RadixToast from "@radix-ui/react-toast";
import styles from "./Toast.module.css";

export type ToastVariant = "success" | "danger" | "warning" | "info";

const VARIANT_LABEL: Record<ToastVariant, string> = {
  success: "成功",
  danger: "錯誤",
  warning: "警告",
  info: "提示",
};

export interface ToastProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  variant: ToastVariant;
  title: string;
  description?: string;
}

export function Toast({ open, onOpenChange, variant, title, description }: ToastProps) {
  return (
    <RadixToast.Provider swipeDirection="right">
      <RadixToast.Root
        className={[styles.root, styles[variant]].join(" ")}
        open={open}
        onOpenChange={onOpenChange}
      >
        <span className={styles.kind}>{VARIANT_LABEL[variant]}</span>
        <RadixToast.Title className={styles.title}>{title}</RadixToast.Title>
        {description && (
          <RadixToast.Description className={styles.description}>
            {description}
          </RadixToast.Description>
        )}
        <RadixToast.Close className={styles.close} aria-label="關閉">
          ✕
        </RadixToast.Close>
      </RadixToast.Root>
      <RadixToast.Viewport className={styles.viewport} />
    </RadixToast.Provider>
  );
}

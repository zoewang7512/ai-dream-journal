import { useId, type TextareaHTMLAttributes } from "react";
import styles from "./Textarea.module.css";

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string;
  maxLength?: number;
  showCount?: boolean;
}

export function Textarea({
  error,
  className,
  id,
  maxLength,
  showCount = false,
  value,
  ...rest
}: TextareaProps) {
  const generatedId = useId();
  const textareaId = id ?? generatedId;
  const errorId = error ? `${textareaId}-error` : undefined;
  const currentLength = typeof value === "string" ? value.length : 0;
  const exceeded = typeof maxLength === "number" && currentLength > maxLength;

  return (
    <div className={styles.field}>
      <textarea
        id={textareaId}
        className={[styles.textarea, className].filter(Boolean).join(" ")}
        data-error={error ? "true" : undefined}
        aria-invalid={error ? true : undefined}
        aria-describedby={errorId}
        maxLength={maxLength}
        value={value}
        {...rest}
      />
      <div className={styles.footer}>
        {error && (
          <span id={errorId} className={styles.errorText} role="alert">
            {error}
          </span>
        )}
        {showCount && typeof maxLength === "number" && (
          <span className={[styles.count, exceeded && styles.countExceeded].filter(Boolean).join(" ")}>
            {currentLength}/{maxLength}
          </span>
        )}
      </div>
    </div>
  );
}

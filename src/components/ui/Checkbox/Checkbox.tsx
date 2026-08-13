import { useId } from "react";
import * as RadixCheckbox from "@radix-ui/react-checkbox";
import styles from "./Checkbox.module.css";

export interface CheckboxProps {
  label: string;
  checked?: boolean;
  defaultChecked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
}

export function Checkbox({
  label,
  checked,
  defaultChecked,
  onCheckedChange,
  disabled,
}: CheckboxProps) {
  const id = useId();

  return (
    <label className={styles.wrapper} htmlFor={id} data-disabled={disabled || undefined}>
      <RadixCheckbox.Root
        id={id}
        className={styles.root}
        checked={checked}
        defaultChecked={defaultChecked}
        disabled={disabled}
        onCheckedChange={(state) => onCheckedChange?.(state === true)}
      >
        <RadixCheckbox.Indicator className={styles.indicator}>✓</RadixCheckbox.Indicator>
      </RadixCheckbox.Root>
      <span className={styles.label}>{label}</span>
    </label>
  );
}

import { useId } from "react";
import * as RadixRadioGroup from "@radix-ui/react-radio-group";
import styles from "./RadioGroup.module.css";

export interface RadioOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface RadioGroupProps {
  options: RadioOption[];
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  "aria-label": string;
}

export function RadioGroup({
  options,
  value,
  defaultValue,
  onValueChange,
  "aria-label": ariaLabel,
}: RadioGroupProps) {
  const idPrefix = useId();

  return (
    <RadixRadioGroup.Root
      className={styles.group}
      value={value}
      defaultValue={defaultValue}
      onValueChange={onValueChange}
      aria-label={ariaLabel}
    >
      {options.map((option) => {
        const itemId = `${idPrefix}-${option.value}`;
        return (
          <label
            key={option.value}
            htmlFor={itemId}
            className={styles["item-wrapper"]}
            data-disabled={option.disabled || undefined}
          >
            <RadixRadioGroup.Item
              id={itemId}
              value={option.value}
              disabled={option.disabled}
              className={styles.root}
            >
              <RadixRadioGroup.Indicator className={styles.indicator} />
            </RadixRadioGroup.Item>
            <span className={styles.label}>{option.label}</span>
          </label>
        );
      })}
    </RadixRadioGroup.Root>
  );
}

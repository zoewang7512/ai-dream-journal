import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import userEvent from "@testing-library/user-event";
import { RadioGroup } from "./RadioGroup";

const options = [
  { value: "draft", label: "草稿" },
  { value: "completed", label: "已完成" },
];

describe("RadioGroup", () => {
  it("selects an option and calls onValueChange", async () => {
    const onValueChange = vi.fn();
    render(
      <RadioGroup options={options} aria-label="狀態" onValueChange={onValueChange} />
    );

    await userEvent.click(screen.getByRole("radio", { name: "已完成" }));
    expect(onValueChange).toHaveBeenCalledWith("completed");
  });

  it("marks the defaultValue option as checked", () => {
    render(<RadioGroup options={options} aria-label="狀態" defaultValue="draft" />);
    expect(screen.getByRole("radio", { name: "草稿" })).toHaveAttribute(
      "data-state",
      "checked"
    );
    expect(screen.getByRole("radio", { name: "已完成" })).toHaveAttribute(
      "data-state",
      "unchecked"
    );
  });

  it("respects a disabled option", () => {
    render(
      <RadioGroup
        options={[...options, { value: "archived", label: "封存", disabled: true }]}
        aria-label="狀態"
      />
    );
    expect(screen.getByRole("radio", { name: "封存" })).toBeDisabled();
  });
});

import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import userEvent from "@testing-library/user-event";
import { Checkbox } from "./Checkbox";

describe("Checkbox", () => {
  it("toggles checked state and calls onCheckedChange", async () => {
    const onCheckedChange = vi.fn();
    render(<Checkbox label="標記為已完成" onCheckedChange={onCheckedChange} />);

    const checkbox = screen.getByRole("checkbox", { name: "標記為已完成" });
    expect(checkbox).toHaveAttribute("data-state", "unchecked");

    await userEvent.click(checkbox);
    expect(onCheckedChange).toHaveBeenCalledWith(true);
  });

  it("respects the disabled state", () => {
    render(<Checkbox label="標記為已完成" disabled />);
    expect(screen.getByRole("checkbox", { name: "標記為已完成" })).toBeDisabled();
  });

  it("supports a controlled checked value", () => {
    render(<Checkbox label="標記為已完成" checked onCheckedChange={() => {}} />);
    expect(screen.getByRole("checkbox", { name: "標記為已完成" })).toHaveAttribute(
      "data-state",
      "checked"
    );
  });
});

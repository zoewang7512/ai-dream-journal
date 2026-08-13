import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import userEvent from "@testing-library/user-event";
import { Select } from "./Select";

const options = [
  { value: "happy", label: "開心" },
  { value: "scared", label: "害怕" },
  { value: "confused", label: "困惑" },
];

describe("Select", () => {
  it("shows the placeholder when nothing is selected", () => {
    render(<Select options={options} placeholder="選擇心情" aria-label="心情" />);
    expect(screen.getByRole("combobox", { name: "心情" })).toHaveTextContent("選擇心情");
  });

  it("opens and selects an option, calling onValueChange", async () => {
    const onValueChange = vi.fn();
    render(
      <Select
        options={options}
        placeholder="選擇心情"
        aria-label="心情"
        onValueChange={onValueChange}
      />
    );

    await userEvent.click(screen.getByRole("combobox", { name: "心情" }));
    const option = await screen.findByRole("option", { name: "害怕" });
    await userEvent.click(option);

    expect(onValueChange).toHaveBeenCalledWith("scared");
  });

  it("respects the disabled state", () => {
    render(<Select options={options} disabled aria-label="心情" />);
    expect(screen.getByRole("combobox", { name: "心情" })).toHaveAttribute(
      "data-disabled"
    );
  });
});

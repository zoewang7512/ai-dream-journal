import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import userEvent from "@testing-library/user-event";
import { Input } from "./Input";

describe("Input", () => {
  it("accepts typed input", async () => {
    render(<Input aria-label="夢境標題" />);
    const input = screen.getByRole("textbox", { name: "夢境標題" });

    await userEvent.type(input, "森林裡的燈籠");

    expect(input).toHaveValue("森林裡的燈籠");
  });

  it("shows an accessible error message and marks the field invalid", () => {
    render(<Input aria-label="夢境標題" error="請輸入標題" />);
    const input = screen.getByRole("textbox", { name: "夢境標題" });

    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByRole("alert")).toHaveTextContent("請輸入標題");
    expect(input).toHaveAccessibleDescription("請輸入標題");
  });

  it("respects the disabled state", () => {
    render(<Input aria-label="夢境標題" disabled />);
    expect(screen.getByRole("textbox", { name: "夢境標題" })).toBeDisabled();
  });
});

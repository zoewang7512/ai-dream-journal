import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import userEvent from "@testing-library/user-event";
import { Card } from "./Card";

describe("Card", () => {
  it("renders as a plain container without a click handler", () => {
    render(<Card>森林裡的燈籠</Card>);
    const card = screen.getByText("森林裡的燈籠");
    expect(card.closest("div")).not.toHaveAttribute("role");
  });

  it("becomes an accessible clickable card when onClick is provided", async () => {
    const onClick = vi.fn();
    render(<Card onClick={onClick}>森林裡的燈籠</Card>);

    const card = screen.getByRole("button");
    await userEvent.click(card);
    expect(onClick).toHaveBeenCalledOnce();

    card.focus();
    await userEvent.keyboard("{Enter}");
    expect(onClick).toHaveBeenCalledTimes(2);
  });
});

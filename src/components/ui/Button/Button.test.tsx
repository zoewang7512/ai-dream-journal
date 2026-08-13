import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import userEvent from "@testing-library/user-event";
import { Button } from "./Button";

describe("Button", () => {
  it("renders children and responds to click", async () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>看完整內容</Button>);

    const button = screen.getByRole("button", { name: "看完整內容" });
    await userEvent.click(button);

    expect(onClick).toHaveBeenCalledOnce();
  });

  it("is disabled and unclickable while loading", async () => {
    const onClick = vi.fn();
    render(
      <Button onClick={onClick} loading>
        送出
      </Button>
    );

    const button = screen.getByRole("button", { name: "送出" });
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute("aria-busy", "true");

    await userEvent.click(button);
    expect(onClick).not.toHaveBeenCalled();
  });

  it("respects the disabled prop", () => {
    render(<Button disabled>停用</Button>);
    expect(screen.getByRole("button", { name: "停用" })).toBeDisabled();
  });
});

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import userEvent from "@testing-library/user-event";
import { Textarea } from "./Textarea";

describe("Textarea", () => {
  it("accepts multi-line typed input", async () => {
    render(<Textarea aria-label="夢境內容" />);
    const textarea = screen.getByRole("textbox", { name: "夢境內容" });

    await userEvent.type(textarea, "夢到在飛");
    expect(textarea).toHaveValue("夢到在飛");
  });

  it("shows an accessible error message", () => {
    render(<Textarea aria-label="夢境內容" error="內容不可為空" />);
    expect(screen.getByRole("alert")).toHaveTextContent("內容不可為空");
    expect(screen.getByRole("textbox", { name: "夢境內容" })).toHaveAttribute(
      "aria-invalid",
      "true"
    );
  });

  it("shows a character count that flags when the max length is exceeded", () => {
    const { rerender } = render(
      <Textarea aria-label="夢境內容" value="abc" maxLength={5} showCount onChange={() => {}} />
    );
    expect(screen.getByText("3/5")).toBeInTheDocument();

    rerender(
      <Textarea
        aria-label="夢境內容"
        value="abcdef"
        maxLength={5}
        showCount
        onChange={() => {}}
      />
    );
    expect(screen.getByText("6/5").className).toMatch(/countExceeded/);
  });
});

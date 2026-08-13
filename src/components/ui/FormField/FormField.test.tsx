import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { FormField } from "./FormField";

describe("FormField", () => {
  it("associates the label with its control via htmlFor/id", () => {
    render(
      <FormField id="dream-date" label="日期">
        <input id="dream-date" />
      </FormField>
    );

    expect(screen.getByLabelText("日期")).toBeInTheDocument();
  });

  it("shows a required marker", () => {
    render(
      <FormField id="dream-title" label="標題" required>
        <input id="dream-title" />
      </FormField>
    );
    expect(screen.getByText("*")).toBeInTheDocument();
  });

  it("shows the error instead of the hint when both are provided", () => {
    render(
      <FormField id="dream-title" label="標題" hint="幫這篇夢境取個名字" error="標題不可為空">
        <input id="dream-title" />
      </FormField>
    );

    expect(screen.getByRole("alert")).toHaveTextContent("標題不可為空");
    expect(screen.queryByText("幫這篇夢境取個名字")).not.toBeInTheDocument();
  });
});

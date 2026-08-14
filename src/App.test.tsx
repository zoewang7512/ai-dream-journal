import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import App from "./App";

describe("App", () => {
  it("renders the top-level nav and defaults to the journal page", () => {
    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );

    expect(
      screen.getByRole("heading", { name: "夢境日記" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "數據統計看板" })
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "備份設定" })).toBeInTheDocument();
  });
});

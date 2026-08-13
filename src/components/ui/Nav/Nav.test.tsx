import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { Nav } from "./Nav";

const items = [
  { to: "/", label: "寫日記/看日記", end: true },
  { to: "/dashboard", label: "數據統計看板" },
];

describe("Nav", () => {
  it("renders a link for each item and marks the current route active", () => {
    render(
      <MemoryRouter initialEntries={["/dashboard"]}>
        <Nav items={items} aria-label="主導覽" />
      </MemoryRouter>
    );

    expect(screen.getByRole("navigation", { name: "主導覽" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "數據統計看板" })).toHaveAttribute(
      "aria-current",
      "page"
    );
    expect(screen.getByRole("link", { name: "寫日記/看日記" })).not.toHaveAttribute(
      "aria-current"
    );
  });
});

import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { DreamRecord } from "../../types/dream";
import { EntryDetailReadonly } from "./EntryDetailReadonly";

const record: DreamRecord = {
  id: "1",
  date: "2026-08-10",
  content: "夢裡我在飛，越過了整片森林。",
  status: "completed",
  analysis: { mood: "興奮", keywords: ["飛翔", "冒險"], imagePrompt: "flying over a forest", seed: 1 },
  imageUrl: "https://example.com/dream.png",
  createdAt: "2026-08-10T00:00:00.000Z",
};

describe("EntryDetailReadonly", () => {
  it("renders the original text with no editable controls", () => {
    render(<EntryDetailReadonly part="text" record={record} />);

    expect(screen.getByText("夢裡我在飛，越過了整片森林。")).toBeInTheDocument();
    expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("renders mood, keywords, and the generated image with no editable controls", () => {
    render(<EntryDetailReadonly part="analysis" record={record} />);

    expect(screen.getByText("興奮")).toBeInTheDocument();
    expect(screen.getByText("飛翔")).toBeInTheDocument();
    expect(screen.getByText("冒險")).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "AI 生成的夢境插圖" })).toHaveAttribute(
      "src",
      "https://example.com/dream.png"
    );
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("shows a waiting placeholder when the record has no image yet", () => {
    const recordWithoutImage = { ...record, imageUrl: undefined };
    render(<EntryDetailReadonly part="analysis" record={recordWithoutImage} />);

    expect(screen.getByText("AI 生成圖片準備中")).toBeInTheDocument();
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
  });

  it("falls back to an error message instead of a broken image when loading fails", () => {
    render(<EntryDetailReadonly part="analysis" record={record} />);

    const image = screen.getByRole("img", { name: "AI 生成的夢境插圖" });
    fireEvent.error(image);

    expect(screen.getByText("圖片載入失敗，請稍後再試")).toBeInTheDocument();
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
  });

  it("renders empty text and a waiting placeholder when there is no record", () => {
    render(<EntryDetailReadonly part="text" record={undefined} />);
    expect(screen.queryByRole("textbox")).not.toBeInTheDocument();

    render(<EntryDetailReadonly part="analysis" record={undefined} />);
    expect(screen.getByText("AI 生成圖片準備中")).toBeInTheDocument();
  });
});

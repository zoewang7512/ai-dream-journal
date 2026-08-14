import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";
import { create, getByDate } from "../../lib/dream-storage";
import { getTodayDateString } from "./date";
import { TodayEntryEditor } from "./TodayEntryEditor";

const today = getTodayDateString();

beforeEach(() => {
  window.localStorage.clear();
});

describe("TodayEntryEditor", () => {
  it("loads existing draft content into the textarea", () => {
    const record = create({ date: today, content: "既有暫存內容" });
    render(<TodayEntryEditor date={today} record={record} />);

    expect(screen.getByRole("textbox", { name: "今日夢境日記內容" })).toHaveValue(
      "既有暫存內容"
    );
  });

  it("does not persist typed content until the 存檔 button is clicked", async () => {
    render(<TodayEntryEditor date={today} record={undefined} />);

    await userEvent.type(
      screen.getByRole("textbox", { name: "今日夢境日記內容" }),
      "夢到在飛"
    );

    expect(getByDate(today)).toBeUndefined();
  });

  it("saves as a draft when the 存檔 button is clicked", async () => {
    render(<TodayEntryEditor date={today} record={undefined} />);

    await userEvent.type(
      screen.getByRole("textbox", { name: "今日夢境日記內容" }),
      "手動存檔"
    );
    await userEvent.click(screen.getByRole("button", { name: "存檔" }));

    expect(getByDate(today)?.content).toBe("手動存檔");
    expect(getByDate(today)?.status).toBe("draft");
  });

  it("updates the existing record on subsequent saves instead of duplicating it", async () => {
    const record = create({ date: today, content: "第一版" });
    render(<TodayEntryEditor date={today} record={record} />);

    const textarea = screen.getByRole("textbox", { name: "今日夢境日記內容" });
    await userEvent.clear(textarea);
    await userEvent.type(textarea, "第二版");
    await userEvent.click(screen.getByRole("button", { name: "存檔" }));

    const saved = getByDate(today);
    expect(saved?.id).toBe(record.id);
    expect(saved?.content).toBe("第二版");
  });

  it("does not show a 刪除 entry point before anything has been saved", () => {
    render(<TodayEntryEditor date={today} record={undefined} />);
    expect(screen.queryByRole("button", { name: "刪除" })).not.toBeInTheDocument();
  });

  it("shows a 刪除 entry point once a draft exists", () => {
    const record = create({ date: today, content: "既有暫存內容" });
    render(<TodayEntryEditor date={today} record={record} />);
    expect(screen.getByRole("button", { name: "刪除" })).toBeInTheDocument();
  });

  it("shows a 刪除 entry point immediately after the first manual save", async () => {
    render(<TodayEntryEditor date={today} record={undefined} />);

    expect(screen.queryByRole("button", { name: "刪除" })).not.toBeInTheDocument();
    await userEvent.type(
      screen.getByRole("textbox", { name: "今日夢境日記內容" }),
      "夢到在飛"
    );
    await userEvent.click(screen.getByRole("button", { name: "存檔" }));

    expect(screen.getByRole("button", { name: "刪除" })).toBeInTheDocument();
  });

  it("keeps the record when the delete confirmation is cancelled", async () => {
    const record = create({ date: today, content: "既有暫存內容" });
    render(<TodayEntryEditor date={today} record={record} />);

    await userEvent.click(screen.getByRole("button", { name: "刪除" }));
    expect(screen.getByRole("dialog", { name: "刪除這篇日記？" })).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "取消" }));

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(getByDate(today)?.content).toBe("既有暫存內容");
    expect(
      screen.getByRole("textbox", { name: "今日夢境日記內容" })
    ).toHaveValue("既有暫存內容");
  });

  it("deletes the record and resets to a blank editor when confirmed", async () => {
    const record = create({ date: today, content: "既有暫存內容" });
    render(<TodayEntryEditor date={today} record={record} />);

    await userEvent.click(screen.getByRole("button", { name: "刪除" }));
    const dialog = screen.getByRole("dialog", { name: "刪除這篇日記？" });
    await userEvent.click(within(dialog).getByRole("button", { name: "刪除" }));

    expect(getByDate(today)).toBeUndefined();
    expect(
      screen.getByRole("textbox", { name: "今日夢境日記內容" })
    ).toHaveValue("");
    expect(screen.queryByRole("button", { name: "刪除" })).not.toBeInTheDocument();
  });

  it("blocks typing beyond the 2000 character limit and shows the count", async () => {
    const longContent = "a".repeat(2000);
    const record = create({ date: today, content: longContent });
    render(<TodayEntryEditor date={today} record={record} />);

    const textarea = screen.getByRole("textbox", { name: "今日夢境日記內容" });
    expect(screen.getByText("2000/2000")).toBeInTheDocument();

    await userEvent.type(textarea, "b");
    expect(textarea).toHaveValue(longContent);
  });
});

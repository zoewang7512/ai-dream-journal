import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { create, getByDate } from "../../lib/dream-storage";
import { getTodayDateString } from "./date";
import { TodayEntryEditor, type TodayEntryEditorProps } from "./TodayEntryEditor";

const today = getTodayDateString();

beforeEach(() => {
  window.localStorage.clear();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

function renderEditor(props: Partial<TodayEntryEditorProps> & { date: string }) {
  return render(<TodayEntryEditor onCompleted={() => {}} record={undefined} {...props} />);
}

function stubFetchResolvedOnce(response: { ok: boolean; json: () => Promise<unknown> }) {
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue(response));
}

describe("TodayEntryEditor", () => {
  it("loads existing draft content into the textarea", () => {
    const record = create({ date: today, content: "既有暫存內容" });
    renderEditor({ date: today, record });

    expect(screen.getByRole("textbox", { name: "今日夢境日記內容" })).toHaveValue(
      "既有暫存內容"
    );
  });

  it("does not persist typed content until the 存檔 button is clicked", async () => {
    renderEditor({ date: today });

    await userEvent.type(
      screen.getByRole("textbox", { name: "今日夢境日記內容" }),
      "夢到在飛"
    );

    expect(getByDate(today)).toBeUndefined();
  });

  it("saves as a draft when the 存檔 button is clicked", async () => {
    renderEditor({ date: today });

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
    renderEditor({ date: today, record });

    const textarea = screen.getByRole("textbox", { name: "今日夢境日記內容" });
    await userEvent.clear(textarea);
    await userEvent.type(textarea, "第二版");
    await userEvent.click(screen.getByRole("button", { name: "存檔" }));

    const saved = getByDate(today);
    expect(saved?.id).toBe(record.id);
    expect(saved?.content).toBe("第二版");
  });

  it("does not show a 刪除 entry point before anything has been saved", () => {
    renderEditor({ date: today });
    expect(screen.queryByRole("button", { name: "刪除" })).not.toBeInTheDocument();
  });

  it("shows a 刪除 entry point once a draft exists", () => {
    const record = create({ date: today, content: "既有暫存內容" });
    renderEditor({ date: today, record });
    expect(screen.getByRole("button", { name: "刪除" })).toBeInTheDocument();
  });

  it("shows a 刪除 entry point immediately after the first manual save", async () => {
    renderEditor({ date: today });

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
    renderEditor({ date: today, record });

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
    renderEditor({ date: today, record });

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
    renderEditor({ date: today, record });

    const textarea = screen.getByRole("textbox", { name: "今日夢境日記內容" });
    expect(screen.getByText("2000/2000")).toBeInTheDocument();

    await userEvent.type(textarea, "b");
    expect(textarea).toHaveValue(longContent);
  });

  describe("完成 flow", () => {
    it("disables 完成 when the textarea is empty, enables it once there is content", async () => {
      renderEditor({ date: today });

      expect(screen.getByRole("button", { name: "完成" })).toBeDisabled();

      await userEvent.type(
        screen.getByRole("textbox", { name: "今日夢境日記內容" }),
        "夢到在飛"
      );
      expect(screen.getByRole("button", { name: "完成" })).toBeEnabled();
    });

    it("opens a confirmation dialog before triggering AI generation, and cancel does not call the API", async () => {
      const fetchMock = vi.fn();
      vi.stubGlobal("fetch", fetchMock);
      renderEditor({ date: today });

      await userEvent.type(
        screen.getByRole("textbox", { name: "今日夢境日記內容" }),
        "夢到在飛"
      );
      await userEvent.click(screen.getByRole("button", { name: "完成" }));

      expect(screen.getByRole("dialog", { name: "完成這篇日記？" })).toBeInTheDocument();
      await userEvent.click(screen.getByRole("button", { name: "取消" }));

      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
      expect(fetchMock).not.toHaveBeenCalled();
      expect(getByDate(today)?.status).not.toBe("completed");
    });

    it("saves an unsaved draft, calls the API, and marks the record completed on confirm", async () => {
      stubFetchResolvedOnce({
        ok: true,
        json: async () => ({
          mood: "興奮",
          keywords: ["飛翔"],
          imagePrompt: "flying, monochromatic",
          seed: 7,
        }),
      });
      const onCompleted = vi.fn();
      renderEditor({ date: today, onCompleted });

      await userEvent.type(
        screen.getByRole("textbox", { name: "今日夢境日記內容" }),
        "夢到在飛"
      );
      await userEvent.click(screen.getByRole("button", { name: "完成" }));
      await userEvent.click(screen.getByRole("button", { name: "確定完成" }));

      const saved = getByDate(today);
      expect(saved?.status).toBe("completed");
      expect(saved?.analysis?.mood).toBe("興奮");
      expect(onCompleted).toHaveBeenCalledOnce();
    });

    it("shows a danger toast and keeps the draft editable when the API call fails", async () => {
      stubFetchResolvedOnce({
        ok: false,
        json: async () => ({ errorType: "upstream_error", message: "生成失敗，請稍後再試一次。" }),
      });
      renderEditor({ date: today });

      await userEvent.type(
        screen.getByRole("textbox", { name: "今日夢境日記內容" }),
        "夢到在飛"
      );
      await userEvent.click(screen.getByRole("button", { name: "完成" }));
      await userEvent.click(screen.getByRole("button", { name: "確定完成" }));

      expect(await screen.findByText("生成失敗，請稍後再試一次。")).toBeInTheDocument();
      expect(getByDate(today)?.status).toBe("draft");
      expect(
        screen.getByRole("textbox", { name: "今日夢境日記內容" })
      ).toBeEnabled();
      expect(screen.getByRole("button", { name: "完成" })).toBeEnabled();
    });

    it("disables 存檔/刪除/textarea while the AI request is in flight", async () => {
      let resolveFetch: (value: { ok: boolean; json: () => Promise<unknown> }) => void = () => {};
      vi.stubGlobal(
        "fetch",
        vi.fn().mockReturnValue(
          new Promise((resolve) => {
            resolveFetch = resolve;
          })
        )
      );
      const record = create({ date: today, content: "夢到在飛" });
      renderEditor({ date: today, record });

      await userEvent.click(screen.getByRole("button", { name: "完成" }));
      await userEvent.click(screen.getByRole("button", { name: "確定完成" }));

      expect(screen.getByRole("textbox", { name: "今日夢境日記內容" })).toBeDisabled();
      expect(screen.getByRole("button", { name: "存檔" })).toBeDisabled();
      expect(screen.getByRole("button", { name: "刪除" })).toBeDisabled();

      resolveFetch({
        ok: true,
        json: async () => ({ mood: "平靜", keywords: ["湖"], imagePrompt: "x, monochromatic", seed: 1 }),
      });
      await screen.findByRole("button", { name: "存檔" }).then((button) =>
        expect(button).toBeEnabled()
      );
    });

    it("notifies onCompletingChange while the AI request is in flight", async () => {
      let resolveFetch: (value: { ok: boolean; json: () => Promise<unknown> }) => void = () => {};
      vi.stubGlobal(
        "fetch",
        vi.fn().mockReturnValue(
          new Promise((resolve) => {
            resolveFetch = resolve;
          })
        )
      );
      const onCompletingChange = vi.fn();
      const record = create({ date: today, content: "夢到在飛" });
      renderEditor({ date: today, record, onCompletingChange });

      await userEvent.click(screen.getByRole("button", { name: "完成" }));
      await userEvent.click(screen.getByRole("button", { name: "確定完成" }));

      expect(onCompletingChange).toHaveBeenLastCalledWith(true);

      resolveFetch({
        ok: true,
        json: async () => ({ mood: "平靜", keywords: ["湖"], imagePrompt: "x, monochromatic", seed: 1 }),
      });
      await screen.findByRole("button", { name: "存檔" }).catch(() => undefined);
      expect(onCompletingChange).toHaveBeenLastCalledWith(false);
    });
  });
});

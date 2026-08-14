import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { create, getByDate } from "../../lib/dream-storage";
import { useCompleteEntry } from "./useCompleteEntry";

const DATE = "2026-08-14";

beforeEach(() => {
  window.localStorage.clear();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

function stubFetchResolvedOnce(response: { ok: boolean; json: () => Promise<unknown> }) {
  const fetchMock = vi.fn().mockResolvedValue(response);
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

describe("useCompleteEntry", () => {
  it("opens and closes the confirmation dialog", () => {
    const { result } = renderHook(() =>
      useCompleteEntry(
        DATE,
        "夢到在飛",
        () => {},
        () => {}
      )
    );

    expect(result.current.isDialogOpen).toBe(false);
    act(() => result.current.openDialog());
    expect(result.current.isDialogOpen).toBe(true);
    act(() => result.current.closeDialog());
    expect(result.current.isDialogOpen).toBe(false);
  });

  it("ensures the draft is saved before calling the API", async () => {
    const ensureSaved = vi.fn();
    stubFetchResolvedOnce({
      ok: true,
      json: async () => ({ mood: "平靜", keywords: ["湖"], imagePrompt: "a lake, monochromatic", seed: 1 }),
    });

    const { result } = renderHook(() =>
      useCompleteEntry(DATE, "夢到在飛", ensureSaved, () => {})
    );

    await act(async () => {
      await result.current.confirm();
    });

    expect(ensureSaved).toHaveBeenCalledOnce();
  });

  it("writes the analysis result and marks the record completed on success", async () => {
    create({ date: DATE, content: "夢到在飛" });
    stubFetchResolvedOnce({
      ok: true,
      json: async () => ({
        mood: "平靜",
        keywords: ["湖"],
        imagePrompt: "a lake, monochromatic",
        seed: 123,
      }),
    });

    const onCompleted = vi.fn();
    const { result } = renderHook(() => useCompleteEntry(DATE, "夢到在飛", () => {}, onCompleted));

    await act(async () => {
      await result.current.confirm();
    });

    const saved = getByDate(DATE);
    expect(saved?.status).toBe("completed");
    expect(saved?.analysis).toEqual({
      mood: "平靜",
      keywords: ["湖"],
      imagePrompt: "a lake, monochromatic",
      seed: 123,
    });
    expect(saved?.imageUrl).toContain("/api/dream-image");
    expect(saved?.completedAt).toBeTruthy();
    expect(onCompleted).toHaveBeenCalledOnce();
    expect(result.current.isSubmitting).toBe(false);
    expect(result.current.errorMessage).toBeUndefined();
  });

  it("sets an error message and leaves the record as draft when the API responds with an error", async () => {
    create({ date: DATE, content: "夢到在飛" });
    stubFetchResolvedOnce({
      ok: false,
      json: async () => ({
        errorType: "upstream_error",
        message: "夢境分析暫時無法使用，請稍後再試。",
      }),
    });

    const onCompleted = vi.fn();
    const { result } = renderHook(() => useCompleteEntry(DATE, "夢到在飛", () => {}, onCompleted));

    await act(async () => {
      await result.current.confirm();
    });

    expect(result.current.errorMessage).toBe("夢境分析暫時無法使用，請稍後再試。");
    expect(result.current.isSubmitting).toBe(false);
    expect(getByDate(DATE)?.status).toBe("draft");
    expect(onCompleted).not.toHaveBeenCalled();
  });

  it("falls back to a generic error message when the network request itself throws", async () => {
    create({ date: DATE, content: "夢到在飛" });
    vi.stubGlobal(
      "fetch",
      vi.fn().mockRejectedValue(new TypeError("Failed to fetch"))
    );

    const { result } = renderHook(() =>
      useCompleteEntry(
        DATE,
        "夢到在飛",
        () => {},
        () => {}
      )
    );

    await act(async () => {
      await result.current.confirm();
    });

    expect(result.current.errorMessage).toBe("生成失敗，請稍後再試一次。");
    expect(getByDate(DATE)?.status).toBe("draft");
  });

  it("allows retrying after a failure without getting stuck", async () => {
    create({ date: DATE, content: "夢到在飛" });
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({
        ok: false,
        json: async () => ({ errorType: "upstream_error", message: "失敗一次" }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          mood: "平靜",
          keywords: ["湖"],
          imagePrompt: "a lake, monochromatic",
          seed: 1,
        }),
      });
    vi.stubGlobal("fetch", fetchMock);

    const onCompleted = vi.fn();
    const { result } = renderHook(() => useCompleteEntry(DATE, "夢到在飛", () => {}, onCompleted));

    await act(async () => {
      await result.current.confirm();
    });
    expect(result.current.errorMessage).toBe("失敗一次");

    await act(async () => {
      await result.current.confirm();
    });
    expect(result.current.errorMessage).toBeUndefined();
    expect(onCompleted).toHaveBeenCalledOnce();
    expect(getByDate(DATE)?.status).toBe("completed");
  });

  it("dismissError clears the error message", async () => {
    create({ date: DATE, content: "夢到在飛" });
    stubFetchResolvedOnce({
      ok: false,
      json: async () => ({ errorType: "upstream_error", message: "失敗了" }),
    });

    const { result } = renderHook(() =>
      useCompleteEntry(
        DATE,
        "夢到在飛",
        () => {},
        () => {}
      )
    );

    await act(async () => {
      await result.current.confirm();
    });
    expect(result.current.errorMessage).toBe("失敗了");

    act(() => result.current.dismissError());
    expect(result.current.errorMessage).toBeUndefined();
  });
});

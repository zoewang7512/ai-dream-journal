import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { create, update } from "../../lib/dream-storage";
import { getTodayDateString } from "./date";
import { useJournalViewState } from "./useJournalViewState";

const today = getTodayDateString();

beforeEach(() => {
  window.localStorage.clear();
});

describe("useJournalViewState", () => {
  it("defaults to today-editing mode when there is no record yet", () => {
    const { result } = renderHook(() => useJournalViewState());

    expect(result.current.viewDate).toBe(today);
    expect(result.current.isToday).toBe(true);
    expect(result.current.mode).toBe("today-editing");
    expect(result.current.record).toBeUndefined();
  });

  it("stays in today-editing mode while today's record is a draft", () => {
    create({ date: today, content: "夢到在飛" });

    const { result } = renderHook(() => useJournalViewState());

    expect(result.current.mode).toBe("today-editing");
    expect(result.current.record?.status).toBe("draft");
  });

  it("switches to readonly mode once today's record is completed", () => {
    create({ date: today, content: "夢到在飛" });
    update(today, { status: "completed" });

    const { result } = renderHook(() => useJournalViewState());

    expect(result.current.mode).toBe("readonly");
  });

  it("navigates to a past completed record and back via previous/next", () => {
    create({ date: "2026-08-10", content: "舊夢一" });
    update("2026-08-10", { status: "completed" });

    const { result } = renderHook(() => useJournalViewState());

    expect(result.current.canGoPrevious).toBe(true);
    expect(result.current.canGoNext).toBe(false);

    act(() => result.current.goToPrevious());
    expect(result.current.viewDate).toBe("2026-08-10");
    expect(result.current.mode).toBe("readonly");
    expect(result.current.canGoPrevious).toBe(false);
    expect(result.current.canGoNext).toBe(true);

    act(() => result.current.goToNext());
    expect(result.current.viewDate).toBe(today);
    expect(result.current.mode).toBe("today-editing");
  });

  it("disables previous navigation when there is no history at all", () => {
    const { result } = renderHook(() => useJournalViewState());
    expect(result.current.canGoPrevious).toBe(false);
  });
});

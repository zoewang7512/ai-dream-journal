import { useState } from "react";
import { getByDate, listCompleted } from "../../lib/dream-storage";
import type { DreamRecord } from "../../types/dream";
import { getTodayDateString } from "./date";

export type JournalViewMode = "today-editing" | "readonly";

export interface JournalViewState {
  todayDate: string;
  viewDate: string;
  isToday: boolean;
  mode: JournalViewMode;
  record: DreamRecord | undefined;
  canGoPrevious: boolean;
  canGoNext: boolean;
  goToPrevious: () => void;
  goToNext: () => void;
}

/**
 * 今日未完成時一律停留在最新位置（sequence 索引 0），完成後與過去日期
 * 一起併入同一條依日期新到舊排序的翻頁序列，讓上一篇/下一篇共用同一套邊界判斷。
 */
export function useJournalViewState(): JournalViewState {
  const todayDate = getTodayDateString();
  const [viewDate, setViewDate] = useState(todayDate);

  const record = getByDate(viewDate);
  const isToday = viewDate === todayDate;
  const mode: JournalViewMode = isToday && record?.status !== "completed" ? "today-editing" : "readonly";

  const completedDates = listCompleted().map((entry) => entry.date);
  const sequence = [todayDate, ...completedDates.filter((date) => date !== todayDate)];
  const currentIndex = sequence.indexOf(viewDate);

  const canGoPrevious = currentIndex !== -1 && currentIndex < sequence.length - 1;
  const canGoNext = currentIndex > 0;

  function goToPrevious() {
    if (canGoPrevious) setViewDate(sequence[currentIndex + 1]);
  }

  function goToNext() {
    if (canGoNext) setViewDate(sequence[currentIndex - 1]);
  }

  return {
    todayDate,
    viewDate,
    isToday,
    mode,
    record,
    canGoPrevious,
    canGoNext,
    goToPrevious,
    goToNext,
  };
}

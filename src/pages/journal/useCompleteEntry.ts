import { useEffect, useRef, useState } from "react";
import { update } from "../../lib/dream-storage";
import { buildDreamImageUrl } from "../../lib/pollinations";
import type { DreamAnalysis } from "../../types/dream";

interface DreamAnalysisResponseBody {
  mood: string;
  keywords: string[];
  imagePrompt: string;
  seed: number;
}

interface DreamAnalysisErrorResponseBody {
  errorType: string;
  message: string;
}

const GENERIC_ERROR_MESSAGE = "生成失敗，請稍後再試一次。";

/**
 * 只有這個錯誤類別的 message 會顯示給使用者（來自後端結構化錯誤回應）；
 * 其他任何例外（fetch 本身失敗、JSON 解析失敗等）一律顯示通用訊息，
 * 避免把瀏覽器/技術層級的原始錯誤字串（例如 "Failed to fetch"）洩漏給使用者。
 */
class DreamCompletionError extends Error {}

export interface UseCompleteEntryResult {
  isDialogOpen: boolean;
  isSubmitting: boolean;
  errorMessage: string | undefined;
  openDialog: () => void;
  closeDialog: () => void;
  confirm: () => Promise<void>;
  dismissError: () => void;
}

/**
 * 觸發完成日記＋AI 生成的狀態機。呼叫端（TodayEntryEditor）負責在 confirm
 * 之前用 ensureSaved 確保底層已有 draft 紀錄，避免「內容打完直接按完成、
 * 從未點過存檔」時 dream-storage.update 因找不到紀錄而拋錯。
 */
export function useCompleteEntry(
  date: string,
  content: string,
  ensureSaved: () => void,
  onCompleted: () => void
): UseCompleteEntryResult {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>();
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  function openDialog() {
    setIsDialogOpen(true);
  }

  function closeDialog() {
    setIsDialogOpen(false);
  }

  function dismissError() {
    setErrorMessage(undefined);
  }

  async function confirm() {
    setIsDialogOpen(false);
    setIsSubmitting(true);
    setErrorMessage(undefined);
    ensureSaved();

    try {
      const response = await fetch("/api/dream-analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });

      if (!response.ok) {
        const errorBody = (await response.json().catch(() => undefined)) as
          | DreamAnalysisErrorResponseBody
          | undefined;
        throw new DreamCompletionError(errorBody?.message ?? GENERIC_ERROR_MESSAGE);
      }

      const body = (await response.json()) as DreamAnalysisResponseBody;
      const analysis: DreamAnalysis = {
        mood: body.mood,
        keywords: body.keywords,
        imagePrompt: body.imagePrompt,
        seed: body.seed,
      };

      update(date, {
        status: "completed",
        analysis,
        imageUrl: buildDreamImageUrl(analysis.imagePrompt, analysis.seed),
        completedAt: new Date().toISOString(),
      });

      if (!isMountedRef.current) return;
      setIsSubmitting(false);
      onCompleted();
    } catch (error) {
      if (!isMountedRef.current) return;
      setIsSubmitting(false);
      setErrorMessage(error instanceof DreamCompletionError ? error.message : GENERIC_ERROR_MESSAGE);
    }
  }

  return { isDialogOpen, isSubmitting, errorMessage, openDialog, closeDialog, confirm, dismissError };
}

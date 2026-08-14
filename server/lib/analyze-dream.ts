import { Type, type GoogleGenAI } from "@google/genai";
import { DreamAnalysisError, type AnalyzeDream } from "./dream-analysis-types";

const MODEL = "gemini-flash-latest";

/**
 * 固定情緒分類（繁中）：與專案其餘 UI 文案／既有測試資料（見「核心夢境日記記錄」
 * Epic 的元件測試 fixture）維持一致的語言，讓「夢境數據分析看板」Epic 之後可以
 * 直接顯示 mood 原始值，不需要額外的中英對照層。
 */
const MOOD_OPTIONS = ["焦慮", "平靜", "興奮", "悲傷", "恐懼", "開心", "困惑", "懷舊"] as const;

const RESPONSE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    mood: { type: Type.STRING, enum: [...MOOD_OPTIONS] },
    keywords: { type: Type.ARRAY, items: { type: Type.STRING } },
    imagePrompt: { type: Type.STRING },
  },
  required: ["mood", "keywords", "imagePrompt"],
};

const SYSTEM_INSTRUCTION = `你是一個夢境日記分析助手。使用者會提供一段夢境描述（繁體中文），請分析並只以 JSON 回傳三個欄位：
- mood：這個夢境傳達的主要情緒，只能是以下其中一種：${MOOD_OPTIONS.join("、")}。
- keywords：3 到 6 個代表夢境主題或意象的簡短繁體中文關鍵字。
- imagePrompt：一段適合送給圖像生成模型的「英文」描述，具體描繪夢境中的場景、主體與氛圍（不需要指定畫風，畫風由後續流程統一注入）。`;

interface ParsedAnalysis {
  mood: string;
  keywords: string[];
  imagePrompt: string;
}

function isParsedAnalysis(value: unknown): value is ParsedAnalysis {
  if (typeof value !== "object" || value === null) return false;
  const record = value as Record<string, unknown>;
  return (
    typeof record.mood === "string" &&
    MOOD_OPTIONS.includes(record.mood as (typeof MOOD_OPTIONS)[number]) &&
    Array.isArray(record.keywords) &&
    record.keywords.length > 0 &&
    record.keywords.every((keyword) => typeof keyword === "string" && keyword.trim().length > 0) &&
    typeof record.imagePrompt === "string" &&
    record.imagePrompt.trim().length > 0
  );
}

function generateSeed(): number {
  return Math.floor(Math.random() * 2 ** 32);
}

export const analyzeDream: AnalyzeDream = async (client: GoogleGenAI, content: string) => {
  let text: string | undefined;
  try {
    const response = await client.models.generateContent({
      model: MODEL,
      contents: content,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: RESPONSE_SCHEMA,
      },
    });
    text = response.text;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Gemini API 呼叫失敗。";
    throw new DreamAnalysisError("upstream_error", message, { cause: error });
  }

  if (!text) {
    throw new DreamAnalysisError("invalid_response", "Gemini 回傳內容為空。");
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch (error) {
    throw new DreamAnalysisError("invalid_response", "Gemini 回傳內容不是合法的 JSON。", {
      cause: error,
    });
  }

  if (!isParsedAnalysis(parsed)) {
    throw new DreamAnalysisError("invalid_response", "Gemini 回傳格式不符合預期的分析結構。");
  }

  return {
    mood: parsed.mood,
    keywords: parsed.keywords,
    imagePrompt: parsed.imagePrompt,
    seed: generateSeed(),
  };
};

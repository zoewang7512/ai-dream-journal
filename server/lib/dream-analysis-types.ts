import type { GoogleGenAI } from "@google/genai";

export type DreamAnalysisErrorType =
  | "invalid_request"
  | "timeout"
  | "quota_exceeded"
  | "invalid_response"
  | "upstream_error";

export interface DreamAnalysisErrorBody {
  errorType: DreamAnalysisErrorType;
  message: string;
}

export interface DreamAnalysisSuccessBody {
  mood: string;
  keywords: string[];
  imagePrompt: string;
  seed: number;
}

export type AnalyzeDream = (
  client: GoogleGenAI,
  content: string
) => Promise<DreamAnalysisSuccessBody>;

export class DreamAnalysisError extends Error {
  readonly errorType: DreamAnalysisErrorType;

  constructor(errorType: DreamAnalysisErrorType, message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = "DreamAnalysisError";
    this.errorType = errorType;
  }
}

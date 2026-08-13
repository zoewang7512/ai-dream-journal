export type DreamStatus = "draft" | "completed";

export interface DreamAnalysis {
  mood: string;
  keywords: string[];
  imagePrompt: string;
  seed: number;
}

export interface DreamRecord {
  id: string;
  /** YYYY-MM-DD, unique per record (one entry per day). */
  date: string;
  content: string;
  status: DreamStatus;
  analysis?: DreamAnalysis;
  imageUrl?: string;
  createdAt: string;
  completedAt?: string;
}

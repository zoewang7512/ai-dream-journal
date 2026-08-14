import { listCompleted } from "../../lib/dream-storage";
import type { DreamRecord } from "../../types/dream";

export interface DreamStats {
  records: DreamRecord[];
  totalCompleted: number;
  averageWordCount: number;
  daysRecorded: number;
  isEmpty: boolean;
}

/**
 * 讀取所有 completed 日記並計算頁面二四個圖表區塊共用的基本統計。
 * 個別圖表（情緒趨勢、關鍵字頻率、月曆聚合等）的專屬統計邏輯留給各自的任務卡，
 * 在拿到這裡回傳的 records 之後各自再做進一步計算。
 */
export function useDreamStats(): DreamStats {
  const records = listCompleted();
  const totalCompleted = records.length;
  const averageWordCount =
    totalCompleted === 0
      ? 0
      : Math.round(records.reduce((sum, record) => sum + record.content.length, 0) / totalCompleted);
  // dream-storage 以 date 為 key，同一天最多一筆 completed 紀錄，記錄天數理論上恆等於
  // 總完成篇數；仍明確用 Set 算一次，避免未來儲存模型改變時這裡悄悄變成錯誤假設。
  const daysRecorded = new Set(records.map((record) => record.date)).size;

  return {
    records,
    totalCompleted,
    averageWordCount,
    daysRecorded,
    isEmpty: totalCompleted === 0,
  };
}

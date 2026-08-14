/**
 * 指向本專案後端的 /api/dream-image 代理端點，而不是直接打 Pollinations.ai。
 * flux 模型需要 Pollinations 的 Secret key（無限流），這把金鑰只存在後端，
 * 前端只帶 prompt/seed，實際帶金鑰的請求由後端代為發出。
 */
export function buildDreamImageUrl(imagePrompt: string, seed: number): string {
  const params = new URLSearchParams({ prompt: imagePrompt, seed: String(seed) });
  return `/api/dream-image?${params.toString()}`;
}

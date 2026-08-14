/**
 * 手繪黑白素描風格的強制修飾詞清單（開頭／結尾皆會加入，見 feature-spec 的
 * 「手繪風格 Prompt 工程」User Story）。任何呼叫端（system instruction 或
 * 防呆補值）都應該只從這裡讀取，避免多處各自維護一份清單造成不一致。
 */
export const STYLE_MODIFIERS = [
  "pencil sketch",
  "graphite sketch",
  "observational drawing",
  "hand-drawn lines",
  "cross-hatching for shading",
  "rugged lines",
  "monochromatic",
  "black and white sketch",
  "on aged textured paper with imperfections",
] as const;

/**
 * 常見的「有彩色」描述詞黑名單，用來從 imagePrompt 中移除色彩描述。
 * 刻意不包含 black/white/grey/gray/monochromatic/sepia 之外的無彩色詞，
 * 因為那些詞本身就是我們要求的必要修飾詞，不能被自己的防呆邏輯誤刪。
 */
const CHROMATIC_COLOR_WORDS = [
  "red",
  "orange",
  "yellow",
  "green",
  "blue",
  "purple",
  "violet",
  "indigo",
  "pink",
  "magenta",
  "cyan",
  "turquoise",
  "gold",
  "golden",
  "silver",
  "bronze",
  "brown",
  "tan",
  "beige",
  "maroon",
  "crimson",
  "scarlet",
  "emerald",
  "teal",
  "lavender",
  "coral",
  "peach",
  "colorful",
  "colourful",
  "vibrant",
  "vivid",
  "colored",
  "coloured",
] as const;

/**
 * 附加在 Gemini system instruction 裡，明確要求 imagePrompt 開頭與結尾都
 * 帶上完整修飾詞清單，且不得出現有彩色描述。
 */
export function buildImagePromptInstruction(): string {
  const modifierList = STYLE_MODIFIERS.join(", ");
  return `imagePrompt 必須以「${modifierList}」開頭，並在結尾再次以「${modifierList}」收尾，確保整段描述保持純黑白、單色調的手繪素描風格；不得包含任何有彩色（例如紅、橘、黃、綠、藍、紫、粉、金、棕等）描述詞，只能使用黑、白、灰階相關的描述。`;
}

function stripChromaticColorWords(text: string): string {
  let result = text;
  for (const color of CHROMATIC_COLOR_WORDS) {
    result = result.replace(new RegExp(`\\b${color}\\b`, "gi"), "");
  }

  return result
    .replace(/,\s*,/g, ",")
    .replace(/\s{2,}/g, " ")
    .replace(/\s+,/g, ",")
    .replace(/,\s*$/, "")
    .replace(/^\s*,\s*/, "")
    .trim();
}

/**
 * 防呆：不論 Gemini 是否確實遵守 system instruction，回傳前一律確保
 * imagePrompt 含有全部必要修飾詞、且移除常見有彩色描述詞。
 */
export function ensureSketchStyle(imagePrompt: string): string {
  const withoutColor = stripChromaticColorWords(imagePrompt);
  const lower = withoutColor.toLowerCase();
  const missing = STYLE_MODIFIERS.filter((modifier) => !lower.includes(modifier.toLowerCase()));

  if (missing.length === 0) {
    return withoutColor;
  }

  return `${withoutColor}, ${missing.join(", ")}`;
}

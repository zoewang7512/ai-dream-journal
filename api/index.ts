import { createApp } from "../server/app";
import { loadConfig } from "../server/config";
import { analyzeDream } from "../server/lib/analyze-dream";
import { createGeminiClient } from "../server/lib/gemini-client";

const config = loadConfig();
const client = createGeminiClient(config.geminiApiKey);

export default createApp(client, analyzeDream);

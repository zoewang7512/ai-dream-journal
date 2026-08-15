import { createApp } from "../server/app.js";
import { loadConfig } from "../server/config.js";
import { analyzeDream } from "../server/lib/analyze-dream.js";
import { createGeminiClient } from "../server/lib/gemini-client.js";

const config = loadConfig();
const client = createGeminiClient(config.geminiApiKey);

export default createApp(client, config.pollinationsApiKey, analyzeDream);

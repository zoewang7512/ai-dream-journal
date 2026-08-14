import { createApp } from "./app";
import { loadConfig, type AppConfig } from "./config";
import { analyzeDream } from "./lib/analyze-dream";
import { createGeminiClient } from "./lib/gemini-client";

let config: AppConfig;
try {
  config = loadConfig();
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
}

const client = createGeminiClient(config.geminiApiKey);
const app = createApp(client, config.pollinationsApiKey, analyzeDream);

app.listen(config.port, () => {
  console.log(`API server listening on http://localhost:${config.port}`);
});

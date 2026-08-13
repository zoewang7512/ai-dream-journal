import app from "./app";
import { loadConfig, type AppConfig } from "./config";

let config: AppConfig;
try {
  config = loadConfig();
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
}

app.listen(config.port, () => {
  console.log(`API server listening on http://localhost:${config.port}`);
});

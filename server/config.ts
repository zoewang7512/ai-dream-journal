function loadDotEnvIfPresent(): void {
  try {
    process.loadEnvFile(".env");
  } catch {
    // .env is optional: local dev may not have one yet, and deployed
    // environments (e.g. Vercel) inject variables without a file on disk.
  }
}

export interface AppConfig {
  geminiApiKey: string;
  port: number;
}

export function loadConfig(env: NodeJS.ProcessEnv = process.env): AppConfig {
  loadDotEnvIfPresent();

  const geminiApiKey = env.GEMINI_API_KEY;
  if (!geminiApiKey) {
    throw new Error(
      "Missing required environment variable: GEMINI_API_KEY. Copy .env.example to .env and set a value."
    );
  }

  return {
    geminiApiKey,
    port: Number(env.PORT ?? 3001),
  };
}

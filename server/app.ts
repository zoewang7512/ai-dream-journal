import express, { type Express } from "express";
import type { GoogleGenAI } from "@google/genai";
import { createDreamAnalysisRouter, type AnalyzeDream } from "./routes/dream-analysis";
import { createDreamImageRouter } from "./routes/dream-image";

export function createApp(
  client: GoogleGenAI,
  pollinationsApiKey: string,
  analyzeDream?: AnalyzeDream
): Express {
  const app = express();
  app.use(express.json());

  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  app.use(createDreamAnalysisRouter(client, analyzeDream));
  app.use(createDreamImageRouter(pollinationsApiKey));

  return app;
}

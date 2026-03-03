import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import cors from "cors";

import apiRouter from "./routes/api";

export function createApp() {
  const app = express();

  app.use(
    cors({
      origin: ["http://localhost:3000"],
      credentials: true,
    })
  );
  app.use(helmet());
  app.use(express.json({ limit: "1mb" }));
  app.use(morgan("dev"));

  app.get("/health", (_req, res) => {
    res.json({ ok: true });
  });

  app.use("/api", apiRouter);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    console.error("[express] unhandled error:", err);
    res.status(500).json({ error: "Internal server error" });
  });

  return app;
}

import express from "express";
import cors from "cors";
import path, { dirname, join } from "path";
import { fileURLToPath } from "url";
import { handleDemo } from "./routes/demo";

const __dirname = dirname(fileURLToPath(import.meta.url));
const distPath = join(__dirname, "..", "spa");

export function createServer() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Serve static files (клиент)
  app.use(express.static(distPath));

  // API routes
  app.get("/api/ping", (_req, res) => {
    res.json({ message: "Hello from Express server v2!" });
  });

  app.get("/api/demo", handleDemo);

  // Отдача index.html на все маршруты кроме /api
  app.get("*", (req, res) => {
    if (req.path.startsWith("/api")) {
      return res.status(404).json({ error: "API endpoint not found" });
    }
    res.sendFile(join(distPath, "index.html"));
  });

  return app;
}

import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Example API route for job search (Placeholder for now)
  app.get("/api/jobs/search", (req, res) => {
    // In a real app, this would fetch from external APIs or a database
    res.json([
      { id: "1", title: "Frontend Developer", company: "Rakuten", location: "Tokyo", salary: "6M - 9M JPY" },
      { id: "2", title: "Backend Engineer", company: "Mercari", location: "Tokyo", salary: "8M - 12M JPY" },
    ]);
  });

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();

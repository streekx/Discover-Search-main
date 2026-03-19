import type { Express } from "express";
import { createServer, type Server } from "node:http";

export async function registerRoutes(app: Express): Promise<Server> {
  app.get("/api/doodle", (_req, res) => {
    res.json({
      type: "image",
      image_url: null,
      click_action: null,
      alt: "Grim Doodle",
    });
  });

  const httpServer = createServer(app);

  return httpServer;
}

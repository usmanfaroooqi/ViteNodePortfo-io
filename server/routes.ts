import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function registerRoutes(app: Express): Promise<Server> {
  // Gemini API - Design Brief Generator
  app.post("/api/generate-brief", async (req, res) => {
    try {
      const { query } = req.body;

      if (!query || typeof query !== "string") {
        return res.status(400).json({ error: "Query is required" });
      }

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ error: "API key not configured" });
      }

      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

      const prompt = `As a world-class Creative Director, generate a concise, inspiring, 3-4 sentence design brief for: ${query}

Focus on:
- Core visual challenge
- Target audience insights
- Creative direction and style
- Key design principles

Be specific, actionable, and professional.`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const brief = response.text();

      res.json({ brief });
    } catch (error: any) {
      console.error("Error generating brief:", error);
      res.status(500).json({ error: "Failed to generate brief" });
    }
  });

  // Gemini API - Generate Ideas Endpoint
  app.post("/api/generate-ideas", async (req, res) => {
    try {
      const { projectType } = req.body;

      if (!projectType || typeof projectType !== "string") {
        return res.status(400).json({ error: "Project type is required" });
      }

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        console.error("GEMINI_API_KEY not configured");
        return res.status(500).json({ error: "API key not configured" });
      }

      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

      const prompt = `As a professional graphic design assistant, generate creative ideas for: ${projectType}

Provide:
- 3-5 unique design concepts
- Color palette suggestions
- Typography recommendations
- Style inspirations
- Key considerations

Format concisely for a client presentation. Keep it professional and actionable.`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const ideas = response.text();

      res.json({ ideas });
    } catch (error: any) {
      console.error("Error generating ideas:", error);
      res.status(500).json({
        error: "Failed to generate ideas",
        message: error.message,
      });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}

import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Server-side storage directory for sync across devices
const DATA_DIR = path.join(process.cwd(), ".data");
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Lazy Gemini API Client initialization
function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

// ---------------- API ROUTES ----------------

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Gemini AI Assistant Endpoint
app.post("/api/gemini/assist", async (req, res) => {
  try {
    const { action, prompt, context, systemInstruction, temperature } = req.body;

    const ai = getGeminiClient();
    if (!ai) {
      return res.status(503).json({
        error: "Gemini API key is not configured in server environment.",
        mockFallback: true,
      });
    }

    let defaultSysInstruction =
      "You are an empathetic, sharp, and highly structured personal life strategist, full-stack tech lead, and knowledge management assistant. Your goal is to help the user eliminate chaos, build successful coding projects, turn side-hustle ideas into revenue, retain learning effectively, and maintain calm mental clarity. Provide actionable, well-formatted markdown responses with concrete next steps.";

    if (systemInstruction) {
      defaultSysInstruction = systemInstruction;
    }

    const fullPrompt = context
      ? `[Context/Data]:\n${typeof context === "string" ? context : JSON.stringify(context, null, 2)}\n\n[User Request]:\n${prompt}`
      : prompt;

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: fullPrompt,
      config: {
        systemInstruction: defaultSysInstruction,
        temperature: temperature !== undefined ? temperature : 0.7,
      },
    });

    res.json({
      text: response.text || "No response generated.",
      success: true,
    });
  } catch (error: any) {
    console.error("Gemini API error:", error);
    res.status(500).json({
      error: error.message || "Failed to process AI request.",
      success: false,
    });
  }
});

// AI Structured Generation (e.g., Flashcards, Business Canvas, Side Hustle Ideas, Habit Suggestions)
app.post("/api/gemini/structured", async (req, res) => {
  try {
    const { type, topic, context } = req.body;
    const ai = getGeminiClient();
    if (!ai) {
      return res.status(503).json({
        error: "Gemini API key is not configured.",
        mockFallback: true,
      });
    }

    let prompt = "";
    let systemInstruction = "You are an expert AI productivity and system assistant.";

    if (type === "side_hustle_ideas") {
      prompt = `Generate 4 realistic, high-potential online business or side-hustle ideas based on: ${topic || "coding skills, creative art/design, digital products, and low upfront capital"}. 
Return valid JSON format with array of objects having keys: 
title (string), 
tagline (string), 
targetAudience (string), 
monetization (string), 
difficulty (Easy|Medium|Challenging), 
initialCost (string e.g. "$0 - $50"), 
timeToFirstDollar (string e.g. "1-2 weeks"), 
potentialMonthlyRevenue (string e.g. "$500 - $3,000/mo"), 
firstThreeSteps (array of 3 specific strings), 
skillsNeeded (array of strings).`;
      systemInstruction = "You provide hyper-practical, no-nonsense online business blueprints for indie creators and developers. Output strictly JSON without markdown fences.";
    } else if (type === "flashcards") {
      prompt = `Generate 5 high-yield learning flashcards from this content or topic: ${topic || "Full stack web development"}.
Return valid JSON format array of objects with keys: 
question (string), 
answer (string), 
category (string), 
difficulty (Easy|Medium|Hard).`;
      systemInstruction = "You create clear, memorable, spaced-repetition flashcards. Output strictly JSON without markdown fences.";
    } else if (type === "mind_declutter") {
      prompt = `The user feels overwhelmed with this mental brain dump: "${topic}". 
Analyze their situation with compassion and structure. Return JSON with:
summary (string validating their state in 1 sentence),
urgentTriage (array of 2-3 immediate, easy micro-actions taking <5 mins each),
mediumTermTasks (array of 2-3 prioritized tasks for this week),
discardOrDefer (array of 2 things they can safely stop stressing about today),
upliftingAffirmation (short empowering closing sentence).`;
      systemInstruction = "You are a calming executive coach and ADHD-friendly organization specialist. Output strictly JSON without markdown fences.";
    } else if (type === "code_snippet_explain") {
      prompt = `Analyze this code snippet or technical topic: "${topic}". Return JSON with:
summary (string),
keyConcepts (array of strings),
potentialBugsOrEdgeCases (array of strings),
improvementSuggestion (string),
practicalUseCases (array of strings).`;
      systemInstruction = "You are a senior tech architect. Output strictly JSON without markdown fences.";
    } else {
      prompt = `Generate structured insights for topic "${topic}". Return a JSON object with title, summary, and actionItems (array of strings).`;
    }

    if (context) {
      prompt += `\nAdditional Context: ${JSON.stringify(context)}`;
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: prompt,
      config: {
        systemInstruction,
        temperature: 0.6,
        responseMimeType: "application/json",
      },
    });

    const text = response.text || "{}";
    let parsedData;
    try {
      parsedData = JSON.parse(text);
    } catch {
      // Clean possible fences if any
      const cleaned = text.replace(/```json/g, "").replace(/```/g, "").trim();
      parsedData = JSON.parse(cleaned);
    }

    res.json({ data: parsedData, success: true });
  } catch (error: any) {
    console.error("Gemini Structured API error:", error);
    res.status(500).json({
      error: error.message || "Failed to generate structured data.",
      success: false,
    });
  }
});

// Sync endpoints for cross-device synchronization
// Reads or saves user vault data by syncKey (defaults to "default_user_vault")
app.get("/api/sync/:vaultId", (req, res) => {
  try {
    const vaultId = req.params.vaultId || "default_user_vault";
    // Sanitize vaultId
    const safeId = vaultId.replace(/[^a-zA-Z0-9_-]/g, "_");
    const filePath = path.join(DATA_DIR, `vault_${safeId}.json`);

    if (!fs.existsSync(filePath)) {
      return res.json({ found: false, data: null, lastSynced: null });
    }

    const raw = fs.readFileSync(filePath, "utf-8");
    const parsed = JSON.parse(raw);
    res.json({
      found: true,
      data: parsed.data,
      lastSynced: parsed.lastSynced,
      version: parsed.version || 1,
    });
  } catch (err: any) {
    console.error("Sync read error:", err);
    res.status(500).json({ error: "Failed to read sync vault" });
  }
});

app.post("/api/sync/:vaultId", (req, res) => {
  try {
    const vaultId = req.params.vaultId || "default_user_vault";
    const safeId = vaultId.replace(/[^a-zA-Z0-9_-]/g, "_");
    const filePath = path.join(DATA_DIR, `vault_${safeId}.json`);

    const payload = {
      vaultId: safeId,
      data: req.body.data,
      lastSynced: new Date().toISOString(),
      version: (req.body.version || 1) + 1,
    };

    fs.writeFileSync(filePath, JSON.stringify(payload, null, 2), "utf-8");
    res.json({
      success: true,
      lastSynced: payload.lastSynced,
      version: payload.version,
    });
  } catch (err: any) {
    console.error("Sync write error:", err);
    res.status(500).json({ error: "Failed to save sync vault" });
  }
});

// ---------------- VITE MIDDLEWARE / STATIC SERVING ----------------

async function startServer() {
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
    console.log(`Personal Life OS Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();

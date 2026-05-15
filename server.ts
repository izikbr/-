console.log("Starting server script...");

import express from "express";
import path from "path";
import cors from "cors";
import multer from "multer";
import { GoogleGenAI, Type } from "@google/genai";

const upload = multer({ storage: multer.memoryStorage() });

async function startServer() {
  console.log("Initializing Express application...");
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());

  // Request logger for debugging - moved to top
  app.use((req, res, next) => {
    console.log(`[Request Log] ${new Date().toISOString()} ${req.method} ${req.url}`);
    next();
  });

  const apiKey = process.env.GEMINI_API_KEY;
  console.log("Checking Gemini API key:", apiKey ? "Present" : "Missing");
  
  const ai = apiKey ? new GoogleGenAI({ 
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  }) : null;

  // API Router
  const apiRouter = express.Router();

  // Middleware to check if AI is initialized
  const checkAI = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (!ai) {
      console.warn("AI check failed: Gemini API key is missing.");
      return res.status(500).json({ error: "Gemini API key is missing on the server. Please check your environment variables." });
    }
    next();
  };

  // API Health Checks
  apiRouter.get("/health", (req, res) => {
    console.log("[Health Check] API is hit");
    res.json({ 
      status: "ok", 
      ai_ready: !!ai, 
      time: new Date().toISOString()
    });
  });

  // Nutrition Text Route
  apiRouter.post("/nutrition/text", checkAI, async (req, res) => {
    const { query } = req.body;
    console.log(`[AI Nutrition Text] Query: "${query}"`);
    
    if (!query || typeof query !== 'string') {
      console.warn("[AI Nutrition Text] Missing or invalid query");
      return res.status(400).json({ error: "Missing food description" });
    }

    try {
      const response = await ai!.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Analyze this food: "${query}". Estimate per-portion nutrition.`,
        config: {
          systemInstruction: "Return JSON: {name, calories, protein, carbs, fat}. Use Hebrew for name.",
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              calories: { type: Type.NUMBER },
              protein: { type: Type.NUMBER },
              carbs: { type: Type.NUMBER },
              fat: { type: Type.NUMBER },
            },
            required: ["name", "calories", "protein", "carbs", "fat"],
          },
        },
      });

      const data = JSON.parse(response.text.trim());
      console.log("[AI Nutrition Text] Success:", data.name);
      res.json(data);
    } catch (error: any) {
      console.error("[AI Nutrition Text] Error:", error);
      res.status(500).json({ error: "ניתוח הטקסט נכשל. נסה שוב או הזן ידנית." });
    }
  });

  // Nutrition Image Route
  apiRouter.post("/nutrition/image", upload.single('image'), checkAI, async (req, res) => {
    if (!req.file) {
      console.warn("[AI Nutrition Image] No image uploaded");
      return res.status(400).json({ error: "No image uploaded" });
    }

    console.log(`[AI Nutrition Image] File received: ${req.file.originalname}`);

    try {
      const response = await ai!.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: {
          parts: [
            { inlineData: { data: req.file.buffer.toString('base64'), mimeType: req.file.mimetype } },
            { text: "Identify food items." }
          ]
        },
        config: {
          systemInstruction: "Return JSON array of {name, calories, protein, carbs, fat} in Hebrew.",
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                calories: { type: Type.NUMBER },
                protein: { type: Type.NUMBER },
                carbs: { type: Type.NUMBER },
                fat: { type: Type.NUMBER },
              },
              required: ["name", "calories", "protein", "carbs", "fat"],
            }
          },
        },
      });

      const data = JSON.parse(response.text.trim());
      console.log(`[AI Nutrition Image] Success: identified ${data.length} items`);
      res.json(data);
    } catch (error: any) {
      console.error("[AI Nutrition Image] Error:", error);
      res.status(500).json({ error: "ניתוח התמונה נכשל. נסה שוב." });
    }
  });

  // Suggestions Route
  apiRouter.post("/suggestions", checkAI, async (req, res) => {
    const { query } = req.body;
    console.log(`[AI Suggestions] Request: "${query}"`);
    try {
      const response = await ai!.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `הצע ארוחות בריאות: ${query}`,
        config: {
          systemInstruction: "אתה שף ותזונאי. ספק 3 הצעות בעברית ב-Markdown.",
        }
      });
      res.json({ text: response.text });
    } catch (error) {
      console.error("[AI Suggestions] Error:", error);
      res.status(500).json({ error: "Failed to get suggestions" });
    }
  });

  // Insights Route
  apiRouter.post("/insights", checkAI, async (req, res) => {
    const { summary } = req.body;
    console.log("[AI Insights] Generating insights...");
    try {
      const response = await ai!.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `נתח יומן מזון: ${summary}`,
        config: {
          systemInstruction: "ספק תובנות תזונה בעברית ב-Markdown.",
        }
      });
      res.json({ text: response.text });
    } catch (error) {
      console.error("[AI Insights] Error:", error);
      res.status(500).json({ error: "Failed to get insights" });
    }
  });

  // Mount API Router
  app.use("/api", apiRouter);

  // Catch-all for UNHANDLED API routes
  app.all("/api/*", (req, res) => {
    console.warn(`[404 API] ${req.method} ${req.originalUrl}`);
    res.status(404).json({ 
      error: "API endpoint not found", 
      path: req.originalUrl,
      method: req.method
    });
  });

  // Vite/Production middleware - handles EVERYTHING ELSE
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    const indexPath = path.join(distPath, 'index.html');
    
    console.log("Production mode: serving static files from", distPath);
    
    app.use(express.static(distPath));
    
    app.get('*', (req, res) => {
      res.sendFile(indexPath, (err) => {
        if (err) {
          console.error("Error sending index.html:", err);
          res.status(404).send("Application shell not found. Please wait for build to complete.");
        }
      });
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();

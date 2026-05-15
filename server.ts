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

  // Request logger for debugging
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
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

  // Middleware to check if AI is initialized
  const checkAI = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (!ai) {
      console.warn("AI check failed: Gemini API key is missing.");
      return res.status(500).json({ error: "Gemini API key is missing on the server." });
    }
    next();
  };

  // API Routes
  const apiRouter = express.Router();

  apiRouter.get("/health", (req, res) => {
    res.json({ 
      status: "ok", 
      ai_ready: !!ai, 
      env: process.env.NODE_ENV,
      version: "1.0.1" 
    });
  });

  apiRouter.get("/test", (req, res) => {
    res.json({ message: "API is working" });
  });

  apiRouter.post("/nutrition/text", checkAI, async (req, res) => {
    const { query } = req.body;
    console.log(`[AI Nutrition] Request received: "${query}"`);
    
    if (!query || typeof query !== 'string') {
      return res.status(400).json({ error: "Invalid query" });
    }

    try {
      console.log(`[AI Nutrition] Calling Gemini API for: "${query}"...`);
      const response = await ai!.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Analyze this food description in Hebrew: "${query}". Estimate calories, protein, carbs, and fat for the whole portion described.`,
        config: {
          systemInstruction: "Analyze the food and provide nutritional estimates. Important: ALWAYS provide a name for the food in the 'name' field (Hebrew). If description is vague, use standard portions. If you don't know what it is, return 0s but make sure 'name' is not empty.",
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING, description: "Food name in Hebrew" },
              calories: { type: Type.NUMBER },
              protein: { type: Type.NUMBER },
              carbs: { type: Type.NUMBER },
              fat: { type: Type.NUMBER },
            },
            required: ["name", "calories", "protein", "carbs", "fat"],
          },
        },
      });

      const text = response.text;
      console.log(`[AI Nutrition] Raw text response: "${text}"`);

      if (!text) {
        throw new Error("AI returned empty response (possibly filtered)");
      }

      let parsedData;
      try {
        let cleanedText = text.trim();
        if (cleanedText.startsWith('```')) {
          cleanedText = cleanedText.replace(/^```json\n?/, '').replace(/\n?```$/, '');
        }
        parsedData = JSON.parse(cleanedText);
      } catch (parseError) {
        console.error("[AI Nutrition] JSON Parse Error:", parseError, "Text was:", text);
        throw new Error("Failed to parse AI response as JSON");
      }
      
      // Ensure name is never empty
      if (!parsedData.name || parsedData.name.trim() === "") {
        parsedData.name = query;
      }
      
      console.log(`[AI Nutrition] Success:`, parsedData);
      res.json(parsedData);
    } catch (error: any) {
      console.error("[AI Nutrition] Error:", error);
      const statusCode = error.status || 500;
      const message = error.message || "Failed to analyze text";
      res.status(statusCode).json({ error: message });
    }
  });

  apiRouter.post("/nutrition/image", upload.single('image'), checkAI, async (req, res) => {
    if (!req.file) {
      console.warn("[AI Image] No image uploaded");
      return res.status(400).json({ error: "No image uploaded" });
    }

    console.log(`[AI Image] Processing image: ${req.file.originalname} (${req.file.size} bytes)`);

    try {
      const response = await ai!.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: {
          parts: [
            { inlineData: { data: req.file.buffer.toString('base64'), mimeType: req.file.mimetype } },
            { text: "Identify all distinct food items in this image and estimate their nutrition per serving." }
          ]
        },
        config: {
          systemInstruction: "Analyze the image and provide a JSON array of food items. For each, give Hebrew name and nutritional estimates.",
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING, description: "Food name in Hebrew" },
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

      const text = response.text;
      console.log(`[AI Image] Raw text response: "${text}"`);

      if (!text) {
        throw new Error("AI returned empty response for image");
      }

      let data;
      try {
        let cleaned = text.trim();
        if (cleaned.startsWith('```')) {
          cleaned = cleaned.replace(/^```json\n?/, '').replace(/\n?```$/, '');
        }
        data = JSON.parse(cleaned);
      } catch (parseErr) {
        console.error("[AI Image] JSON Parse Error:", parseErr, "Text:", text);
        throw new Error("Failed to parse AI image response");
      }

      console.log(`[AI Image] Successfully identified ${Array.isArray(data) ? data.length : 0} items`);
      res.json(data);
    } catch (error: any) {
      console.error("[AI Image] Error:", error);
      const statusCode = error.status || 500;
      const message = error.message || "Failed to analyze image";
      res.status(statusCode).json({ error: message });
    }
  });

  apiRouter.post("/suggestions", checkAI, async (req, res) => {
    const { query } = req.body;
    try {
      const response = await ai!.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `הצע ארוחות בריאות בהתבסס על הבקשה הבאה: ${query}`,
        config: {
          systemInstruction: "אתה שף ותזונאי יצירתי. ספק 3 הצעות לארוחות בעברית עם רשימת רכיבים והוראות פשוטות. השתמש בפורמט Markdown.",
        }
      });
      res.json({ text: response.text });
    } catch (error) {
      res.status(500).json({ error: "Failed to get suggestions" });
    }
  });

  apiRouter.post("/insights", checkAI, async (req, res) => {
    const { summary } = req.body;
    try {
      const response = await ai!.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `נתח את סיכום יומן המזון של המשתמש ל-7 הימים האחרונים: ${summary}`,
        config: {
          systemInstruction: "אתה מאמן תזונה חיובי ומעודד. ספק תובנה חיובית אחת, אזור אחד לשיפור וטיפ אחד פשוט ובר ביצוע. השב בעברית בפורמט Markdown.",
        }
      });
      res.json({ text: response.text });
    } catch (error) {
      res.status(500).json({ error: "Failed to get insights" });
    }
  });

  // Mount API router
  app.use("/api", apiRouter);

  // Catch-all for UNHANDLED API routes
  app.all("/api/*", (req, res) => {
    console.warn(`404 at API route: ${req.method} ${req.url}`);
    res.status(404).json({ 
      error: "API endpoint not found", 
      path: req.originalUrl,
      method: req.method 
    });
  });

  // Vite middleware for development
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

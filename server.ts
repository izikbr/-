import express from "express";
import path from "path";
import cors from "cors";
import multer from "multer";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";

const upload = multer({ storage: multer.memoryStorage() });

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());

  const apiKey = process.env.GEMINI_API_KEY;
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
      return res.status(500).json({ error: "Gemini API key is missing on the server." });
    }
    next();
  };

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", ai_ready: !!ai });
  });

  app.post("/api/nutrition/text", checkAI, async (req, res) => {
    const { query } = req.body;
    console.log("Analyzing text nutrition for:", query);
    try {
      const response = await ai!.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `נתח את תיאור המזון הבא בעברית: "${query}". הערך את הערכים התזונתיים לכל המנה המתוארת.`,
        config: {
          systemInstruction: "נתח את המזון וספק הערכות תזונתיות. חשוב: תמיד ספק שם למזון בשדה 'name' (למשל, חזור על תיאור המשתמש אם אינך בטוח). אם התיאור עמום, השתמש במנות סטנדרטיות. אם אינך יודע מה המזון בכלל, החזר 0 בערכים המספריים אך וודא ששדה ה-'name' אינו ריק.",
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING, description: "שם המזון בעברית" },
              calories: { type: Type.NUMBER },
              protein: { type: Type.NUMBER },
              carbs: { type: Type.NUMBER },
              fat: { type: Type.NUMBER },
            },
            required: ["name", "calories", "protein", "carbs", "fat"],
          },
        },
      });

      console.log("AI Text Raw Response:", response.text);
      const data = JSON.parse(response.text);
      res.json(data);
    } catch (error) {
      console.error("AI Text Error:", error);
      res.status(500).json({ error: "Failed to analyze text" });
    }
  });

  app.post("/api/nutrition/image", upload.single('image'), checkAI, async (req, res) => {
    if (!req.file) return res.status(400).json({ error: "No image uploaded" });

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
                name: { type: Type.STRING, description: "שם המזון בעברית" },
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

      res.json(JSON.parse(response.text));
    } catch (error) {
      console.error("AI Image Error:", error);
      res.status(500).json({ error: "Failed to analyze image" });
    }
  });

  app.post("/api/suggestions", checkAI, async (req, res) => {
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

  app.post("/api/insights", checkAI, async (req, res) => {
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

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();

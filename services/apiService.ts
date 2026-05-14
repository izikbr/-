import { GoogleGenAI, Type } from "@google/genai";
import { FoodItem } from "../types";

export const getNutritionInfoFromText = async (ai: GoogleGenAI, query: string): Promise<Omit<FoodItem, 'id'> | null> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: `אתה תזונאי מומחה. נתח את תיאור המזון הבא בעברית: "${query}". הערך את הערכים התזונתיים לכל המנה המתוארת.`,
      config: {
        systemInstruction: "נתח את המזון וספק הערכות תזונתיות. אם התיאור עמום, השתמש במנות סטנדרטיות. אם אינך יודע מה המזון, החזר 0 בערכים המספריים אך ספק שם בעברית.",
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

    const jsonText = response.text?.trim();
    if (!jsonText) return null;

    try {
      const parsedResponse = JSON.parse(jsonText);
      return {
        name: parsedResponse.name,
        calories: Number(parsedResponse.calories) || 0,
        protein: Number(parsedResponse.protein) || 0,
        carbs: Number(parsedResponse.carbs) || 0,
        fat: Number(parsedResponse.fat) || 0,
        timestamp: new Date().toISOString()
      };
    } catch (parseError) {
      console.error("Failed to parse AI response:", jsonText);
      return null;
    }
  } catch (error) {
    console.error("Error getting nutrition info from text with Gemini:", error);
    return null;
  }
};

export const getFoodFromImage = async (ai: GoogleGenAI, imageFile: File): Promise<Omit<FoodItem, 'id'>[]> => {
    try {
      const base64Data = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
        reader.readAsDataURL(imageFile);
      });

      const response = await ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: {
          parts: [
            { inlineData: { data: base64Data, mimeType: imageFile.type } },
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
  
      const jsonText = response.text?.trim();
      if (!jsonText) return [];
  
      try {
        const parsedResponse = JSON.parse(jsonText);
        if (Array.isArray(parsedResponse)) {
            return parsedResponse.map(item => ({
                name: item.name,
                calories: Number(item.calories) || 0,
                protein: Number(item.protein) || 0,
                carbs: Number(item.carbs) || 0,
                fat: Number(item.fat) || 0,
                timestamp: new Date().toISOString()
            }));
        }
        return [];
      } catch (parseError) {
        console.error("Failed to parse AI response:", jsonText);
        return [];
      }
    } catch (error) {
      console.error("Error getting nutrition info from image with Gemini:", error);
      return [];
    }
};

// Aliases for compatibility if needed
export const getNutritionInfoFromImage = async (ai: GoogleGenAI, base64Image: string): Promise<Omit<FoodItem, 'id'> | null> => {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: {
          parts: [
            { inlineData: { data: base64Image, mimeType: "image/jpeg" } },
            { text: "Identify the primary food in this image and estimate its nutritional content." }
          ]
        },
        config: {
          systemInstruction: "Identify the food and provide summary name in Hebrew and nutritional estimates.",
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
  
      const jsonText = response.text?.trim();
      if (!jsonText) return null;
  
      const parsedResponse = JSON.parse(jsonText);
      return {
        name: parsedResponse.name,
        calories: Number(parsedResponse.calories) || 0,
        protein: Number(parsedResponse.protein) || 0,
        carbs: Number(parsedResponse.carbs) || 0,
        fat: Number(parsedResponse.fat) || 0,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error("Error in getNutritionInfoFromImage:", error);
      return null;
    }
};

export const getMealSuggestions = async (ai: GoogleGenAI, query: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: `הצע ארוחות בריאות בהתבסס על הבקשה הבאה: ${query}`,
      config: {
        systemInstruction: "אתה שף ותזונאי יצירתי. ספק 3 הצעות לארוחות בעברית עם רשימת רכיבים והוראות פשוטות. השתמש בפורמט Markdown.",
      }
    });

    return response.text || "לא הצלחנו לקבל המלצות כרגע.";
  } catch (error) {
    console.error("Error getting suggestions from Gemini:", error);
    return "שגיאה בקבלת המלצות.";
  }
};

export const getWeeklyInsights = async (ai: GoogleGenAI, summary: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: `נתח את סיכום יומן המזון של המשתמש ל-7 הימים האחרונים: ${summary}`,
      config: {
        systemInstruction: "אתה מאמן תזונה חיובי ומעודד. ספק תובנה חיובית אחת, אזור אחד לשיפור וטיפ אחד פשוט ובר ביצוע. השב בעברית בפורמט Markdown.",
      }
    });

    return response.text || "אין תובנות כרגע. המשך להזין נתונים!";
  } catch (error) {
    console.error("Error getting insights from Gemini:", error);
    return "שגיאה בייצור תובנות.";
  }
};

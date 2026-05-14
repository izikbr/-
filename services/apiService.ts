import { FoodItem } from "../types";

export const getNutritionInfoFromText = async (query: string): Promise<Omit<FoodItem, 'id'> | null> => {
  try {
    const response = await fetch("/api/nutrition/text", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query }),
    });

    if (!response.ok) throw new Error("Failed to get nutrition info");
    const data = await response.json();

    return {
      name: data.name,
      calories: Number(data.calories) || 0,
      protein: Number(data.protein) || 0,
      carbs: Number(data.carbs) || 0,
      fat: Number(data.fat) || 0,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error("Error getting nutrition info from text:", error);
    return null;
  }
};

export const getFoodFromImage = async (imageFile: File): Promise<Omit<FoodItem, 'id'>[]> => {
    try {
      const formData = new FormData();
      formData.append('image', imageFile);

      const response = await fetch("/api/nutrition/image", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Failed to get food from image");
      const data = await response.json();

      if (Array.isArray(data)) {
          return data.map(item => ({
              name: item.name,
              calories: Number(item.calories) || 0,
              protein: Number(item.protein) || 0,
              carbs: Number(item.carbs) || 0,
              fat: Number(item.fat) || 0,
              timestamp: new Date().toISOString()
          }));
      }
      return [];
    } catch (error) {
      console.error("Error getting food from image:", error);
      return [];
    }
};

export const getMealSuggestions = async (query: string): Promise<string> => {
  try {
    const response = await fetch("/api/suggestions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query }),
    });

    if (!response.ok) throw new Error("Failed to get suggestions");
    const data = await response.json();
    return data.text || "לא הצלחנו לקבל המלצות כרגע.";
  } catch (error) {
    console.error("Error getting suggestions:", error);
    return "שגיאה בקבלת המלצות.";
  }
};

export const getWeeklyInsights = async (summary: string): Promise<string> => {
  try {
    const response = await fetch("/api/insights", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ summary }),
    });

    if (!response.ok) throw new Error("Failed to get insights");
    const data = await response.json();
    return data.text || "אין תובנות כרגע. המשך להזין נתונים!";
  } catch (error) {
    console.error("Error getting insights:", error);
    return "שגיאה בייצור תובנות.";
  }
};

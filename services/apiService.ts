import { FoodItem } from "../types";

export const getNutritionInfoFromText = async (query: string): Promise<Omit<FoodItem, 'id'> | null> => {
  const response = await fetch("/api/nutrition/text", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query }),
  });

  if (!response.ok) {
    let errorMessage = `Server error: ${response.status} (Text Nutrition)`;
    try {
      const text = await response.text();
      try {
        const errorData = JSON.parse(text);
        if (errorData && errorData.error) errorMessage = errorData.error;
      } catch (e) {
        console.warn("Response not JSON:", text.substring(0, 100));
      }
    } catch (e) {
      console.error("Failed to read response body");
    }
    throw new Error(errorMessage);
  }
  const data = await response.json();

  return {
    name: data.name,
    calories: Number(data.calories) || 0,
    protein: Number(data.protein) || 0,
    carbs: Number(data.carbs) || 0,
    fat: Number(data.fat) || 0,
    timestamp: new Date().toISOString()
  };
};

export const getFoodFromImage = async (imageFile: File): Promise<Omit<FoodItem, 'id'>[]> => {
    const formData = new FormData();
    formData.append('image', imageFile);

    const response = await fetch("/api/nutrition/image", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      let errorMessage = `Server error: ${response.status} (Image Nutrition)`;
      try {
        const text = await response.text();
        try {
          const errorData = JSON.parse(text);
          if (errorData && errorData.error) errorMessage = errorData.error;
        } catch (e) {
          console.warn("Response not JSON:", text.substring(0, 100));
        }
      } catch (e) {
        console.error("Failed to read response body");
      }
      throw new Error(errorMessage);
    }
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
};

export const getMealSuggestions = async (query: string): Promise<string> => {
  const response = await fetch("/api/suggestions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query }),
  });

  if (!response.ok) {
    let errorMessage = `Server error: ${response.status} (Suggestions)`;
    try {
      const text = await response.text();
      try {
        const errorData = JSON.parse(text);
        if (errorData && errorData.error) errorMessage = errorData.error;
      } catch (e) {
        console.warn("Response not JSON:", text.substring(0, 100));
      }
    } catch (e) {
      console.error("Failed to read response body");
    }
    throw new Error(errorMessage);
  }
  const data = await response.json();
  return data.text || "לא הצלחנו לקבל המלצות כרגע.";
};

export const getWeeklyInsights = async (summary: string): Promise<string> => {
  const response = await fetch("/api/insights", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ summary }),
  });

  if (!response.ok) {
    let errorMessage = `Server error: ${response.status} (Insights)`;
    try {
      const text = await response.text();
      try {
        const errorData = JSON.parse(text);
        if (errorData && errorData.error) errorMessage = errorData.error;
      } catch (e) {
        console.warn("Response not JSON:", text.substring(0, 100));
      }
    } catch (e) {
      console.error("Failed to read response body");
    }
    throw new Error(errorMessage);
  }
  const data = await response.json();
  return data.text || "אין תובנות כרגע. המשך להזין נתונים!";
};

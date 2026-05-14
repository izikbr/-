import { FoodItem } from '../types';

type CommonFood = Omit<FoodItem, 'id' | 'timestamp'>;

export const commonFoods: CommonFood[] = [
  // Dairy & Eggs
  { name: 'ביצה קשה (גדולה)', calories: 78, protein: 6, carbs: 0.6, fat: 5 },
  { name: 'חביתה (2 ביצים)', calories: 180, protein: 12, carbs: 1, fat: 14 },
  { name: 'קוטג\' 5% (100 גרם)', calories: 98, protein: 11, carbs: 3.4, fat: 5 },
  { name: 'יוגורט יווני 2% (150 גרם)', calories: 110, protein: 15, carbs: 6, fat: 2 },
  { name: 'חלב 3% (כוס, 240 מ"ל)', calories: 150, protein: 8, carbs: 12, fat: 8 },
  { name: 'גבינה צהובה 28% (פרוסה)', calories: 110, protein: 7, carbs: 1, fat: 9 },

  // Proteins
  { name: 'חזה עוף (100 גרם, מבושל)', calories: 165, protein: 31, carbs: 0, fat: 3.6 },
  { name: 'סלמון (100 גרם, אפוי)', calories: 206, protein: 22, carbs: 0, fat: 12 },
  { name: 'טונה בשמן (קופסה מסוננת)', calories: 190, protein: 29, carbs: 0, fat: 8 },
  { name: 'טופו (100 גרם)', calories: 76, protein: 8, carbs: 1.9, fat: 4.8 },

  // Grains & Carbs
  { name: 'לחם לבן (פרוסה)', calories: 75, protein: 2.5, carbs: 14, fat: 1 },
  { name: 'לחם מלא (פרוסה)', calories: 70, protein: 3, carbs: 12, fat: 1 },
  { name: 'אורז לבן (כוס מבושל)', calories: 205, protein: 4.3, carbs: 45, fat: 0.4 },
  { name: 'פסטה (כוס מבושל)', calories: 220, protein: 8, carbs: 43, fat: 1.3 },
  { name: 'תפוח אדמה (בינוני, אפוי)', calories: 160, protein: 4, carbs: 37, fat: 0.2 },
  { name: 'קינואה (כוס מבושלת)', calories: 222, protein: 8, carbs: 39, fat: 3.6 },

  // Fruits
  { name: 'תפוח עץ (בינוני)', calories: 95, protein: 0.5, carbs: 25, fat: 0.3 },
  { name: 'בננה (בינונית)', calories: 105, protein: 1.3, carbs: 27, fat: 0.4 },
  { name: 'תפוז (בינוני)', calories: 62, protein: 1.2, carbs: 15, fat: 0.2 },
  { name: 'ענבים (כוס)', calories: 104, protein: 1, carbs: 27, fat: 0.2 },

  // Vegetables
  { name: 'מלפפון (בינוני)', calories: 15, protein: 0.7, carbs: 3.6, fat: 0.1 },
  { name: 'עגבניה (בינונית)', calories: 22, protein: 1, carbs: 5, fat: 0.2 },
  { name: 'גזר (בינוני)', calories: 25, protein: 0.6, carbs: 6, fat: 0.1 },
  { name: 'ברוקולי (כוס קצוץ)', calories: 31, protein: 2.6, carbs: 6, fat: 0.3 },
  { name: 'סלט ירקות קטן (ללא רוטב)', calories: 50, protein: 2, carbs: 10, fat: 0.5 },

  // Fats & Nuts
  { name: 'אבוקדו (חצי)', calories: 160, protein: 2, carbs: 9, fat: 15 },
  { name: 'שקדים (רבע כוס)', calories: 207, protein: 7.6, carbs: 7, fat: 18 },
  { name: 'שמן זית (כף)', calories: 120, protein: 0, carbs: 0, fat: 14 },
];

// types.ts
export enum Gender {
  Male = 'male',
  Female = 'female',
}

export enum ActivityLevel {
  Low = 'low',
  Medium = 'medium',
  High = 'high',
}

export enum Goal {
  Lose = 'lose',
  Maintain = 'maintain',
  Gain = 'gain',
}

export interface WeightEntry {
  date: string; // YYYY-MM-DD
  weight: number; // in kg
}

export interface UserProfile {
  id: string;
  name: string;
  avatar?: string;
  gender: Gender;
  age: number;
  height: number; // in cm
  weight: number; // in kg
  targetWeight: number; // in kg
  activityLevel: ActivityLevel;
  goal: Goal;
  loseWeightWeeks?: number; // Only if goal is 'lose'
  weightLog?: WeightEntry[];
  // FIX: Added foodLog to track consumed items.
  foodLog?: FoodItem[];
  fastingLog?: FastingEntry[];
}

export interface FastingEntry {
  id: string;
  startTime: string; // ISO string
  endTime: string;   // ISO string
  type: 'intermittent'; // for future flexibility
}

export interface FoodItem {
  id: string;
  name:string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  timestamp: string; // ISO string
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string; // Emoji
}
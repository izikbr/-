
import { ActivityLevel } from './types';

export const ACTIVITY_FACTORS: Record<ActivityLevel, number> = {
  [ActivityLevel.Low]: 1.375,
  [ActivityLevel.Medium]: 1.55,
  [ActivityLevel.High]: 1.725,
};

export const GOAL_ADJUSTMENTS: Record<string, number> = {
    lose: -400,
    maintain: 0,
    gain: 400,
};

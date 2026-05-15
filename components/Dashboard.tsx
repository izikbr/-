

import React, { useMemo, useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChevronRight, 
  ChevronLeft, 
  Flame, 
  Plus, 
  Camera, 
  Clock, 
  Edit2, 
  Trash2, 
  UserCircle,
  TrendingDown,
  TrendingUp,
  History,
  Target
} from 'lucide-react';
import { UserProfile, FoodItem, Gender, Goal, WeightEntry, Achievement } from '../types';
import { ACTIVITY_FACTORS, GOAL_ADJUSTMENTS } from '../constants';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';

import Card from './common/Card';
import ImageLogModal from './ImageLogModal';
import ManualLogModal from './ManualLogModal';
import UpdateProfileModal from './UpdateProfileModal';
import EditFoodItemModal from './EditFoodItemModal';
import UpdateGoalTimelineModal from './UpdateGoalTimelineModal';
import BmiChart from './BmiChart';
import MealPlanner from './MealPlanner';
import WeeklyInsights from './WeeklyInsights';
import Achievements from './Achievements';
import FastingLogModal from './FastingLogModal';
import FastingTracker from './FastingTracker';
import { FastingEntry } from '../types';


interface DashboardProps {
  userProfile: UserProfile;
  onUpdateProfile: (updatedData: Partial<UserProfile>) => void;
  onUpdateFoodLog: (foodLog: FoodItem[]) => void;
  onUpdateFastingLog: (fastingLog: FastingEntry[]) => void;
  onAddWeight: (date: string, weight: number) => void;
}

const formatDateDisplay = (dateStr: string) => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const todayStr = today.toISOString().split('T')[0];
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    if (dateStr === todayStr) return 'סיכום יומי';
    if (dateStr === yesterdayStr) return 'אתמול';
    
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat('he-IL', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(date);
};

const Dashboard: React.FC<DashboardProps> = ({ userProfile, onUpdateProfile, onUpdateFoodLog, onUpdateFastingLog, onAddWeight }) => {
  const [activeModal, setActiveModal] = useState<null | 'image' | 'manual' | 'updateProfile' | 'updateTimeline' | 'editFoodItem' | 'fasting'>(null);
  const [editingFoodItem, setEditingFoodItem] = useState<FoodItem | null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [currentWeightInput, setCurrentWeightInput] = useState<string>('');
  const [weightSaved, setWeightSaved] = useState(false);


  useEffect(() => {
    const todayWeight = userProfile.weightLog?.find(entry => entry.date === selectedDate)?.weight;
    setCurrentWeightInput(todayWeight ? String(todayWeight) : '');
  }, [selectedDate, userProfile.weightLog]);

  const { dailyCalories, dailyProtein, dailyCarbs, dailyFat, bmi } = useMemo(() => {
    const { gender, weight, height, age, activityLevel, goal, targetWeight, loseWeightWeeks } = userProfile;
    // Harris-Benedict BMR Formula
    const bmr = gender === Gender.Male
      ? 88.362 + (13.397 * weight) + (4.799 * height) - (5.677 * age)
      : 447.593 + (9.247 * weight) + (3.098 * height) - (4.330 * age);
    
    const tdee = bmr * ACTIVITY_FACTORS[activityLevel];
    
    let goalAdjustment = GOAL_ADJUSTMENTS[goal] || 0;

    if (goal === Goal.Lose && loseWeightWeeks && loseWeightWeeks > 0) {
        const weightToLose = weight - targetWeight;
        if (weightToLose > 0) {
            const totalCalorieDeficit = weightToLose * 7700;
            const dailyDeficit = totalCalorieDeficit / (loseWeightWeeks * 7);
            goalAdjustment = -dailyDeficit;
        }
    }

    const finalCalories = Math.round(tdee + goalAdjustment);

    const proteinGrams = Math.round((finalCalories * 0.30) / 4);
    const carbsGrams = Math.round((finalCalories * 0.40) / 4);
    const fatGrams = Math.round((finalCalories * 0.30) / 9);
    
    const bmiValue = weight / ((height / 100) ** 2);

    return { 
      dailyCalories: finalCalories, 
      dailyProtein: proteinGrams, 
      dailyCarbs: carbsGrams, 
      dailyFat: fatGrams,
      bmi: bmiValue,
    };
  }, [userProfile]);

  const foodLogForSelectedDate = useMemo(() => {
    return (userProfile.foodLog || [])
        .filter(item => item.timestamp.startsWith(selectedDate))
        .sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [userProfile.foodLog, selectedDate]);

  const consumed = useMemo(() => {
    return foodLogForSelectedDate.reduce((acc, item) => {
      acc.calories += item.calories;
      acc.protein += item.protein;
      acc.carbs += item.carbs;
      acc.fat += item.fat;
      return acc;
    }, { calories: 0, protein: 0, carbs: 0, fat: 0 });
  }, [foodLogForSelectedDate]);
  
  const chartData = useMemo(() => {
    const combinedData: { [date: string]: { date: string; weight?: number; calories?: number } } = {};

    (userProfile.weightLog || []).forEach(entry => {
        combinedData[entry.date] = { ...combinedData[entry.date], date: entry.date, weight: entry.weight };
    });

    (userProfile.foodLog || []).forEach(item => {
        const date = item.timestamp.split('T')[0];
        if (!combinedData[date]) {
            combinedData[date] = { date };
        }
        combinedData[date].calories = (combinedData[date].calories || 0) + item.calories;
    });

    return Object.values(combinedData).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [userProfile.weightLog, userProfile.foodLog]);
  
  const { startingWeight, weightToGo, progressPercentage, weightChange } = useMemo(() => {
    const sortedWeightLog = [...(userProfile.weightLog || [])].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    const startWeight = sortedWeightLog[0]?.weight ?? userProfile.weight;
    const currentWeight = userProfile.weight;
    const targetWeight = userProfile.targetWeight;
    
    let toGo = 0;
    let progress = 0;

    if (userProfile.goal === Goal.Lose) {
        toGo = currentWeight - targetWeight;
        const totalToLose = startWeight - targetWeight;
        if (totalToLose > 0) {
            progress = ((startWeight - currentWeight) / totalToLose) * 100;
        } else if (toGo <= 0) {
            progress = 100;
        }
    } else if (userProfile.goal === Goal.Gain) {
        toGo = targetWeight - currentWeight;
        const totalToGain = targetWeight - startWeight;
        if (totalToGain > 0) {
            progress = ((currentWeight - startWeight) / totalToGain) * 100;
        } else if (toGo <= 0) {
            progress = 100;
        }
    }

    return {
        startingWeight: startWeight,
        weightToGo: toGo,
        progressPercentage: Math.max(0, Math.min(100, progress)),
        weightChange: currentWeight - startWeight,
    };
  }, [userProfile.weight, userProfile.targetWeight, userProfile.weightLog, userProfile.goal]);


  const handleLogItems = (items: Omit<FoodItem, 'id'>[]) => {
    const newItems = items.map(item => ({...item, id: uuidv4(), timestamp: new Date().toISOString() }));
    const updatedLog = [...(userProfile.foodLog || []), ...newItems];
    onUpdateFoodLog(updatedLog);
  };
  
  const handleUpdateItem = (updatedItem: FoodItem) => {
    const updatedLog = (userProfile.foodLog || []).map(item => item.id === updatedItem.id ? updatedItem : item);
    onUpdateFoodLog(updatedLog);
    setEditingFoodItem(null);
    setActiveModal(null);
  };

  const handleDeleteItem = (itemId: string) => {
    if (window.confirm("האם אתה בטוח שברצונך למחוק פריט זה?")) {
        const updatedLog = (userProfile.foodLog || []).filter(item => item.id !== itemId);
        onUpdateFoodLog(updatedLog);
    }
  };

  const handleLogFasting = (entry: FastingEntry) => {
    const updatedLog = [...(userProfile.fastingLog || []), entry];
    onUpdateFastingLog(updatedLog);
  };

  const handleDeleteFasting = (id: string) => {
    if (window.confirm("האם אתה בטוח שברצונך למחוק דיווח צום זה?")) {
      const updatedLog = (userProfile.fastingLog || []).filter(item => item.id !== id);
      onUpdateFastingLog(updatedLog);
    }
  };
  
  const handleDateChange = (direction: 'prev' | 'next') => {
      const currentDate = new Date(selectedDate);
      if (direction === 'prev') {
          currentDate.setDate(currentDate.getDate() - 1);
      } else {
          currentDate.setDate(currentDate.getDate() + 1);
      }
      setSelectedDate(currentDate.toISOString().split('T')[0]);
  };
  
  const handleWeightSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const weight = parseFloat(currentWeightInput);
    if (!isNaN(weight) && weight > 0) {
        onAddWeight(selectedDate, weight);
        setWeightSaved(true);
        setTimeout(() => setWeightSaved(false), 2000); // Hide message after 2s
    }
  };


  const isToday = selectedDate === new Date().toISOString().split('T')[0];

  const getBmiCategory = (bmiValue: number) => {
    if (bmiValue < 18.5) return { text: 'תת משקל', color: 'text-blue-500' };
    if (bmiValue < 25) return { text: 'משקל תקין', color: 'text-green-500' };
    if (bmiValue < 30) return { text: 'עודף משקל', color: 'text-amber-500' };
    return { text: 'השמנת יתר', color: 'text-red-500' };
  };
  const bmiCategory = getBmiCategory(bmi);

  const streak = useMemo(() => {
    if (!userProfile.foodLog || userProfile.foodLog.length === 0) return 0;
    // FIX: Using `Array.from` ensures correct type inference for `logDates`, preventing errors with `new Date()`.
    const logDates = Array.from(new Set(userProfile.foodLog.map(item => item.timestamp.split('T')[0]))).sort((a, b) => new Date(b as string).getTime() - new Date(a as string).getTime()) as string[];
    
    let currentStreak = 0;
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    const todayStr = today.toISOString().split('T')[0];
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    if (logDates[0] !== todayStr && logDates[0] !== yesterdayStr) {
        return 0; // Streak is broken if the last log was before yesterday
    }

    for (let i = 0; i < logDates.length; i++) {
        const currentDate = new Date(logDates[i]);
        if (i === 0) {
            currentStreak = 1;
            continue;
        }
        const prevDate = new Date(logDates[i-1]);
        const diffTime = prevDate.getTime() - currentDate.getTime();
        const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 1) {
            currentStreak++;
        } else {
            break; // Found a gap
        }
    }
    return currentStreak;
  }, [userProfile.foodLog]);
  
  const allAchievements: Achievement[] = [
    { id: 'start', name: 'צעד ראשון', description: 'הוספת את הארוחה הראשונה שלך!', icon: '🎉' },
    { id: 'streak3', name: 'מומנטום', description: 'רצף של 3 ימי רישום!', icon: '🔥' },
    { id: 'lose2kg', name: 'מתחילים לראות תוצאות', description: 'ירידה של 2 ק"ג!', icon: '💪' },
    { id: 'goal', name: 'השגת את היעד!', description: 'כל הכבוד על הגעה למשקל היעד!', icon: '🏆' },
  ];

  const unlockedAchievements = useMemo(() => {
      const unlocked: Achievement[] = [];
      if (!userProfile.foodLog || !startingWeight) return [];
      
      // Check for 'start'
      if (userProfile.foodLog.length > 0) {
          unlocked.push(allAchievements.find(a => a.id === 'start')!);
      }
      // Check for 'streak3'
      if (streak >= 3) {
           unlocked.push(allAchievements.find(a => a.id === 'streak3')!);
      }
      // Check for 'lose2kg'
      const weightChange = startingWeight - userProfile.weight;
      if (userProfile.goal === Goal.Lose && weightChange >= 2) {
           unlocked.push(allAchievements.find(a => a.id === 'lose2kg')!);
      }
      // Check for 'goal'
      if ((userProfile.goal === Goal.Lose && userProfile.weight <= userProfile.targetWeight) ||
          (userProfile.goal === Goal.Gain && userProfile.weight >= userProfile.targetWeight)) {
           unlocked.push(allAchievements.find(a => a.id === 'goal')!);
      }
      // Return unique achievements
      return Array.from(new Set(unlocked.map(a => a.id))).map(id => unlocked.find(a => a.id === id)!);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userProfile, streak, startingWeight]);


  return (
    <div className="space-y-6 pb-20 sm:pb-6">
      <div className="flex justify-between items-center px-1">
          <motion.button 
            whileTap={{ scale: 0.9 }}
            onClick={() => handleDateChange('prev')} 
            className="p-3 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 transition shadow-sm active:shadow-inner"
          >
              <ChevronRight size={24} />
          </motion.button>
          
          <h2 className="text-xl sm:text-2xl font-bold text-slate-800 flex items-center gap-2 text-center">
            {formatDateDisplay(selectedDate)}
            {streak > 1 && isToday && (
              <motion.span 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                title={`רצף של ${streak} ימים`} 
                className="text-xs sm:text-base font-bold text-amber-500 bg-amber-100 px-2 py-0.5 rounded-full flex items-center gap-1"
              >
                <Flame size={14} className="sm:w-4 sm:h-4" /> {streak}
              </motion.span>
            )}
          </h2>
          
          <motion.button 
            whileTap={{ scale: 0.9 }}
            onClick={() => handleDateChange('next')} 
            className="p-3 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 transition shadow-sm active:shadow-inner"
          >
              <ChevronLeft size={24} />
          </motion.button>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="p-4 text-center">
              <p className="text-sm text-slate-500">BMI</p>
              <p className="text-3xl font-bold text-slate-800">{bmi.toFixed(1)}</p>
              <p className={`text-sm font-semibold ${bmiCategory.color}`}>{bmiCategory.text}</p>
          </Card>
          <Card className={`p-4 text-center ${userProfile.goal === Goal.Lose ? 'cursor-pointer hover:bg-slate-100 transition' : ''}`} onClick={() => userProfile.goal === Goal.Lose && setActiveModal('updateTimeline')}>
              <p className="text-sm text-slate-500">יעד קלורי</p>
              <p className="text-3xl font-bold text-slate-800">{dailyCalories.toLocaleString()}</p>
              <p className="text-sm text-slate-500">קלוריות</p>
          </Card>
           <Card className="p-4 text-center">
              <p className="text-sm text-slate-500">נצרך</p>
              <p className="text-3xl font-bold text-slate-800">{Math.round(consumed.calories).toLocaleString()}</p>
              <p className="text-sm text-slate-500">קלוריות</p>
          </Card>
          <Card className="p-4 text-center">
              <p className="text-sm text-slate-500">נותר</p>
              <p className="text-3xl font-bold text-primary-600">{Math.round(dailyCalories - consumed.calories).toLocaleString()}</p>
              <p className="text-sm text-slate-500">קלוריות</p>
          </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
            <Card>
                <div className="p-6">
                    <h3 className="text-xl font-bold text-slate-800 mb-4">סיכום יומי</h3>
                    <div className="relative h-4 bg-slate-200 rounded-full overflow-hidden mb-6">
                        <div className="absolute top-0 left-0 h-full bg-primary-500" style={{width: `${Math.min(100, (consumed.calories / dailyCalories) * 100)}%`}}></div>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-center">
                         <div>
                            <p className="font-semibold text-slate-600">חלבון</p>
                            <p className="text-lg font-bold text-slate-800">{Math.round(consumed.protein)}<span className="text-sm text-slate-500"> / {dailyProtein}g</span></p>
                        </div>
                        <div>
                            <p className="font-semibold text-slate-600">פחמימות</p>
                            <p className="text-lg font-bold text-slate-800">{Math.round(consumed.carbs)}<span className="text-sm text-slate-500"> / {dailyCarbs}g</span></p>
                        </div>
                        <div>
                            <p className="font-semibold text-slate-600">שומן</p>
                            <p className="text-lg font-bold text-slate-800">{Math.round(consumed.fat)}<span className="text-sm text-slate-500"> / {dailyFat}g</span></p>
                        </div>
                    </div>
                </div>
            </Card>

            <Card>
              <div className="p-6">
                  <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <History size={20} className="text-primary-500" /> היומן שלי
                  </h3>
                  {foodLogForSelectedDate.length > 0 ? (
                      <ul className="space-y-1">
                        <AnimatePresence mode="popLayout">
                          {foodLogForSelectedDate.map(item => (
                              <motion.li 
                                layout
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                key={item.id} 
                                className="group flex items-center gap-4 p-3 hover:bg-slate-50 transition-colors border-b border-slate-100 last:border-0"
                              >
                                  <div className="flex-grow">
                                      <p className="font-semibold text-slate-800">{item.name}</p>
                                      <p className="text-sm text-slate-500">
                                          {`${Math.round(item.calories)} קל' | ח': ${Math.round(item.protein)}ג, פ': ${Math.round(item.carbs)}ג, ש': ${Math.round(item.fat)}ג`}
                                      </p>
                                  </div>
                                  <div className="flex items-center shrink-0 gap-2 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                                      <motion.button 
                                        whileTap={{ scale: 0.9 }}
                                        onClick={() => { setEditingFoodItem(item); setActiveModal('editFoodItem'); }} 
                                        title="ערוך פריט" 
                                        className="p-2.5 text-slate-400 hover:text-primary-600 rounded-full hover:bg-primary-50 bg-slate-50 sm:bg-transparent"
                                      >
                                          <Edit2 size={18} />
                                      </motion.button>
                                      <motion.button 
                                        whileTap={{ scale: 0.9 }}
                                        onClick={() => handleDeleteItem(item.id)} 
                                        title="מחק פריט" 
                                        className="p-2.5 text-slate-400 hover:text-red-500 rounded-full hover:bg-red-50 bg-slate-50 sm:bg-transparent"
                                      >
                                          <Trash2 size={18} />
                                      </motion.button>
                                  </div>
                              </motion.li>
                          ))}
                        </AnimatePresence>
                      </ul>
                  ) : (
                      <div className="text-center text-slate-500 py-12">
                        <History size={48} className="mx-auto text-slate-300 mb-2 opacity-50" />
                        <p>היומן להיום ריק.</p>
                      </div>
                  )}
              </div>
          </Card>
        </div>
        
        <div className="space-y-6">
            <Card>
                <div className="p-6">
                    <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                      <Plus size={20} className="text-primary-500" /> הוספה ליומן
                    </h3>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
                        <motion.button 
                          whileTap={{ scale: 0.98 }}
                          onClick={() => setActiveModal('image')} 
                          className="flex items-center sm:flex-col justify-center gap-3 sm:gap-2 p-4 bg-primary-50 text-primary-700 rounded-xl hover:bg-primary-100 transition shadow-sm border border-primary-100"
                        >
                            <Camera size={24} />
                            <span className="font-bold">צילום מזון</span>
                        </motion.button>
                        <motion.button 
                          whileTap={{ scale: 0.98 }}
                          onClick={() => setActiveModal('manual')} 
                          className="flex items-center sm:flex-col justify-center gap-3 sm:gap-2 p-4 bg-slate-50 text-slate-700 rounded-xl hover:bg-slate-100 transition shadow-sm border border-slate-200"
                        >
                            <Edit2 size={24} />
                            <span className="font-bold">הזנה ידנית</span>
                        </motion.button>
                        <motion.button 
                          whileTap={{ scale: 0.98 }}
                          onClick={() => setActiveModal('fasting')} 
                          className="flex items-center sm:flex-col justify-center gap-3 sm:gap-2 p-4 bg-amber-50 text-amber-700 rounded-xl hover:bg-amber-100 transition shadow-sm border border-amber-200"
                        >
                            <Clock size={24} />
                            <span className="font-bold">דיווח צום</span>
                        </motion.button>
                    </div>
                </div>
            </Card>
            
            <Card>
              <div className="p-4">
                   <button onClick={() => setActiveModal('updateProfile')} className="w-full text-center p-3 text-primary-600 font-semibold hover:bg-slate-100 rounded-md transition">
                      עדכן פרופיל
                  </button>
              </div>
            </Card>
        </div>
      </div>
      
      <Card>
          <div className="p-6">
              <h3 className="text-xl font-bold text-slate-800 mb-6">מעקב התקדמות</h3>
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
                  
                  {/* Left side: stats and input */}
                  <div className="lg:col-span-2 space-y-6">
                      <div className="grid grid-cols-3 gap-2 sm:gap-4">
                          <div className="p-3 bg-slate-100 rounded-lg text-center">
                              <p className="text-xs sm:text-sm text-slate-500 mb-1">נוכחי</p>
                              <p className="text-lg sm:text-2xl font-bold text-slate-800">{userProfile.weight.toFixed(1)}</p>
                              <p className="text-xs sm:text-sm text-slate-500">ק״ג</p>
                          </div>
                          <div className="p-3 bg-primary-50 rounded-lg text-center">
                              <p className="text-xs sm:text-sm text-primary-700 mb-1">יעד</p>
                              <p className="text-lg sm:text-2xl font-bold text-primary-800">{userProfile.targetWeight.toFixed(1)}</p>
                              <p className="text-xs sm:text-sm text-primary-700">ק״ג</p>
                          </div>
                           <div className="p-3 bg-slate-100 rounded-lg text-center">
                              <p className="text-xs sm:text-sm text-slate-500 mb-1">התחלתי</p>
                              <p className="text-lg sm:text-2xl font-bold text-slate-800">{startingWeight.toFixed(1)}</p>
                              <p className="text-xs sm:text-sm text-slate-500">ק״ג</p>
                          </div>
                      </div>

                      {userProfile.goal !== Goal.Maintain && (
                          <div>
                              <div className="flex justify-between items-baseline mb-1">
                                  <span className="font-bold text-primary-600">התקדמות ליעד</span>
                                  <span className="text-sm font-medium text-slate-500">
                                    {weightToGo > 0 ? `${weightToGo.toFixed(1)} ק״ג נותרו` : 'השגת את היעד!'}
                                  </span>
                              </div>
                              <div className="h-4 bg-slate-200 rounded-full overflow-hidden" role="progressbar" aria-valuenow={progressPercentage} aria-valuemin="0" aria-valuemax="100">
                                  <div className="h-full bg-primary-500 rounded-full transition-all duration-500 ease-out" style={{ width: `${progressPercentage}%` }}></div>
                              </div>
                          </div>
                      )}
                      
                      <div className="text-center text-slate-600 font-medium">
                          {weightChange !== 0 ? (
                              <span>
                                  {weightChange > 0 ? `עליה של ${weightChange.toFixed(1)} ק״ג` : `ירידה של ${Math.abs(weightChange).toFixed(1)} ק״ג`} מההתחלה
                                  {weightChange * (userProfile.goal === Goal.Gain ? -1 : 1) < 0 ? ' 💪' : ' 🎉'}
                              </span>
                          ) : (
                              <span>בוא נתחיל את המסע! הזן את המשקל שלך.</span>
                          )}
                      </div>

                      <form onSubmit={handleWeightSubmit} className="space-y-3">
                          <label htmlFor="weight-input" className="font-semibold text-slate-700 block">
                              {isToday ? 'עדכן משקל יומי' : `הוסף משקל ל-${new Date(selectedDate).toLocaleDateString('he-IL')}`}
                          </label>
                          <div className="flex gap-2">
                              <input 
                                  id="weight-input"
                                  type="number" 
                                  step="any"
                                  inputMode="decimal"
                                  value={currentWeightInput}
                                  onChange={(e) => setCurrentWeightInput(e.target.value)}
                                  placeholder="ק״ג"
                                  className="flex-grow p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-lg outline-none transition-shadow h-12"
                              />
                              <motion.button 
                                whileTap={{ scale: 0.95 }}
                                type="submit" 
                                className="px-6 h-12 bg-primary-600 text-white font-bold rounded-xl hover:bg-primary-700 transition disabled:bg-slate-400 shadow-sm" 
                                disabled={!currentWeightInput}
                              >
                                שמור
                              </motion.button>
                          </div>
                      </form>
                      {weightSaved && (
                        <motion.p 
                          initial={{ opacity: 0, y: -10 }} 
                          animate={{ opacity: 1, y: 0 }} 
                          className="text-sm text-green-600 font-medium text-center mt-2 px-1"
                        >
                          נשמר בהצלחה!
                        </motion.p>
                      )}
                  </div>
                  
                  {/* Right side: chart */}
                  <div className="lg:col-span-3 min-h-[300px] w-full h-full">
                       {chartData.length > 1 ? (
                          <ResponsiveContainer width="100%" height={300}>
                              <LineChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                                  <CartesianGrid strokeDasharray="3 3" />
                                  <XAxis dataKey="date" tickFormatter={(dateStr) => new Date(dateStr).toLocaleDateString('he-IL', { day: '2-digit', month: '2-digit'})} />
                                  <YAxis yAxisId="left" stroke="#0284c7" label={{ value: 'משקל (ק"ג)', angle: -90, position: 'insideLeft', fill: '#0284c7' }} domain={['dataMin - 2', 'dataMax + 2']} allowDecimals={false} />
                                  <YAxis yAxisId="right" orientation="right" stroke="#16a34a" label={{ value: 'קלוריות', angle: -90, position: 'insideRight', fill: '#16a34a' }} domain={[0, 'dataMax + 500']} />
                                  <Tooltip formatter={(value, name) => [value, name === 'weight' ? 'משקל' : 'קלוריות']} labelFormatter={(label) => new Date(label).toLocaleDateString('he-IL')}/>
                                  <Legend wrapperStyle={{fontSize: '14px'}} />
                                  <ReferenceLine y={userProfile.targetWeight} yAxisId="left" label={{ value: 'יעד', position: 'insideTopLeft' }} stroke="#ef4444" strokeDasharray="3 3" />
                                  <Line connectNulls yAxisId="left" type="monotone" dataKey="weight" stroke="#0ea5e9" strokeWidth={3} name="משקל" dot={{ r: 4 }} activeDot={{ r: 6 }} />
                                  <Line connectNulls yAxisId="right" type="monotone" dataKey="calories" stroke="#22c55e" strokeWidth={2} name="קלוריות" />
                              </LineChart>
                          </ResponsiveContainer>
                       ) : (
                          <div className="flex flex-col items-center justify-center text-center text-slate-500 h-full">
                              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mx-auto text-slate-400 mb-2"><path d="M3 3v18h18"/><path d="M18.7 8a5 5 0 0 1-6.4 0l-6.3 6.3"/><path d="M12.3 14.7a5 5 0 0 1 6.4 0"/><path d="M12 18H3"/></svg>
                              <p>הזן נתונים כדי לראות את המגמות.</p>
                          </div>
                       )}
                  </div>
              </div>
          </div>
      </Card>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FastingTracker 
          fastingLog={userProfile.fastingLog || []} 
          onDelete={handleDeleteFasting}
          onAdd={() => setActiveModal('fasting')}
        />
        <MealPlanner />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <WeeklyInsights foodLog={userProfile.foodLog || []} />
        <Achievements all={allAchievements} unlocked={unlockedAchievements} />
      </div>

      <Card>
        <BmiChart bmi={bmi} />
      </Card>


      <ImageLogModal isOpen={activeModal === 'image'} onClose={() => setActiveModal(null)} onLog={handleLogItems} />
      <ManualLogModal isOpen={activeModal === 'manual'} onClose={() => setActiveModal(null)} onLog={handleLogItems} />
      <FastingLogModal isOpen={activeModal === 'fasting'} onClose={() => setActiveModal(null)} onLog={handleLogFasting} />
      <UpdateProfileModal isOpen={activeModal === 'updateProfile'} onClose={() => setActiveModal(null)} onUpdate={onUpdateProfile} userProfile={userProfile} />
      <UpdateGoalTimelineModal isOpen={activeModal === 'updateTimeline'} onClose={() => setActiveModal(null)} onUpdate={onUpdateProfile} userProfile={userProfile} />
      {editingFoodItem && <EditFoodItemModal isOpen={activeModal === 'editFoodItem'} onClose={() => { setEditingFoodItem(null); setActiveModal(null); }} onUpdate={handleUpdateItem} foodItem={editingFoodItem} />}
    </div>
  );
};

export default Dashboard;
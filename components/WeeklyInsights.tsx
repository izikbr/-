import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, BarChart3, RotateCw, AlertCircle } from 'lucide-react';
import { FoodItem } from '../types';
import Card from './common/Card';
import Spinner from './common/Spinner';
import { getWeeklyInsights } from '../services/apiService';
import dayjs from 'dayjs';

interface WeeklyInsightsProps {
    foodLog: FoodItem[];
}

const WeeklyInsights: React.FC<WeeklyInsightsProps> = ({ foodLog }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [insight, setInsight] = useState('');
    const [error, setError] = useState('');
    
    const handleGenerateInsights = async () => {
        setIsLoading(true);
        setError('');
        setInsight('');
        
        try {
            const oneWeekAgo = dayjs().subtract(7, 'day').startOf('day');
            const weeklyLog = foodLog.filter(item => dayjs(item.timestamp).isAfter(oneWeekAgo));
            
            if (weeklyLog.length < 5) { // Require at least a few entries
                setError('אין מספיק נתונים מהשבוע האחרון כדי להפיק תובנות. המשך לתעד!');
                setIsLoading(false);
                return;
            }

            const totalCalories = weeklyLog.reduce((sum, item) => sum + item.calories, 0);
            const totalProtein = weeklyLog.reduce((sum, item) => sum + item.protein, 0);
            const totalCarbs = weeklyLog.reduce((sum, item) => sum + item.carbs, 0);
            const totalFat = weeklyLog.reduce((sum, item) => sum + item.fat, 0);
            const daysWithLogs = new Set(weeklyLog.map(item => item.timestamp.split('T')[0])).size;

            const avgCalories = totalCalories / daysWithLogs;

            const summary = `
                - ימים מתועדים: ${daysWithLogs}
                - ממוצע קלוריות יומי: ${Math.round(avgCalories)}
                - סה"כ חלבון: ${Math.round(totalProtein)} גרם
                - סה"כ פחמימות: ${Math.round(totalCarbs)} גרם
                - סה"כ שומן: ${Math.round(totalFat)} גרם
            `;

            const result = await getWeeklyInsights(summary);
            setInsight(result);

        } catch (err) {
            setError(err instanceof Error ? err.message : 'אירעה שגיאה בהפקת התובנות. נסה שוב.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card>
            <div className="p-8">
                 <div className="flex items-center gap-3 mb-6">
                    <div className="p-2.5 bg-primary-100 rounded-xl text-primary-600">
                        <BarChart3 size={20} />
                    </div>
                    <h3 className="text-xl font-black text-slate-800">תובנות שבועיות (AI)</h3>
                 </div>

                 <AnimatePresence mode="wait">
                 {!insight && !isLoading && !error && (
                    <motion.div 
                        key="initial"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                    >
                        <p className="text-slate-500 mb-6 font-medium leading-relaxed">קבל סיכום חכם של הרגלי האכילה שלך בשבוע האחרון המעובד על ידי בינה מלאכותית.</p>
                        <motion.button 
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={handleGenerateInsights} 
                            className="w-full py-4 bg-primary-50 text-primary-700 font-bold rounded-2xl hover:bg-primary-100 transition-colors flex items-center justify-center gap-2"
                        >
                            <Sparkles size={20} />
                            הפק תובנות חכמות
                        </motion.button>
                    </motion.div>
                 )}

                 {isLoading && (
                    <motion.div 
                        key="loading"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex flex-col justify-center items-center py-12 gap-4"
                    >
                        <Spinner />
                        <p className="text-slate-400 font-bold animate-pulse">ה-AI מנתח את הנתונים שלך...</p>
                    </motion.div>
                 )}
                 
                 {(error || insight) && !isLoading && (
                     <motion.div 
                        key="result"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="space-y-6"
                     >
                        {error && (
                            <div className="bg-red-50 p-4 rounded-2xl border border-red-100 flex items-start gap-3">
                                <AlertCircle className="text-red-500 shrink-0" size={20} />
                                <p className="text-red-700 text-sm font-bold">{error}</p>
                            </div>
                        )}
                        {insight && (
                            <div 
                                className="prose prose-sm max-w-none text-slate-700 font-medium leading-relaxed bg-slate-50 p-6 rounded-2xl border border-slate-100 shadow-inner" 
                                dangerouslySetInnerHTML={{ __html: insight.replace(/\*\*(.*?)\*\*/g, '<strong class="font-black text-slate-900">$1</strong>').replace(/\n\s*\*\s/g, '<br/>• ').replace(/^\s*\*\s/g, '• ') }} 
                            />
                        )}
                         <motion.button 
                            whileTap={{ scale: 0.95 }}
                            onClick={handleGenerateInsights} 
                            className="flex items-center gap-2 text-sm font-black text-primary-600 hover:text-primary-700 transition-colors px-2"
                         >
                            <RotateCw size={16} /> הפק מחדש
                        </motion.button>
                    </motion.div>
                 )}
                 </AnimatePresence>
            </div>
        </Card>
    );
};
export default WeeklyInsights;

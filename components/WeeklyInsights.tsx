import React, { useState } from 'react';
import { GoogleGenAI } from '@google/genai';
import { FoodItem } from '../types';
import Card from './common/Card';
import Spinner from './common/Spinner';
import { getWeeklyInsights } from '../services/apiService';
import dayjs from 'dayjs';

interface WeeklyInsightsProps {
    ai: GoogleGenAI;
    foodLog: FoodItem[];
}

const WeeklyInsights: React.FC<WeeklyInsightsProps> = ({ ai, foodLog }) => {
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

            const result = await getWeeklyInsights(ai, summary);
            setInsight(result);

        } catch (err) {
            setError('אירעה שגיאה בהפקת התובנות. נסה שוב.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card>
            <div className="p-6">
                 <h3 className="text-xl font-bold text-slate-800 mb-4">תובנות שבועיות</h3>
                 {!insight && !isLoading && !error && (
                    <>
                        <p className="text-slate-500 mb-4">קבל סיכום חכם של הרגלי האכילה שלך בשבוע האחרון.</p>
                        <button onClick={handleGenerateInsights} className="w-full p-2 bg-primary-100 text-primary-700 font-semibold rounded-md hover:bg-primary-200 transition">
                            הפק תובנות
                        </button>
                    </>
                 )}

                 {isLoading && <div className="flex justify-center items-center py-8"><Spinner /></div>}
                 
                 {(error || insight) && (
                     <div>
                        {error && <p className="text-red-500 text-sm">{error}</p>}
                        {insight && (
                            <div className="prose prose-sm max-w-none text-slate-600 whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: insight.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n\s*\*\s/g, '<br/>• ').replace(/^\s*\*\s/g, '• ') }} />
                        )}
                         <button onClick={handleGenerateInsights} className="text-sm text-primary-600 hover:underline mt-4">
                            {isLoading ? 'מפיק...' : 'הפק מחדש'}
                        </button>
                    </div>
                 )}
            </div>
        </Card>
    );
};
export default WeeklyInsights;

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChefHat, Search, Sparkles, AlertCircle } from 'lucide-react';
import Card from './common/Card';
import Spinner from './common/Spinner';
import { getMealSuggestions } from '../services/apiService';

interface MealPlannerProps {
}

const MealPlanner: React.FC<MealPlannerProps> = () => {
    const [query, setQuery] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!query.trim()) return;

        setIsLoading(true);
        setError('');
        setResult('');

        try {
            const suggestions = await getMealSuggestions(query);
            setResult(suggestions);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'אירעה שגיאה בקבלת הצעות. נסה שוב.');
        } finally {
            setIsLoading(false);
        }
    };
    
    return (
        <Card>
            <div className="p-8">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2.5 bg-green-100 rounded-xl text-green-600">
                        <ChefHat size={20} />
                    </div>
                    <h3 className="text-xl font-black text-slate-800">תכנון ארוחות חכם</h3>
                </div>

                <p className="text-slate-500 mb-6 font-medium leading-relaxed">צריך רעיונות? ה-AI שלנו יעזור לך לבנות ארוחה מותאמת אישית. (למשל: "ארוחת ערב מהירה ודלת פחמימות")</p>
                
                <form onSubmit={handleSubmit} className="flex gap-3">
                    <div className="relative flex-grow">
                        <input 
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="מה בא לך לאכול?"
                            className="w-full h-14 pl-4 pr-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-primary-500 focus:bg-white outline-none transition-all font-bold text-slate-800"
                            disabled={isLoading}
                        />
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                             {/* icon placeholder or search icon if needed */}
                        </div>
                    </div>
                    <motion.button 
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        type="submit" 
                        className="h-14 px-8 bg-primary-600 text-white font-black rounded-2xl hover:bg-primary-700 transition disabled:bg-slate-300 shadow-lg shadow-primary-200 flex items-center justify-center gap-2" 
                        disabled={isLoading || !query.trim()}
                    >
                        {isLoading ? <Spinner /> : <><Search size={20} /> חפש</>}
                    </motion.button>
                </form>

                <AnimatePresence mode="wait">
                    {error && (
                        <motion.div 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="mt-6 bg-red-50 p-4 rounded-2xl border border-red-100 flex items-start gap-3"
                        >
                            <AlertCircle className="text-red-500 shrink-0" size={20} />
                            <p className="text-red-700 text-sm font-bold">{error}</p>
                        </motion.div>
                    )}

                    {result && !isLoading && (
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="mt-8 bg-slate-50 p-6 rounded-2xl border border-slate-100 shadow-inner relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 p-4 opacity-10">
                                <Sparkles size={60} />
                            </div>
                            <h4 className="font-black text-slate-800 mb-4 flex items-center gap-2">
                                <Sparkles size={18} className="text-primary-500" /> הנה כמה רעיונות בשבילך:
                            </h4>
                            <div className="prose prose-sm max-w-none text-slate-700 font-medium leading-relaxed" dangerouslySetInnerHTML={{ __html: result.replace(/\*\*(.*?)\*\*/g, '<strong class="font-black text-slate-900">$1</strong>').replace(/\n\s*\*\s/g, '<br/>• ').replace(/^\s*\*\s/g, '• ') }} />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </Card>
    );
};

export default MealPlanner;

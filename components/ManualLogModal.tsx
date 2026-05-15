import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Wand2, Check, ArrowRight, Plus } from 'lucide-react';
import { FoodItem } from '../types';
import Card from './common/Card';
import Spinner from './common/Spinner';
import { getNutritionInfoFromText } from '../services/apiService';

interface ManualLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLog: (items: Omit<FoodItem, 'id'>[]) => void;
}

const ManualLogModal: React.FC<ManualLogModalProps> = ({ isOpen, onClose, onLog }) => {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewItem, setPreviewItem] = useState<Omit<FoodItem, 'id'> | null>(null);

  const handleClose = () => {
    setQuery('');
    setError(null);
    setIsLoading(false);
    setPreviewItem(null);
    onClose();
  };

  const handleAnalyze = async () => {
    if (!query.trim()) {
      setError("אנא תאר את מה שאכלת.");
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const foodItem = await getNutritionInfoFromText(query);
      if (foodItem && (foodItem.calories > 0 || foodItem.name)) {
        setPreviewItem(foodItem);
      } else {
        setError("לא הצלחנו לקבל מידע תזונתי ברור. אנא נסה להיות ספציפי יותר (למשל: כמויות).");
      }
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "אירעה שגיאה בקבלת המידע התזונתי. אנא נסה שוב.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmLog = () => {
    if (previewItem) {
      onLog([previewItem]);
      handleClose();
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="w-full max-w-md"
        >
          <Card className="overflow-hidden">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                  <Plus size={20} className="text-primary-500" /> הוספה ידנית
                </h2>
                <motion.button 
                  whileTap={{ scale: 0.9 }}
                  onClick={handleClose} 
                  className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition"
                >
                  <X size={24} />
                </motion.button>
              </div>
              
              <div className="space-y-4">
                {!previewItem ? (
                  <>
                    <div className="space-y-1.5">
                      <label htmlFor="food-query" className="block text-sm font-bold text-slate-700 mb-2 px-1">מה אכלת היום?</label>
                      <textarea
                        id="food-query"
                        rows={4}
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="לדוגמה: 2 פרוסות לחם עם חביתה וגבינה..."
                        className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-primary-500 focus:bg-white outline-none text-lg transition-all font-medium placeholder:text-slate-400"
                      />
                    </div>
                    {error && (
                      <motion.div 
                        initial={{ opacity: 0, y: -10 }} 
                        animate={{ opacity: 1, y: 0 }} 
                        className="text-red-600 text-sm font-bold bg-red-50 p-3 border border-red-100 rounded-xl text-center"
                      >
                        {error}
                      </motion.div>
                    )}
                    <div className="pt-2 flex flex-col sm:flex-row gap-3">
                      <button 
                        type="button" 
                        onClick={handleClose} 
                        className="order-2 sm:order-1 flex-grow h-14 bg-slate-100 text-slate-700 font-bold rounded-2xl hover:bg-slate-200 transition"
                      >
                        ביטול
                      </button>
                      <motion.button
                        whileTap={{ scale: 0.98 }}
                        type="button"
                        onClick={handleAnalyze}
                        disabled={!query.trim() || isLoading}
                        className="order-1 sm:order-2 flex-grow h-14 bg-primary-600 text-white font-black rounded-2xl hover:bg-primary-700 transition disabled:bg-slate-300 flex items-center justify-center gap-2 shadow-lg shadow-primary-200"
                      >
                        {isLoading ? <Spinner /> : <><Wand2 size={20} /> נתח עם AI</>}
                      </motion.button>
                    </div>
                  </>
                ) : (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="space-y-6"
                  >
                    <div className="bg-primary-50 p-5 rounded-2xl border border-primary-100 shadow-inner">
                      <p className="text-xs text-primary-600 font-bold uppercase tracking-widest mb-2 flex items-center gap-1">
                        <Check size={14} /> ה-AI זיהה בהצלחה:
                      </p>
                      <p className="text-xl font-bold text-slate-800 mb-4">{previewItem.name}</p>
                      
                      <div className="grid grid-cols-2 gap-3 mt-4">
                        <div className="bg-white/80 backdrop-blur p-3 rounded-xl shadow-sm border border-white">
                          <p className="text-xs text-slate-500 mb-0.5">קלוריות</p>
                          <p className="text-lg font-bold text-slate-800">{Math.round(previewItem.calories)}</p>
                        </div>
                        <div className="bg-white/80 backdrop-blur p-3 rounded-xl shadow-sm border border-white">
                          <p className="text-xs text-slate-500 mb-0.5">חלבון</p>
                          <p className="text-lg font-bold text-slate-800">{Math.round(previewItem.protein)}<span className="text-sm font-normal">g</span></p>
                        </div>
                        <div className="bg-white/80 backdrop-blur p-3 rounded-xl shadow-sm border border-white">
                          <p className="text-xs text-slate-500 mb-0.5">פחמימות</p>
                          <p className="text-lg font-bold text-slate-800">{Math.round(previewItem.carbs)}<span className="text-sm font-normal">g</span></p>
                        </div>
                        <div className="bg-white/80 backdrop-blur p-3 rounded-xl shadow-sm border border-white">
                          <p className="text-xs text-slate-500 mb-0.5">שומן</p>
                          <p className="text-lg font-bold text-slate-800">{Math.round(previewItem.fat)}<span className="text-sm font-normal">g</span></p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row gap-3 pt-2">
                      <button 
                        type="button" 
                        onClick={() => setPreviewItem(null)} 
                        className="flex-grow h-12 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition flex items-center justify-center gap-2"
                      >
                        <ArrowRight size={18} className="scale-x-[-1]" /> ערוך טקסט
                      </button>
                      <motion.button
                        whileTap={{ scale: 0.98 }}
                        type="button"
                        onClick={handleConfirmLog}
                        className="flex-grow h-12 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 transition shadow-lg shadow-green-200 flex items-center justify-center gap-2"
                      >
                        <Check size={20} /> אשר והוסף
                      </motion.button>
                    </div>
                  </motion.div>
                )}
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ManualLogModal;
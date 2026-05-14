import React, { useState } from 'react';
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
      setError("אירעה שגיאה בקבלת המידע התזונתי. אנא נסה שוב.");
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-slate-800">הוספה ידנית</h2>
            <button onClick={handleClose} className="text-slate-500 hover:text-slate-800 text-2xl leading-none">&times;</button>
          </div>
          
          <div className="space-y-4">
            {!previewItem ? (
              <>
                <label htmlFor="food-query" className="block text-sm font-medium text-slate-600">מה אכלת?</label>
                <textarea
                  id="food-query"
                  rows={4}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="לדוגמה: 2 ביצים מקושקשות, פרוסת לחם מלא עם אבוקדו וסלט ירקות קטן בצד"
                  className="w-full p-2 border border-slate-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                />
                {error && <p className="text-red-500 text-sm">{error}</p>}
                <div className="mt-6 flex justify-end gap-3">
                  <button type="button" onClick={handleClose} className="px-6 py-2 bg-slate-200 text-slate-700 rounded-md hover:bg-slate-300 transition">ביטול</button>
                  <button
                    type="button"
                    onClick={handleAnalyze}
                    disabled={!query.trim() || isLoading}
                    className="px-6 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition disabled:bg-slate-400 flex items-center justify-center min-w-[120px]"
                  >
                    {isLoading ? <Spinner /> : 'נתח עם AI'}
                  </button>
                </div>
              </>
            ) : (
              <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="bg-primary-50 p-4 rounded-lg border border-primary-100 mb-6">
                  <p className="text-xs text-primary-600 font-bold uppercase tracking-wider mb-1">ה-AI זיהה:</p>
                  <p className="text-lg font-bold text-slate-800">{previewItem.name}</p>
                  <div className="grid grid-cols-2 gap-2 mt-3 text-sm">
                    <div className="bg-white p-2 rounded shadow-sm">
                      <span className="text-slate-500">קלוריות:</span> <span className="font-bold">{Math.round(previewItem.calories)}</span>
                    </div>
                    <div className="bg-white p-2 rounded shadow-sm">
                      <span className="text-slate-500">חלבון:</span> <span className="font-bold">{Math.round(previewItem.protein)}g</span>
                    </div>
                    <div className="bg-white p-2 rounded shadow-sm">
                      <span className="text-slate-500">פחמימות:</span> <span className="font-bold">{Math.round(previewItem.carbs)}g</span>
                    </div>
                    <div className="bg-white p-2 rounded shadow-sm">
                      <span className="text-slate-500">שומן:</span> <span className="font-bold">{Math.round(previewItem.fat)}g</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-between gap-3">
                  <button type="button" onClick={() => setPreviewItem(null)} className="flex-grow px-4 py-2 bg-slate-100 text-slate-600 rounded-md hover:bg-slate-200 transition">
                    ערוך טקסט
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmLog}
                    className="flex-grow px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition font-bold"
                  >
                    אשר והוסף
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ManualLogModal;
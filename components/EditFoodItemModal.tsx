import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Edit3, Save } from 'lucide-react';
import { FoodItem } from '../types';
import Card from './common/Card';

interface EditFoodItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (item: FoodItem) => void;
  foodItem: FoodItem | null;
}

const EditFoodItemModal: React.FC<EditFoodItemModalProps> = ({ isOpen, onClose, onUpdate, foodItem }) => {
  const [formData, setFormData] = useState<FoodItem | null>(null);

  useEffect(() => {
    if (foodItem) {
      setFormData(foodItem);
    }
  }, [foodItem]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (formData) {
        setFormData({
            ...formData,
            [name]: name === 'name' ? value : Number(value)
        });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData) {
      onUpdate(formData);
    }
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && formData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" 
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="w-full max-w-lg relative z-10"
          >
            <Card>
              <div className="p-8">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                    <Edit3 size={22} className="text-primary-500" /> עריכת פריט ביומן
                  </h2>
                  <button onClick={onClose} className="p-2 text-slate-400 rounded-full hover:bg-slate-100 transition-colors">
                    <X size={20} />
                  </button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">שם הפריט</label>
                    <input type="text" name="name" value={formData.name} onChange={handleChange} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-primary-500 focus:bg-white outline-none transition-all font-bold" required />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">קלוריות</label>
                      <input type="number" name="calories" value={formData.calories} onChange={handleChange} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-primary-500 focus:bg-white outline-none transition-all font-bold" required step="1" inputMode="numeric" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">חלבון (ג)</label>
                      <input type="number" name="protein" value={formData.protein} onChange={handleChange} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-primary-500 focus:bg-white outline-none transition-all font-bold" required step="any" inputMode="decimal" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">פחמימות (ג)</label>
                      <input type="number" name="carbs" value={formData.carbs} onChange={handleChange} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-primary-500 focus:bg-white outline-none transition-all font-bold" required step="any" inputMode="decimal" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">שומן (ג)</label>
                      <input type="number" name="fat" value={formData.fat} onChange={handleChange} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-primary-500 focus:bg-white outline-none transition-all font-bold" required step="any" inputMode="decimal" />
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button 
                        type="button" 
                        onClick={onClose} 
                        className="flex-1 py-4 bg-slate-100 text-slate-700 font-bold rounded-2xl hover:bg-slate-200 transition-colors"
                    >
                      ביטול
                    </button>
                    <motion.button 
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="submit" 
                        className="flex-[2] py-4 bg-primary-600 text-white font-black text-lg rounded-2xl hover:bg-primary-700 transition-shadow shadow-lg shadow-primary-200 flex items-center justify-center gap-2"
                    >
                      <Save size={20} />
                      שמור שינויים
                    </motion.button>
                  </div>
                </form>
              </div>
            </Card>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default EditFoodItemModal;

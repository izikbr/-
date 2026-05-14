
// FIX: Implemented the EditFoodItemModal to allow editing food log entries.
import React, { useState, useEffect } from 'react';
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

  if (!isOpen || !formData) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-lg">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-slate-800">עריכת פריט</h2>
            <button onClick={onClose} className="text-slate-500 hover:text-slate-800 text-2xl leading-none">&times;</button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">שם הפריט</label>
              <input type="text" name="name" value={formData.name} onChange={handleChange} className="w-full p-2 border border-slate-300 rounded-md" required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">קלוריות</label>
                <input type="number" name="calories" value={formData.calories} onChange={handleChange} className="w-full p-2 border border-slate-300 rounded-md" required step="1" inputMode="numeric" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">חלבון (ג)</label>
                <input type="number" name="protein" value={formData.protein} onChange={handleChange} className="w-full p-2 border border-slate-300 rounded-md" required step="any" inputMode="decimal" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">פחמימות (ג)</label>
                <input type="number" name="carbs" value={formData.carbs} onChange={handleChange} className="w-full p-2 border border-slate-300 rounded-md" required step="any" inputMode="decimal" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">שומן (ג)</label>
                <input type="number" name="fat" value={formData.fat} onChange={handleChange} className="w-full p-2 border border-slate-300 rounded-md" required step="any" inputMode="decimal" />
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button type="button" onClick={onClose} className="px-6 py-2 bg-slate-200 text-slate-700 rounded-md hover:bg-slate-300 transition">
                ביטול
              </button>
              <button type="submit" className="px-6 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition">
                שמור שינויים
              </button>
            </div>
          </form>
        </div>
      </Card>
    </div>
  );
};

export default EditFoodItemModal;

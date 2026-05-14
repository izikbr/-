
import React, { useState, useEffect } from 'react';
import { UserProfile, Goal } from '../types';
import Card from './common/Card';

interface UpdateGoalTimelineModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (updatedProfile: Partial<UserProfile>) => void;
  userProfile: UserProfile;
}

// FIX: Implemented a modal to update the weight loss timeline.
const UpdateGoalTimelineModal: React.FC<UpdateGoalTimelineModalProps> = ({ isOpen, onClose, onUpdate, userProfile }) => {
  const [weeks, setWeeks] = useState(userProfile.loseWeightWeeks || 4);

  useEffect(() => {
    if (isOpen) {
      setWeeks(userProfile.loseWeightWeeks || 4);
    }
  }, [userProfile, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate({ loseWeightWeeks: weeks });
    onClose();
  };

  if (!isOpen || userProfile.goal !== Goal.Lose) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-slate-800">עדכון ציר זמן ליעד</h2>
            <button onClick={onClose} className="text-slate-500 hover:text-slate-800 text-2xl leading-none">&times;</button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">בכמה שבועות תרצה להגיע למשקל היעד?</label>
              <input 
                type="number" 
                name="loseWeightWeeks" 
                value={weeks} 
                onChange={(e) => setWeeks(Number(e.target.value))} 
                className="w-full p-2 border border-slate-300 rounded-md focus:ring-primary-500 focus:border-primary-500" 
                required 
                min="1"
                step="1"
                inputMode="numeric"
              />
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button type="button" onClick={onClose} className="px-6 py-2 bg-slate-200 text-slate-700 rounded-md hover:bg-slate-300 transition">
                ביטול
              </button>
              <button type="submit" className="px-6 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition">
                עדכן ציר זמן
              </button>
            </div>
          </form>
        </div>
      </Card>
    </div>
  );
};

export default UpdateGoalTimelineModal;

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Calendar, Save } from 'lucide-react';
import { UserProfile, Goal } from '../types';
import Card from './common/Card';

interface UpdateGoalTimelineModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (updatedProfile: Partial<UserProfile>) => void;
  userProfile: UserProfile;
}

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

  return (
    <AnimatePresence>
      {isOpen && userProfile.goal === Goal.Lose && (
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
            className="w-full max-w-md relative z-10"
          >
            <Card>
              <div className="p-8">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                    <Calendar size={22} className="text-primary-500" /> עדכון יעד שבועות
                  </h2>
                  <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors">
                    <X size={20} />
                  </button>
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">בכמה שבועות תרצה להגיע למשקל היעד?</label>
                    <input 
                      type="number" 
                      name="loseWeightWeeks" 
                      value={weeks} 
                      onChange={(e) => setWeeks(Number(e.target.value))} 
                      className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-primary-500 focus:bg-white outline-none transition-all font-bold text-lg" 
                      required 
                      min="1"
                      step="1"
                      inputMode="numeric"
                    />
                    <p className="text-xs text-slate-500 mt-2 font-medium">יעד קצר יותר פירושו יעד קלורי נמוך יותר בכל יום.</p>
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

export default UpdateGoalTimelineModal;

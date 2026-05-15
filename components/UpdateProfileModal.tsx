
// FIX: Implemented the UpdateProfileModal component to resolve module and syntax errors.
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, User, Save, Camera, Target, Activity } from 'lucide-react';
import { UserProfile, Gender, ActivityLevel, Goal } from '../types';
import Card from './common/Card';

interface UpdateProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (updatedProfile: Partial<UserProfile>) => void;
  userProfile: UserProfile;
}

const UpdateProfileModal: React.FC<UpdateProfileModalProps> = ({ isOpen, onClose, onUpdate, userProfile }) => {
  const [formData, setFormData] = useState<Partial<UserProfile>>(userProfile);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setFormData(userProfile);
    }
  }, [userProfile, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const isNumericField = ['weight', 'targetWeight', 'loseWeightWeeks', 'height', 'age'].includes(name);
    setFormData(prev => ({ ...prev, [name]: isNumericField ? Number(value) : value }));
  };
  
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({...prev, avatar: reader.result as string}));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate(formData);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
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
            <Card className="max-h-[90vh] overflow-y-auto custom-scrollbar">
              <div className="p-8">
                <div className="flex justify-between items-center mb-8">
                  <h2 className="text-2xl font-black text-slate-800 flex items-center gap-2">
                    <User size={24} className="text-primary-600" /> עדכון פרופיל
                  </h2>
                  <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors">
                    <X size={20} />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                  <div className="flex items-center gap-6">
                      <input type="file" accept="image/*" ref={avatarInputRef} onChange={handleAvatarChange} className="hidden" />
                      <motion.div 
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="w-24 h-24 rounded-3xl bg-slate-50 flex-shrink-0 flex items-center justify-center overflow-hidden cursor-pointer border-4 border-white shadow-md relative group" 
                        onClick={() => avatarInputRef.current?.click()}
                      >
                          {formData.avatar ? (
                              <img src={formData.avatar} alt="Avatar Preview" className="w-full h-full object-cover" />
                          ) : (
                              <User size={40} className="text-slate-300" />
                          )}
                          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <Camera size={24} className="text-white" />
                          </div>
                      </motion.div>
                      <div className="flex-grow">
                          <label className="block text-sm font-bold text-slate-700 mb-2">שם / כינוי</label>
                          <input type="text" name="name" value={formData.name || ''} onChange={handleChange} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-primary-500 focus:bg-white outline-none transition-all font-bold" required />
                      </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">מין</label>
                        <select name="gender" value={formData.gender} onChange={handleChange} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-primary-500 focus:bg-white outline-none transition-all font-medium">
                          <option value={Gender.Male}>זכר</option>
                          <option value={Gender.Female}>נקבה</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">גיל</label>
                        <input type="number" name="age" value={formData.age || ''} onChange={handleChange} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-primary-500 focus:bg-white outline-none transition-all font-medium" required min="1" step="1" inputMode="numeric" />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">גובה (ס"מ)</label>
                        <input type="number" name="height" value={formData.height || ''} onChange={handleChange} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-primary-500 focus:bg-white outline-none transition-all font-medium" required min="1" step="any" inputMode="decimal" />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">משקל נוכחי (ק"ג)</label>
                        <input type="number" name="weight" value={formData.weight || ''} onChange={handleChange} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-primary-500 focus:bg-white outline-none transition-all font-medium" required min="1" step="any" inputMode="decimal" />
                      </div>
                  </div>

                  <div className="border-t border-slate-100 pt-8 mt-4">
                    <h3 className="font-black text-lg text-slate-800 mb-6 flex items-center gap-2">
                        <Target size={20} className="text-primary-500" /> יעדים ופעילות
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-bold text-slate-700 mb-2">משקל יעד (ק"ג)</label>
                          <input type="number" name="targetWeight" value={formData.targetWeight || ''} onChange={handleChange} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-primary-500 focus:bg-white outline-none transition-all font-medium" required min="1" step="any" inputMode="decimal" />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">המטרה שלי</label>
                            <select name="goal" value={formData.goal} onChange={handleChange} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-primary-500 focus:bg-white outline-none transition-all font-medium">
                                <option value={Goal.Lose}>ירידה במשקל</option>
                                <option value={Goal.Maintain}>שמירה על המשקל</option>
                                <option value={Goal.Gain}>עלייה במסה</option>
                            </select>
                        </div>
                    </div>
                    
                    <div className="mt-6">
                      <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                        <Activity size={18} className="text-primary-400" /> רמת פעילות גופנית
                      </label>
                      <select name="activityLevel" value={formData.activityLevel} onChange={handleChange} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-primary-500 focus:bg-white outline-none transition-all font-medium">
                        <option value={ActivityLevel.Low}>נמוכה (עבודה משרדית)</option>
                        <option value={ActivityLevel.Medium}>בינונית (1-3 אימונים בשבוע)</option>
                        <option value={ActivityLevel.High}>גבוהה (4-6 אימונים בשבוע)</option>
                      </select>
                    </div>

                    {formData.goal === Goal.Lose && (
                      <motion.div 
                        initial={{ height: 0, opacity: 0 }} 
                        animate={{ height: 'auto', opacity: 1 }} 
                        className="mt-6"
                      >
                        <label className="block text-sm font-bold text-slate-700 mb-2">בכמה שבועות תרצה להגיע למשקל היעד?</label>
                        <input type="number" name="loseWeightWeeks" value={formData.loseWeightWeeks || ''} onChange={handleChange} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-primary-500 focus:bg-white outline-none transition-all font-medium" required min="1" step="1" inputMode="numeric" />
                      </motion.div>
                    )}
                  </div>

                  <div className="pt-4 flex gap-4">
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

export default UpdateProfileModal;

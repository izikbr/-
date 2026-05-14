
// FIX: Implemented the UpdateProfileModal component to resolve module and syntax errors.
import React, { useState, useEffect, useRef } from 'react';
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-slate-800">עדכון פרופיל</h2>
            <button onClick={onClose} className="text-slate-500 hover:text-slate-800 text-2xl leading-none">&times;</button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">

            <div className="flex items-center gap-4">
                <input type="file" accept="image/*" ref={avatarInputRef} onChange={handleAvatarChange} className="hidden" />
                <div className="w-20 h-20 rounded-full bg-slate-200 flex-shrink-0 flex items-center justify-center overflow-hidden cursor-pointer" onClick={() => avatarInputRef.current?.click()}>
                    {formData.avatar ? (
                        <img src={formData.avatar} alt="Avatar Preview" className="w-full h-full object-cover" />
                    ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-500"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                    )}
                </div>
                <div className="flex-grow">
                    <label className="block text-sm font-medium text-slate-600 mb-1">שם / כינוי</label>
                    <input type="text" name="name" value={formData.name || ''} onChange={handleChange} className="w-full p-2 border border-slate-300 rounded-md focus:ring-primary-500 focus:border-primary-500" required />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">מין</label>
                  <select name="gender" value={formData.gender} onChange={handleChange} className="w-full p-2 border border-slate-300 rounded-md focus:ring-primary-500 focus:border-primary-500">
                    <option value={Gender.Male}>זכר</option>
                    <option value={Gender.Female}>נקבה</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">גיל</label>
                  <input type="number" name="age" value={formData.age || ''} onChange={handleChange} className="w-full p-2 border border-slate-300 rounded-md focus:ring-primary-500 focus:border-primary-500" required min="1" step="1" inputMode="numeric" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">גובה (ס"מ)</label>
                  <input type="number" name="height" value={formData.height || ''} onChange={handleChange} className="w-full p-2 border border-slate-300 rounded-md focus:ring-primary-500 focus:border-primary-500" required min="1" step="any" inputMode="decimal" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">משקל נוכחי (ק"ג)</label>
                  <input type="number" name="weight" value={formData.weight || ''} onChange={handleChange} className="w-full p-2 border border-slate-300 rounded-md focus:ring-primary-500 focus:border-primary-500" required min="1" step="any" inputMode="decimal" />
                </div>
            </div>

            <hr/>
            
            <h3 className="font-semibold text-lg text-slate-700 pt-2">יעדים</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">משקל יעד (ק"ג)</label>
                  <input type="number" name="targetWeight" value={formData.targetWeight || ''} onChange={handleChange} className="w-full p-2 border border-slate-300 rounded-md focus:ring-primary-500 focus:border-primary-500" required min="1" step="any" inputMode="decimal" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1">המטרה שלי</label>
                    <select name="goal" value={formData.goal} onChange={handleChange} className="w-full p-2 border border-slate-300 rounded-md focus:ring-primary-500 focus:border-primary-500">
                        <option value={Goal.Lose}>ירידה במשקל</option>
                        <option value={Goal.Maintain}>שמירה על המשקל</option>
                        <option value={Goal.Gain}>עלייה במסה</option>
                    </select>
                </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">רמת פעילות גופנית</label>
              <select name="activityLevel" value={formData.activityLevel} onChange={handleChange} className="w-full p-2 border border-slate-300 rounded-md focus:ring-primary-500 focus:border-primary-500">
                <option value={ActivityLevel.Low}>נמוכה (עבודה משרדית)</option>
                <option value={ActivityLevel.Medium}>בינונית (1-3 אימונים בשבוע)</option>
                <option value={ActivityLevel.High}>גבוהה (4-6 אימונים בשבוע)</option>
              </select>
            </div>

            {formData.goal === Goal.Lose && (
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">בכמה שבועות תרצה להגיע למשקל היעד?</label>
                <input type="number" name="loseWeightWeeks" value={formData.loseWeightWeeks || ''} onChange={handleChange} className="w-full p-2 border border-slate-300 rounded-md focus:ring-primary-500 focus:border-primary-500" required min="1" step="1" inputMode="numeric" />
              </div>
            )}
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

export default UpdateProfileModal;

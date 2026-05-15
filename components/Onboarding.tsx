import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { User, Ruler, Target, ChevronLeft, ChevronRight, Check, Camera } from 'lucide-react';
import { UserProfile, Gender, ActivityLevel, Goal } from '../types';
import Card from './common/Card';

interface OnboardingProps {
  onComplete: (profile: Omit<UserProfile, 'id'>) => void;
}

const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<Partial<Omit<UserProfile, 'id'>>>({
    gender: Gender.Male,
    activityLevel: ActivityLevel.Medium,
    goal: Goal.Maintain,
  });
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const isNumericField = ['age', 'height', 'weight', 'targetWeight', 'loseWeightWeeks'].includes(name);
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

  const nextStep = () => setStep(s => s + 1);
  const prevStep = () => setStep(s => s - 1);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onComplete(formData as Omit<UserProfile, 'id'>);
  };
  
  const stepIcons = [
    <User size={20} />,
    <Ruler size={20} />,
    <Target size={20} />
  ];

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <motion.div 
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="flex flex-col items-center gap-4 mb-6">
                <input type="file" accept="image/*" ref={avatarInputRef} onChange={handleAvatarChange} className="hidden" />
                <motion.div 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-24 h-24 rounded-3xl bg-slate-100 flex-shrink-0 flex items-center justify-center overflow-hidden cursor-pointer border-4 border-white shadow-md relative group" 
                  onClick={() => avatarInputRef.current?.click()}
                >
                    {formData.avatar ? (
                        <img src={formData.avatar} alt="Avatar Preview" className="w-full h-full object-cover" />
                    ) : (
                        <User size={40} className="text-slate-400" />
                    )}
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Camera size={24} className="text-white" />
                    </div>
                </motion.div>
                <p className="text-sm font-bold text-primary-600">הוסף תמונת פרופיל</p>
            </div>

            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">איך נקרא לך?</label>
                    <input type="text" name="name" placeholder="שם מלא או כינוי" value={formData.name || ''} onChange={handleChange} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-primary-500 focus:bg-white outline-none transition-all font-medium" required />
                </div>

                <div className="grid grid-cols-2 gap-4">
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
                </div>
            </div>
          </motion.div>
        );
      case 2:
        return (
          <motion.div 
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            <div className="bg-primary-50 p-4 rounded-2xl text-primary-800 text-sm font-medium mb-4">
                הנתונים האלו עוזרים לנו לחשב את שריפת הקלוריות היומית המדויקת שלך.
            </div>
            <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">גובה (ס"מ)</label>
            <input type="number" name="height" value={formData.height || ''} onChange={handleChange} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-primary-500 focus:bg-white outline-none transition-all font-medium" required min="1" step="any" inputMode="decimal" />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">משקל נוכחי (ק"ג)</label>
                    <input type="number" name="weight" value={formData.weight || ''} onChange={handleChange} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-primary-500 focus:bg-white outline-none transition-all font-medium" required min="1" step="any" inputMode="decimal" />
                </div>
                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">משקל יעד (ק"ג)</label>
                    <input type="number" name="targetWeight" value={formData.targetWeight || ''} onChange={handleChange} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-primary-500 focus:bg-white outline-none transition-all font-medium" required min="1" step="any" inputMode="decimal" />
                </div>
            </div>
          </motion.div>
        );
      case 3:
        return (
          <motion.div 
            key="step3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">רמת פעילות גופנית</label>
            <select name="activityLevel" value={formData.activityLevel} onChange={handleChange} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-primary-500 focus:bg-white outline-none transition-all font-medium">
                <option value={ActivityLevel.Low}>נמוכה (עורב משרדי, פחות מ-3,000 צעדים)</option>
                <option value={ActivityLevel.Medium}>בינונית (הליכות קבועות, 1-3 אימונים)</option>
                <option value={ActivityLevel.High}>גבוהה (פעיל במיוחד, 4-6 אימונים)</option>
            </select>
            </div>
            <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">המטרה שלי</label>
            <div className="grid grid-cols-1 gap-2">
                {[
                    { val: Goal.Lose, label: 'ירידה במשקל', icon: '📉' },
                    { val: Goal.Maintain, label: 'שמירה על המשקל', icon: '⚖️' },
                    { val: Goal.Gain, label: 'עלייה במסה', icon: '📈' }
                ].map(g => (
                    <button
                        key={g.val}
                        type="button"
                        onClick={() => setFormData(prev => ({...prev, goal: g.val}))}
                        className={`p-4 rounded-2xl border-2 text-right transition-all flex items-center justify-between ${formData.goal === g.val ? 'border-primary-500 bg-primary-50 text-primary-900 shadow-md' : 'border-slate-100 bg-slate-50 text-slate-600 hover:border-slate-200'}`}
                    >
                        <div className="flex items-center gap-3">
                            <span className="text-2xl">{g.icon}</span>
                            <span className="font-bold">{g.label}</span>
                        </div>
                        {formData.goal === g.val && <Check size={20} className="text-primary-600" />}
                    </button>
                ))}
            </div>
            </div>
            {formData.goal === Goal.Lose && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}>
                <label className="block text-sm font-bold text-slate-700 mb-2 mt-4">בכמה שבועות תרצה להגיע למשקל היעד?</label>
                <input type="number" name="loseWeightWeeks" value={formData.loseWeightWeeks || ''} onChange={handleChange} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-primary-500 focus:bg-white outline-none transition-all font-medium" required min="1" step="1" inputMode="numeric" />
            </motion.div>
            )}
          </motion.div>
        );
      default:
        return null;
    }
  };
  
  const totalSteps = 3;
  const progress = (step / totalSteps) * 100;

  return (
    <Card className="w-full max-w-lg mx-auto overflow-visible">
      <div className="p-8">
        <header className="text-center mb-8">
            <h1 className="text-3xl font-black text-slate-800 mb-2 tracking-tight">ברוכים הבאים</h1>
            <p className="text-slate-500 font-medium">בואו נבנה לכם תוכנית תזונה מותאמת אישית.</p>
        </header>
        
        <div className="flex justify-between items-center mb-8 relative">
            <div className="absolute top-1/2 left-0 right-0 h-1 bg-slate-100 -translate-y-1/2 z-0">
                <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${((step - 1) / (totalSteps - 1)) * 100}%` }}
                    className="h-full bg-primary-500" 
                />
            </div>
            {[1, 2, 3].map(s => (
                <div key={s} className="relative z-10">
                    <motion.div 
                        animate={{ 
                            scale: step === s ? 1.2 : 1,
                            backgroundColor: step >= s ? '#0ea5e9' : '#f1f5f9',
                            color: step >= s ? '#ffffff' : '#94a3b8'
                        }}
                        className="w-10 h-10 rounded-full flex items-center justify-center font-bold shadow-sm border-4 border-white"
                    >
                        {step > s ? <Check size={18} /> : stepIcons[s-1]}
                    </motion.div>
                </div>
            ))}
        </div>
        
        <form onSubmit={handleSubmit} className="min-h-[300px]">
          <AnimatePresence mode="wait">
            {renderStep()}
          </AnimatePresence>

          <div className="mt-12 flex gap-4">
            {step > 1 && (
              <button 
                type="button" 
                onClick={prevStep} 
                className="flex-[1] flex items-center justify-center gap-2 py-4 bg-slate-100 text-slate-700 font-bold rounded-2xl hover:bg-slate-200 transition-colors"
              >
                <ChevronRight size={20} />
                הקודם
              </button>
            )}
            {step < 3 ? (
              <button 
                type="button" 
                onClick={nextStep} 
                className="flex-[2] flex items-center justify-center gap-2 py-4 bg-primary-600 text-white font-bold rounded-2xl hover:bg-primary-700 transition-shadow shadow-lg shadow-primary-200"
              >
                הבא
                <ChevronLeft size={20} />
              </button>
            ) : (
              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit" 
                className="flex-[2] py-4 bg-primary-600 text-white font-black text-lg rounded-2xl hover:bg-primary-700 transition-shadow shadow-lg shadow-primary-200 flex items-center justify-center gap-2"
              >
                סיימתי, בואו נתחיל!
                <Check size={20} />
              </motion.button>
            )}
          </div>
        </form>
      </div>
    </Card>
  );
};

export default Onboarding;

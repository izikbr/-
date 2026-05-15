import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Clock, Save, History } from 'lucide-react';
import { FastingEntry } from '../types';
import { v4 as uuidv4 } from 'uuid';
import Card from './common/Card';

interface FastingLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLog: (entry: FastingEntry) => void;
}

const FastingLogModal: React.FC<FastingLogModalProps> = ({ isOpen, onClose, onLog }) => {
  const [startTime, setStartTime] = useState<string>('');
  const [endTime, setEndTime] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!startTime || !endTime) return;

    const entry: FastingEntry = {
      id: uuidv4(),
      startTime: new Date(startTime).toISOString(),
      endTime: new Date(endTime).toISOString(),
      type: 'intermittent',
    };

    onLog(entry);
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
            className="w-full max-w-md relative z-10"
          >
            <Card>
              <div className="p-8">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                    <Clock size={22} className="text-amber-500" /> דיווח צום לסירוגין
                  </h2>
                  <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors">
                    <X size={20} />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-4">
                    <div className="bg-amber-50 p-4 rounded-2xl border border-amber-100/50 flex items-start gap-3">
                        <div className="p-2 bg-white rounded-xl shadow-sm text-amber-500">
                            <History size={18} />
                        </div>
                        <p className="text-sm text-amber-800 font-medium leading-relaxed">
                            צום לסירוגין עוזר לשפר את הרגישות לאינסולין ולעודד ירידה במשקל.
                        </p>
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">תחילת הצום</label>
                      <input
                        type="datetime-local"
                        required
                        value={startTime}
                        onChange={(e) => setStartTime(e.target.value)}
                        className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-primary-500 focus:bg-white outline-none transition-all font-medium"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">סיום הצום</label>
                      <input
                        type="datetime-local"
                        required
                        value={endTime}
                        onChange={(e) => setEndTime(e.target.value)}
                        className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-primary-500 focus:bg-white outline-none transition-all font-medium"
                      />
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
                      שמור צום
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

export default FastingLogModal;

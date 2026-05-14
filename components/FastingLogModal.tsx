import React, { useState } from 'react';
import { FastingEntry } from '../types';
import { v4 as uuidv4 } from 'uuid';

interface FastingLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLog: (entry: FastingEntry) => void;
}

const FastingLogModal: React.FC<FastingLogModalProps> = ({ isOpen, onClose, onLog }) => {
  const [startTime, setStartTime] = useState<string>('');
  const [endTime, setEndTime] = useState<string>('');

  if (!isOpen) return null;

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden" dir="rtl">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <h3 className="text-xl font-bold text-slate-800">דיווח צום לסירוגין</h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-500 transition">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">תחילת הצום</label>
            <input
              type="datetime-local"
              required
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="w-full p-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">סיום הצום</label>
            <input
              type="datetime-local"
              required
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="w-full p-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-3 bg-primary-600 text-white font-bold rounded-lg hover:bg-primary-700 transition shadow-lg shadow-primary-200"
            >
              שמור צום
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FastingLogModal;

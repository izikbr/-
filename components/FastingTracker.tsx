import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Clock, Plus, Trash2, History } from 'lucide-react';
import { FastingEntry } from '../types';
import Card from './common/Card';
import dayjs from 'dayjs';

interface FastingTrackerProps {
  fastingLog: FastingEntry[];
  onDelete: (id: string) => void;
  onAdd: () => void;
}

const FastingTracker: React.FC<FastingTrackerProps> = ({ fastingLog, onDelete, onAdd }) => {
  const sortedLog = [...fastingLog].sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());

  const calculateDuration = (start: string, end: string) => {
    const s = dayjs(start);
    const e = dayjs(end);
    const diffHours = e.diff(s, 'hour');
    const diffMinutes = e.diff(s, 'minute') % 60;
    return `${diffHours} שעות ו-${diffMinutes} דקות`;
  };

  return (
    <Card className="flex flex-col h-full overflow-hidden">
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Clock size={22} className="text-amber-500" /> צום לסירוגין
          </h3>
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onAdd}
            className="flex items-center gap-1.5 text-sm bg-primary-50 text-primary-700 px-4 py-2 rounded-full font-bold hover:bg-primary-100 transition shadow-sm border border-primary-100"
          >
            <Plus size={16} /> דווח צום
          </motion.button>
        </div>

        {sortedLog.length > 0 ? (
          <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1 custom-scrollbar">
            <AnimatePresence mode="popLayout">
              {sortedLog.map((entry) => (
                <motion.div 
                  layout
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  key={entry.id} 
                  className="p-4 border border-slate-100 rounded-2xl bg-slate-50 relative group hover:bg-white hover:shadow-md transition-all"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-bold text-slate-700">
                        {dayjs(entry.startTime).format('DD/MM/YYYY')}
                      </p>
                      <p className="text-xs text-slate-500 font-medium">
                        {dayjs(entry.startTime).format('HH:mm')} - {dayjs(entry.endTime).format('HH:mm')}
                      </p>
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-black text-amber-600">
                        {calculateDuration(entry.startTime, entry.endTime)}
                      </p>
                    </div>
                  </div>
                  <motion.button 
                    whileTap={{ scale: 0.8 }}
                    onClick={() => onDelete(entry.id)}
                    className="absolute -top-1 -left-1 bg-white text-red-500 p-2 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity border border-red-50"
                    title="מחק"
                  >
                    <Trash2 size={14} />
                  </motion.button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <div className="text-center py-12 text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
            <History size={48} className="mx-auto mb-3 opacity-20" />
            <p className="text-sm font-medium">טרם נרשמו צומות.</p>
          </div>
        )}
      </div>
    </Card>
  );
};

export default FastingTracker;

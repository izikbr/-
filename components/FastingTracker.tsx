import React from 'react';
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
    <Card className="flex flex-col h-full">
      <div className="p-6 flex-grow">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-slate-800">צום לסירוגין</h3>
          <button 
            onClick={onAdd}
            className="text-sm bg-primary-50 text-primary-600 px-3 py-1.5 rounded-full font-semibold hover:bg-primary-100 transition"
          >
            + דווח צום
          </button>
        </div>

        {sortedLog.length > 0 ? (
          <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
            {sortedLog.map((entry) => (
              <div key={entry.id} className="p-3 border border-slate-100 rounded-lg bg-slate-50 relative group">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-bold text-slate-700">
                      {dayjs(entry.startTime).format('DD/MM/YYYY')}
                    </p>
                    <p className="text-xs text-slate-500">
                      {dayjs(entry.startTime).format('HH:mm')} - {dayjs(entry.endTime).format('HH:mm')}
                    </p>
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-semibold text-primary-600">
                      {calculateDuration(entry.startTime, entry.endTime)}
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => onDelete(entry.id)}
                  className="absolute -top-2 -left-2 bg-white text-red-500 p-1 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                  title="מחק"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-slate-500">
            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-2 opacity-30"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
            <p className="text-sm">טרם נרשמו צומות.</p>
          </div>
        )}
      </div>
    </Card>
  );
};

export default FastingTracker;

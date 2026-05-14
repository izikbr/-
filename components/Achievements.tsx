import React from 'react';
import { Achievement } from '../types';
import Card from './common/Card';

interface AchievementsProps {
  unlocked: Achievement[];
  all: Achievement[];
}

const Achievements: React.FC<AchievementsProps> = ({ unlocked, all }) => {
    const unlockedIds = new Set(unlocked.map(a => a.id));

    return (
        <Card>
            <div className="p-6">
                <h3 className="text-xl font-bold text-slate-800 mb-4">ההישגים שלי</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {all.map(ach => (
                        <div 
                            key={ach.id} 
                            className={`p-4 rounded-lg text-center transition-all duration-300 ${unlockedIds.has(ach.id) ? 'bg-amber-100 border border-amber-300' : 'bg-slate-100'}`}
                            title={ach.description}
                        >
                            <span className={`text-3xl ${!unlockedIds.has(ach.id) ? 'filter grayscale opacity-30' : ''}`} role="img" aria-label={ach.name}>{ach.icon}</span>
                            <p className={`mt-2 font-semibold text-sm ${unlockedIds.has(ach.id) ? 'text-amber-800' : 'text-slate-500'}`}>{ach.name}</p>
                        </div>
                    ))}
                </div>
            </div>
        </Card>
    );
};

export default Achievements;

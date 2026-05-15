import React from 'react';
import { motion } from 'motion/react';
import { Achievement } from '../types';
import Card from './common/Card';
import { Trophy } from 'lucide-react';

interface AchievementsProps {
  unlocked: Achievement[];
  all: Achievement[];
}

const Achievements: React.FC<AchievementsProps> = ({ unlocked, all }) => {
    const unlockedIds = new Set(unlocked.map(a => a.id));

    return (
        <Card className="h-full">
            <div className="p-6">
                <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                    <Trophy size={20} className="text-amber-500" /> ההישגים שלי
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {all.map((ach, idx) => {
                        const isUnlocked = unlockedIds.has(ach.id);
                        return (
                            <motion.div 
                                initial={{ opacity: 0, scale: 0.8 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.1 }}
                                whileHover={isUnlocked ? { y: -5, scale: 1.05 } : {}}
                                key={ach.id} 
                                className={`p-4 rounded-2xl text-center transition-shadow relative overflow-hidden group ${isUnlocked ? 'bg-amber-50 border border-amber-200 shadow-sm' : 'bg-slate-50 border border-slate-100'}`}
                                title={ach.description}
                            >
                                {isUnlocked && (
                                    <motion.div 
                                        initial={{ rotate: -45, x: -20, y: -20 }}
                                        animate={{ rotate: -45, x: -10, y: -10 }}
                                        className="absolute top-0 left-0 w-8 h-8 bg-amber-400 opacity-20"
                                    />
                                )}
                                <span className={`text-4xl block mb-2 transition-all ${!isUnlocked ? 'filter grayscale opacity-30 scale-90' : 'group-hover:scale-110'}`} role="img" aria-label={ach.name}>{ach.icon}</span>
                                <p className={`font-bold text-sm leading-tight ${isUnlocked ? 'text-amber-900' : 'text-slate-400'}`}>{ach.name}</p>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </Card>
    );
};

export default Achievements;

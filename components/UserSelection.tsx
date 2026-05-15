import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { User, Trash2, Plus, Users } from 'lucide-react';
import { UserProfile } from '../types';
import Card from './common/Card';

interface UserSelectionProps {
  profiles: UserProfile[];
  onSelectProfile: (id: string) => void;
  onDeleteProfile: (id: string) => void;
  onNewProfile: () => void;
}

const UserSelection: React.FC<UserSelectionProps> = ({ profiles, onSelectProfile, onDeleteProfile, onNewProfile }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-md mx-auto"
    >
      <Card className="overflow-visible">
        <div className="p-8 text-center">
            <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 260, damping: 20 }}
                className="w-20 h-20 bg-primary-100 text-primary-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-sm"
            >
                <Users size={40} strokeWidth={1.5} />
            </motion.div>
          <h2 className="text-3xl font-black text-slate-800 mb-2 tracking-tight">קלוריק</h2>
          <p className="text-slate-500 mb-8 font-medium">
            {profiles.length > 0 ? 'בחר פרופיל כדי להתחיל' : 'צור פרופיל חדש כדי להתחיל'}
          </p>

          {profiles.length > 0 && (
            <ul className="space-y-3 text-start mb-8">
                <AnimatePresence mode="popLayout">
                    {profiles.map((profile, idx) => (
                      <motion.li 
                        layout
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ delay: idx * 0.1 }}
                        key={profile.id} 
                        className="group flex items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-2xl hover:bg-white hover:border-primary-200 hover:shadow-md transition-all cursor-pointer" 
                        onClick={() => onSelectProfile(profile.id)}
                      >
                        <div className="flex items-center gap-4 flex-grow">
                            {profile.avatar ? (
                                <img src={profile.avatar} alt={profile.name} className="w-12 h-12 rounded-2xl object-cover ring-2 ring-white shadow-sm" />
                            ) : (
                                <div className="w-12 h-12 rounded-2xl bg-primary-100 flex items-center justify-center text-primary-600 ring-2 ring-white shadow-sm">
                                    <User size={24} />
                                </div>
                            )}
                          <span className="font-bold text-lg text-slate-800 group-hover:text-primary-700">{profile.name}</span>
                        </div>
                        <motion.button
                          whileTap={{ scale: 0.8 }}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (window.confirm(`האם אתה בטוח שברצונך למחוק את הפרופיל "${profile.name}"?`)) {
                                onDeleteProfile(profile.id);
                            }
                          }}
                          className="text-slate-300 hover:text-red-500 sm:opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-red-50 rounded-full"
                          title="מחק פרופיל"
                        >
                           <Trash2 size={20} />
                        </motion.button>
                      </motion.li>
                    ))}
                </AnimatePresence>
            </ul>
          )}
          
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onNewProfile}
            className="w-full py-4 bg-primary-600 text-white rounded-2xl hover:bg-primary-700 transition font-black text-lg flex items-center justify-center gap-2 shadow-lg shadow-primary-200"
          >
            <Plus size={20} />
            <span>{profiles.length > 0 ? 'הוסף פרופיל חדש' : 'צור משתמש ראשון'}</span>
          </motion.button>
        </div>
      </Card>
    </motion.div>
  );
};

export default UserSelection;
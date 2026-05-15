import React from 'react';
import { motion } from 'motion/react';
import { Users, User as UserIcon } from 'lucide-react';
import { UserProfile } from '../types';

interface HeaderProps {
  userProfile: UserProfile | null;
  onLogout: () => void;
}

const Logo: React.FC = () => (
    <motion.div 
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className="flex items-baseline gap-1"
    >
      <h1 className="text-3xl font-black text-primary-600 tracking-tighter">קלוריק</h1>
      <div className="w-1.5 h-1.5 rounded-full bg-primary-400"></div>
    </motion.div>
);


const Header: React.FC<HeaderProps> = ({ userProfile, onLogout }) => {
  return (
    <header className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-40 border-b border-slate-100">
      <div className="max-w-4xl mx-auto p-4 py-3 flex justify-between items-center">
        <Logo />
        {userProfile && (
          <div className="flex items-center gap-3">
            <motion.div 
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className="flex items-center gap-2 bg-slate-50 p-1 pr-3 rounded-full border border-slate-100"
            >
                <span className="text-sm font-bold text-slate-700 hidden sm:inline">{userProfile.name}</span>
                {userProfile.avatar ? (
                    <img src={userProfile.avatar} alt={userProfile.name} className="w-8 h-8 rounded-full object-cover shadow-sm border border-white" />
                ) : (
                    <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-600">
                        <UserIcon size={18} />
                    </div>
                )}
            </motion.div>
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={onLogout}
              className="p-2 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-full transition-all"
              title="חזור לבחירת משתמש"
            >
              <Users size={22} />
            </motion.button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
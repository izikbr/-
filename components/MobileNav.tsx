import React from 'react';
import { motion } from 'motion/react';
import { Home, Camera, PlusCircle, TrendingUp, User } from 'lucide-react';

interface MobileNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onAction: (action: 'image' | 'manual') => void;
}

const MobileNav: React.FC<MobileNavProps> = ({ activeTab, onTabChange, onAction }) => {
  return (
    <div className="sm:hidden fixed bottom-6 left-6 right-6 bg-white border border-slate-100 px-6 py-2 pb-safe z-40 flex justify-between items-center h-20 rounded-3xl shadow-[0_10px_30px_rgba(0,0,0,0.1)] border-white/20 backdrop-blur-md">
      <button 
        onClick={() => onTabChange('dashboard')}
        className={`flex flex-col items-center gap-1 transition-colors ${activeTab === 'dashboard' ? 'text-primary-600' : 'text-slate-400'}`}
      >
        <Home size={22} />
        <span className="text-[10px] font-black">בית</span>
      </button>

      <button 
        onClick={() => onTabChange('progress')}
        className={`flex flex-col items-center gap-1 transition-colors ${activeTab === 'progress' ? 'text-primary-600' : 'text-slate-400'}`}
      >
        <TrendingUp size={22} />
        <span className="text-[10px] font-black">מעקב</span>
      </button>

      <div className="relative -mt-12">
        <motion.button 
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => onAction('manual')}
          className="bg-primary-600 text-white w-16 h-16 rounded-3xl shadow-xl shadow-primary-200 flex items-center justify-center border-4 border-white"
        >
          <PlusCircle size={32} />
        </motion.button>
      </div>

      <button 
        onClick={() => onAction('image')}
        className="flex flex-col items-center gap-1 text-slate-400 transition-colors hover:text-primary-500"
      >
        <Camera size={22} />
        <span className="text-[10px] font-black">צילום</span>
      </button>

      <button 
        onClick={() => onTabChange('profile')}
        className={`flex flex-col items-center gap-1 transition-colors ${activeTab === 'profile' ? 'text-primary-600' : 'text-slate-400'}`}
      >
        <User size={22} />
        <span className="text-[10px] font-black">אני</span>
      </button>
    </div>
  );
};

export default MobileNav;

import React from 'react';
import { UserProfile } from '../types';

interface HeaderProps {
  userProfile: UserProfile | null;
  onLogout: () => void;
}

const Logo: React.FC = () => (
    <h1 className="text-3xl font-bold text-primary-600">קלוריק</h1>
);


const Header: React.FC<HeaderProps> = ({ userProfile, onLogout }) => {
  return (
    <header className="bg-white shadow-sm sticky top-0 z-10">
      <div className="max-w-4xl mx-auto p-4 flex justify-between items-center">
        <Logo />
        {userProfile && (
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
                <span className="text-slate-600 hidden sm:inline">שלום, {userProfile.name}</span>
                {userProfile.avatar ? (
                    <img src={userProfile.avatar} alt={userProfile.name} className="w-8 h-8 rounded-full object-cover" />
                ) : (
                    <span className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-500"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                    </span>
                )}
            </div>
            <button
              onClick={onLogout}
              className="text-sm text-slate-500 hover:text-primary-600 transition-colors"
              title="חזור לבחירת משתמש"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-users"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
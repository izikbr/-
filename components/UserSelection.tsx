import React from 'react';
import { UserProfile } from '../types';
import Card from './common/Card';

interface UserSelectionProps {
  profiles: UserProfile[];
  onSelectProfile: (id: string) => void;
  onDeleteProfile: (id: string) => void;
  onNewProfile: () => void;
}

// FIX: Implemented the UserSelection component to allow choosing or creating a profile.
const UserSelection: React.FC<UserSelectionProps> = ({ profiles, onSelectProfile, onDeleteProfile, onNewProfile }) => {
  return (
    <Card>
      <div className="p-6 text-center">
        <h2 className="text-2xl font-bold text-slate-800 mb-2">בחירת פרופיל</h2>
        <p className="text-slate-500 mb-8">
          {profiles.length > 0 ? 'בחר פרופיל קיים או צור פרופיל חדש.' : 'לא נמצאו פרופילים. צור פרופיל חדש כדי להתחיל.'}
        </p>

        {profiles.length > 0 && (
          <ul className="space-y-3 text-start mb-6">
            {profiles.map(profile => (
              <li key={profile.id} className="group flex items-center justify-between p-3 bg-slate-100 rounded-lg hover:bg-primary-100 transition-colors cursor-pointer" onClick={() => onSelectProfile(profile.id)}>
                <div className="flex items-center gap-4 flex-grow">
                    {profile.avatar ? (
                        <img src={profile.avatar} alt={profile.name} className="w-12 h-12 rounded-full object-cover" />
                    ) : (
                        <span className="w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-500"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                        </span>
                    )}
                  <span className="font-semibold text-lg text-slate-700 group-hover:text-primary-700">{profile.name}</span>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteProfile(profile.id);
                  }}
                  className="text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-2 -mr-2"
                  title="מחק פרופיל"
                >
                   <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                </button>
              </li>
            ))}
          </ul>
        )}
        
        <button
          onClick={onNewProfile}
          className="w-full p-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition font-semibold text-lg"
        >
          {profiles.length > 0 ? 'צור פרופיל חדש' : 'צור פרופיל ראשון'}
        </button>
      </div>
    </Card>
  );
};

export default UserSelection;
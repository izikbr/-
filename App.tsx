import React, { useState, useMemo, useEffect } from 'react';
import { GoogleGenAI } from '@google/genai';
import { UserProfile, FoodItem, WeightEntry, FastingEntry } from './types';
import useLocalStorage from './hooks/useLocalStorage';
import { v4 as uuidv4 } from 'uuid';

import Header from './components/Header';
import Footer from './components/common/Footer';
import UserSelection from './components/UserSelection';
import Onboarding from './components/Onboarding';
import Dashboard from './components/Dashboard';

const App: React.FC = () => {
  const [allProfiles, setAllProfiles] = useLocalStorage<UserProfile[]>('calorific-profiles', []);
  const [activeProfileId, setActiveProfileId] = useLocalStorage<string | null>('calorific-active-profile-id', null);
  const [appState, setAppState] = useState<'LOADING' | 'SELECT_PROFILE' | 'ONBOARDING' | 'DASHBOARD' | 'ERROR'>('LOADING');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [ai, setAi] = useState<GoogleGenAI | null>(null);

  useEffect(() => {
    // Initialize AI client safely
    try {
      const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;
      if (!apiKey) {
        throw new Error("מפתח ה-API של Gemini אינו מוגדר. אנא וודא שהגדרת את ה-GEMINI_API_KEY בהגדרות.");
      }
      const genAI = new GoogleGenAI({ apiKey });
      setAi(genAI);
      setAppState('LOADING');
    } catch (error) {
      console.error("Error initializing GoogleGenAI:", error);
      setErrorMessage(error instanceof Error ? error.message : "אירעה שגיאה באתחול שירות ה-AI.");
      setAppState('ERROR');
    }
  }, []);

  const activeProfile = useMemo(() => {
    return allProfiles.find(p => p.id === activeProfileId) || null;
  }, [allProfiles, activeProfileId]);

  useEffect(() => {
    if (appState === 'ERROR' || !ai) {
      return; // Don't change state if there's an error or AI is not ready
    }

    if (activeProfile) {
      setAppState('DASHBOARD');
    } else if (appState !== 'ONBOARDING') { // Don't interrupt onboarding
      setAppState('SELECT_PROFILE');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ai, activeProfile]);


  const handleSelectProfile = (id: string) => {
    setActiveProfileId(id);
  };

  const handleLogout = () => {
    setActiveProfileId(null);
    setAppState('SELECT_PROFILE');
  };

  const handleNewProfile = () => {
    setAppState('ONBOARDING');
  };

  const handleDeleteProfile = (id: string) => {
    if (window.confirm('האם אתה בטוח שברצונך למחוק פרופיל זה? לא ניתן לשחזר פעולה זו.')) {
        setAllProfiles(prev => prev.filter(p => p.id !== id));
        if (activeProfileId === id) {
            setActiveProfileId(null);
        }
    }
  };

  const handleOnboardingComplete = (profileData: Omit<UserProfile, 'id'>) => {
    const newProfile: UserProfile = {
      ...profileData,
      id: uuidv4(),
      foodLog: [],
      weightLog: [{ date: new Date().toISOString().split('T')[0], weight: profileData.weight }],
    };
    setAllProfiles(prev => [...prev, newProfile]);
    setActiveProfileId(newProfile.id);
    setAppState('DASHBOARD');
  };

  const handleProfileUpdate = (updatedData: Partial<UserProfile>) => {
    setAllProfiles(prev => prev.map(p => {
      if (p.id === activeProfileId) {
        return { ...p, ...updatedData };
      }
      return p;
    }));
  };

  const handleFoodLogUpdate = (newFoodLog: FoodItem[]) => {
      handleProfileUpdate({ foodLog: newFoodLog });
  };

  const handleFastingLogUpdate = (newFastingLog: FastingEntry[]) => {
    handleProfileUpdate({ fastingLog: newFastingLog });
  };
  
  const handleAddWeight = (date: string, weight: number) => {
    const currentProfile = allProfiles.find(p => p.id === activeProfileId);
    if (!currentProfile) return;

    const newLogEntry: WeightEntry = { date, weight };
    let updatedWeightLog = [...(currentProfile.weightLog || [])];
    
    const existingLogIndex = updatedWeightLog.findIndex(log => log.date === date);

    if (existingLogIndex !== -1) {
      updatedWeightLog[existingLogIndex] = newLogEntry;
    } else {
      updatedWeightLog.push(newLogEntry);
    }

    updatedWeightLog.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // Also update the main profile weight if it's for today
    const today = new Date().toISOString().split('T')[0];
    const newProfileData: Partial<UserProfile> = { weightLog: updatedWeightLog };
    if (date === today) {
      newProfileData.weight = weight;
    }

    handleProfileUpdate(newProfileData);
  };

  const renderContent = () => {
    switch (appState) {
      case 'ERROR':
        return (
            <div className="text-center p-10">
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg" role="alert">
                    <strong className="font-bold">שגיאת תצורה!</strong>
                    <span className="block sm:inline ml-2">{errorMessage}</span>
                </div>
            </div>
        );
      case 'SELECT_PROFILE':
        return <UserSelection profiles={allProfiles} onSelectProfile={handleSelectProfile} onDeleteProfile={handleDeleteProfile} onNewProfile={handleNewProfile} />;
      case 'ONBOARDING':
        return <Onboarding onComplete={handleOnboardingComplete} />;
      case 'DASHBOARD':
        if (activeProfile && ai) {
          return <Dashboard 
            userProfile={activeProfile} 
            onUpdateProfile={handleProfileUpdate} 
            onUpdateFoodLog={handleFoodLogUpdate} 
            onUpdateFastingLog={handleFastingLogUpdate}
            onAddWeight={handleAddWeight}
            ai={ai}
          />;
        }
        // Fallback if state is out of sync
        handleLogout();
        return null;
      case 'LOADING':
      default:
        return <div className="text-center p-10"><h1 className="text-xl font-semibold">טוען...</h1></div>;
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50" dir="rtl">
      <Header userProfile={activeProfile} onLogout={handleLogout} />
      <main className="flex-grow w-full max-w-4xl mx-auto p-4 sm:p-6">
        {renderContent()}
      </main>
      <Footer />
    </div>
  );
};

export default App;
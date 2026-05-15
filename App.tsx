import React, { useState, useMemo, useEffect } from 'react';
import { UserProfile, FoodItem, WeightEntry, FastingEntry, Gender, ActivityLevel, Goal } from './types';
import { useAuth } from './hooks/useAuth';
import { getUserProfile, createUserProfile, updateUserProfile, subscribeToFoodLogs } from './services/firestoreService';
import { auth } from './lib/firebase';
import { signOut } from 'firebase/auth';

import Header from './components/Header';
import Footer from './components/common/Footer';
import Onboarding from './components/Onboarding';
import Dashboard from './components/Dashboard';
import Login from './components/Login';

const App: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const [activeProfile, setActiveProfile] = useState<UserProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [appState, setAppState] = useState<'LOADING' | 'LOGIN' | 'ONBOARDING' | 'DASHBOARD'>('LOADING');

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      setAppState('LOGIN');
      setActiveProfile(null);
      return;
    }

    const fetchProfile = async () => {
      setProfileLoading(true);
      try {
        const profile = await getUserProfile(user.uid);
        if (profile) {
          setActiveProfile(profile);
          setAppState('DASHBOARD');
        } else {
          setAppState('ONBOARDING');
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      } finally {
        setProfileLoading(false);
      }
    };

    fetchProfile();
  }, [user, authLoading]);

  // Subscribe to food logs separately for real-time updates and better scalability
  useEffect(() => {
     if (user && activeProfile) {
         const unsubscribe = subscribeToFoodLogs(user.uid, (logs) => {
             setActiveProfile(prev => prev ? { ...prev, foodLog: logs } : null);
         });
         return unsubscribe;
     }
  }, [user, !!activeProfile]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const handleOnboardingComplete = async (profileData: Omit<UserProfile, 'id'>) => {
    if (!user) return;
    
    const newProfile: UserProfile = {
      ...profileData,
      id: user.uid,
      foodLog: [],
      weightLog: [{ date: new Date().toISOString().split('T')[0], weight: profileData.weight }],
    };

    try {
      await createUserProfile(newProfile);
      setActiveProfile(newProfile);
      setAppState('DASHBOARD');
    } catch (error) {
      console.error("Error creating profile:", error);
    }
  };

  const handleProfileUpdate = async (updatedData: Partial<UserProfile>) => {
    if (!user || !activeProfile) return;
    
    try {
      await updateUserProfile(user.uid, updatedData);
      setActiveProfile(prev => prev ? { ...prev, ...updatedData } : null);
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };

  const handleFoodLogUpdate = (newFoodLog: FoodItem[]) => {
      // NOTE: In this implementation, food logs are handled by the specific AI/Manual sub collection later,
      // but if the UI expects to replace the whole log, we do it here.
      // For now, I'll update the profile doc, but we should consider a better strategy for large logs.
      handleProfileUpdate({ foodLog: newFoodLog });
  };

  const handleFastingLogUpdate = (newFastingLog: FastingEntry[]) => {
    handleProfileUpdate({ fastingLog: newFastingLog });
  };
  
  const handleAddWeight = async (date: string, weight: number) => {
    if (!activeProfile || !user) return;

    const newLogEntry: WeightEntry = { date, weight };
    let updatedWeightLog = [...(activeProfile.weightLog || [])];
    
    const existingLogIndex = updatedWeightLog.findIndex(log => log.date === date);

    if (existingLogIndex !== -1) {
      updatedWeightLog[existingLogIndex] = newLogEntry;
    } else {
      updatedWeightLog.push(newLogEntry);
    }

    updatedWeightLog.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    const today = new Date().toISOString().split('T')[0];
    const update: Partial<UserProfile> = { weightLog: updatedWeightLog };
    if (date === today) {
        update.weight = weight;
    }

    await handleProfileUpdate(update);
  };

  const renderContent = () => {
    if (authLoading || profileLoading) {
        return <div className="text-center p-10"><h1 className="text-xl font-semibold">טוען...</h1></div>;
    }

    switch (appState) {
      case 'LOGIN':
        return <Login />;
      case 'ONBOARDING':
        return <Onboarding onComplete={handleOnboardingComplete} />;
      case 'DASHBOARD':
        if (activeProfile) {
          return <Dashboard 
            userProfile={activeProfile} 
            onUpdateProfile={handleProfileUpdate} 
            onUpdateFoodLog={handleFoodLogUpdate} 
            onUpdateFastingLog={handleFastingLogUpdate}
            onAddWeight={handleAddWeight}
          />;
        }
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

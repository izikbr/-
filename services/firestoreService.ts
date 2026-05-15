import { doc, getDoc, setDoc, updateDoc, collection, query, where, getDocs, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { UserProfile, FoodItem, FastingEntry, WeightEntry } from '../types';

export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
  const docRef = doc(db, 'users', uid);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return docSnap.data() as UserProfile;
  }
  return null;
};

export const createUserProfile = async (profile: UserProfile) => {
  const docRef = doc(db, 'users', profile.id);
  await setDoc(docRef, {
    ...profile,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });
};

export const updateUserProfile = async (uid: string, data: Partial<UserProfile>) => {
  const docRef = doc(db, 'users', uid);
  await updateDoc(docRef, {
    ...data,
    updatedAt: new Date().toISOString()
  });
};

// For Food Logs, we can use a subcollection for better scalability, 
// but the current structure has them in the profile. 
// I'll stick to subcollection for foodLog as per "Fortress" rules Pillar 1 advice if it was many items.
// The current code passes full foodLog array. I'll maintain that for now but use Firestore for the source.

export const saveFoodEntry = async (userId: string, entry: FoodItem) => {
    const docRef = doc(collection(db, 'foodLogs'));
    await setDoc(docRef, {
        ...entry,
        userId,
        createdAt: new Date().toISOString()
    });
    return docRef.id;
};

export const subscribeToFoodLogs = (userId: string, callback: (items: FoodItem[]) => void, date?: string) => {
    let q = query(
        collection(db, 'foodLogs'), 
        where('userId', '==', userId),
        orderBy('timestamp', 'desc')
    );
    
    if (date) {
        // Simple string prefix match for date (YYYY-MM-DD)
        const end = date + 'T23:59:59';
        q = query(q, where('timestamp', '>=', date), where('timestamp', '<=', end));
    }

    return onSnapshot(q, (snapshot) => {
        const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as FoodItem));
        callback(items);
    });
};

export const deleteFoodEntry = async (entryId: string) => {
    const { deleteDoc } = await import('firebase/firestore');
    await deleteDoc(doc(db, 'foodLogs', entryId));
};

export const updateFoodEntry = async (entryId: string, data: Partial<FoodItem>) => {
    await updateDoc(doc(db, 'foodLogs', entryId), data);
};

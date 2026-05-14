// FIX: Import React to make its namespace available for type definitions like React.Dispatch.
import React, { useState, useEffect } from 'react';

/**
 * A stable and simple hook to persist state to localStorage.
 * It reads the value from localStorage on initial render and saves it back
 * whenever the state value changes.
 * It does NOT react to key changes after initialization; that logic is now handled
 * in the App component for clarity and safety.
 * @param key The localStorage key. If null, the hook will not interact with localStorage.
 * @param initialValue The initial value to use if nothing is in localStorage.
 * @returns A stateful value, and a function to update it.
 */
function useLocalStorage<T>(
  key: string | null,
  initialValue: T
): [T, React.Dispatch<React.SetStateAction<T>>] {
  
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined' || !key) {
      return initialValue;
    }
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(error);
      return initialValue;
    }
  });

  useEffect(() => {
    if (typeof window !== 'undefined' && key) {
        try {
            window.localStorage.setItem(key, JSON.stringify(storedValue));
        } catch (error) {
            console.error(`Could not save value for key: ${key}`, error);
        }
    }
  }, [key, storedValue]);

  return [storedValue, setStoredValue];
}

export default useLocalStorage;

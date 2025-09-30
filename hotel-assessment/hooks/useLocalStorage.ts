// FIX: Import Dispatch and SetStateAction types from 'react' to resolve the 'React' namespace error.
import { useState, useEffect, Dispatch, SetStateAction } from 'react';

// FIX: Update return type to use imported Dispatch and SetStateAction, as the 'React' namespace is not available.
export const useLocalStorage = <T,>(key: string, initialValue: T): [T, Dispatch<SetStateAction<T>>] => {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(error);
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      // FIX: The value to store in localStorage is simply the storedValue state.
      // The previous logic to handle function-based state updates was incorrect here.
      window.localStorage.setItem(key, JSON.stringify(storedValue));
    } catch (error) {
      console.error(error);
    }
  }, [key, storedValue]);

  return [storedValue, setStoredValue];
};

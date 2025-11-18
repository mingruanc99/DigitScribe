import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@digiscribe/history';
const MAX_ENTRIES = 50;

const HistoryContext = createContext(null);

export const HistoryProvider = ({ children }) => {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) {
            setEntries(parsed);
          }
        }
      } catch (error) {
        console.warn('Failed to restore recognition history', error);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const persist = useCallback(async (list) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    } catch (error) {
      console.warn('Failed to persist recognition history', error);
    }
  }, []);

  const addEntry = useCallback(
    async (entry) => {
      setEntries((prev) => {
        const next = [entry, ...prev].slice(0, MAX_ENTRIES);
        persist(next);
        return next;
      });
    },
    [persist]
  );

  const clearEntries = useCallback(async () => {
    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.warn('Failed to clear recognition history', error);
    }
    setEntries([]);
  }, []);

  const value = useMemo(
    () => ({ entries, addEntry, clearEntries, loading }),
    [entries, addEntry, clearEntries, loading]
  );

  return <HistoryContext.Provider value={value}>{children}</HistoryContext.Provider>;
};

export const useHistory = () => {
  const ctx = useContext(HistoryContext);
  if (!ctx) {
    throw new Error('useHistory must be used within HistoryProvider');
  }
  return ctx;
};

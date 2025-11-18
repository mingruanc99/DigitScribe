import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import authService from '../services/AuthService.js';

const STORAGE_KEY = '@digiscribe/auth-session';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [initializing, setInitializing] = useState(true);
  const [authError, setAuthError] = useState(null);

  useEffect(() => {
    const hydrate = async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          setUser(parsed.user ?? null);
          setToken(parsed.token ?? null);
        }
      } catch (error) {
        console.warn('Failed to restore auth session', error);
      } finally {
        setInitializing(false);
      }
    };

    hydrate();
  }, []);

  const persistSession = useCallback(async (session) => {
    setUser(session.user ?? null);
    setToken(session.token ?? null);
    if (session?.token) {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    } else {
      await AsyncStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  const login = useCallback(async ({ username, password }) => {
    setAuthError(null);
    const cleanUsername = username?.trim();
    const result = await authService.login(cleanUsername, password);
    await persistSession(result);
    return result;
  }, [persistSession]);

  const register = useCallback(async ({ username, email, password }) => {
    setAuthError(null);
    const payload = await authService.register({ username: username?.trim(), email, password });
    await persistSession(payload);
    return payload;
  }, [persistSession]);

  const logout = useCallback(async () => {
    setAuthError(null);
    setUser(null);
    setToken(null);
    await AsyncStorage.removeItem(STORAGE_KEY);
  }, []);

  const value = useMemo(() => ({
    user,
    token,
    isAuthenticated: Boolean(user && token),
    initializing,
    login,
    register,
    logout,
    authError,
    clearError: () => setAuthError(null),
  }), [user, token, initializing, login, register, logout, authError]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
};

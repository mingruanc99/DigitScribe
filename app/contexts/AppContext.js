import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { translations } from '../language/translations';
import { loginUser, guestLogin } from '../services/ServerConnection';

// Create context
const AppContext = createContext();

// Default values
const DEFAULT_LANGUAGE = 'en';
const DEFAULT_DARK_MODE = false;

export function AppProvider({ children }) {
  const [language, setLanguage] = useState(DEFAULT_LANGUAGE);
  const [isDarkMode, setIsDarkMode] = useState(DEFAULT_DARK_MODE);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Load saved preferences and auth on app start
  useEffect(() => {
    loadPreferences();
    loadAuth();
  }, []);

  // Load preferences from AsyncStorage
  const loadPreferences = async () => {
    try {
      setIsLoading(true);

      const savedLanguage = await AsyncStorage.getItem('@app_language');
      const savedDarkMode = await AsyncStorage.getItem('@app_dark_mode');

      if (savedLanguage !== null) {
        setLanguage(savedLanguage);
      }

      if (savedDarkMode !== null) {
        setIsDarkMode(savedDarkMode === 'true');
      }
    } catch (error) {
      console.error('Error loading preferences:', error);
    }
  };

  // Load authentication from AsyncStorage
  const loadAuth = async () => {
    try {
      const savedToken = await AsyncStorage.getItem('@auth_token');
      const savedUser = await AsyncStorage.getItem('@auth_user');

      if (savedToken && savedUser) {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error('Error loading auth:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Save language preference
  const saveLanguage = async (lang) => {
    try {
      await AsyncStorage.setItem('@app_language', lang);
      setLanguage(lang);
    } catch (error) {
      console.error('Error saving language:', error);
    }
  };

  // Save dark mode preference
  const saveDarkMode = async (darkMode) => {
    try {
      await AsyncStorage.setItem('@app_dark_mode', darkMode.toString());
      setIsDarkMode(darkMode);
    } catch (error) {
      console.error('Error saving dark mode:', error);
    }
  };

  // Toggle dark mode
  const toggleDarkMode = () => {
    saveDarkMode(!isDarkMode);
  };

  // Get translated text
  const t = (key) => {
    return translations[language][key] || key;
  };

  // Get current theme
  const theme = {
    isDarkMode,
    colors: isDarkMode ? {
      // Dark mode colors
      background: '#000000',
      surface: '#1a1a1a',
      card: '#1a1a1a',
      text: '#ffffff',
      textSecondary: 'rgba(255, 255, 255, 0.6)',
      textOnBlack: '#ffffff',
      border: '#333333',
      divider: '#333333',
      primary: '#ffffff',
      secondary: '#cccccc',
      accent: '#007AFF',
      success: '#34C759',
      error: '#FF453A',
      warning: '#FF9500',
      button: '#ffffff',
      buttonText: '#000000',
      inputBackground: '#1a1a1a',
      inputBorder: '#333333',
    } : {
      // Light mode colors
      background: '#ffffff',
      surface: '#f9f9f9',
      card: '#f9f9f9',
      text: '#000000',
      textSecondary: 'rgba(0, 0, 0, 0.6)',
      textOnBlack: '#ffffff',
      border: '#e5e5e5',
      divider: '#e5e5e5',
      primary: '#000000',
      secondary: '#666666',
      accent: '#007AFF',
      success: '#34C759',
      error: '#FF453A',
      warning: '#FF9500',
      button: '#000000',
      buttonText: '#ffffff',
      inputBackground: '#f9f9f9',
      inputBorder: '#e5e5e5',
    }
  };

  // Login user
  const login = async (username) => {
    try {
      const result = await loginUser(username);
      if (result.success) {
        await AsyncStorage.setItem('@auth_token', result.token);
        await AsyncStorage.setItem('@auth_user', JSON.stringify(result.user));
        setToken(result.token);
        setUser(result.user);
        setIsAuthenticated(true);
      }
      return result;
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: error.message };
    }
  };

  // Logout user
  const logout = async () => {
    try {
      await AsyncStorage.removeItem('@auth_token');
      await AsyncStorage.removeItem('@auth_user');
      setToken(null);
      setUser(null);
      setIsAuthenticated(false);
      return { success: true };
    } catch (error) {
      console.error('Logout error:', error);
      return { success: false, error: error.message };
    }
  };

  // Guest login
  const loginAsGuest = async () => {
    try {
      const result = await guestLogin();
      if (result.success) {
        await AsyncStorage.setItem('@auth_token', result.token);
        await AsyncStorage.setItem('@auth_user', JSON.stringify(result.user));
        setToken(result.token);
        setUser(result.user);
        setIsAuthenticated(true);
      }
      return result;
    } catch (error) {
      console.error('Guest login error:', error);
      return { success: false, error: error.message };
    }
  };

  const value = {
    // State
    language,
    isDarkMode,
    isLoading,
    theme,
    user,
    token,
    isAuthenticated,

    // Actions
    setLanguage: saveLanguage,
    setDarkMode: saveDarkMode,
    toggleDarkMode,
    t,
    login,
    logout,
    loginAsGuest,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

// Custom hook to use app context
export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}

export default AppContext;

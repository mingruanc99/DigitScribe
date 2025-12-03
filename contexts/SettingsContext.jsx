import { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { AsyncStorage } from 'react-native';
import { Appearance } from 'react-native';
import { setI18nConfig, t as translate } from '../language';

const STORAGE_KEY = '@digiscribe/settings';
const SettingsContext = createContext(null);

const palette = {
  light: {
    background: '#f6f8fb',
    surface: '#ffffff',
    elevated: '#ffffff',
    textPrimary: '#0f172a',
    textSecondary: '#475569',
    accent: '#2563eb',
    accentMuted: '#c7d2fe',
    border: '#e2e8f0',
    shadow: 'rgba(15, 23, 42, 0.08)',
    heroGradient: ['#e0f2ff', '#f5f7ff'],
  },
  dark: {
    background: '#0f172a',
    surface: '#1e293b',
    elevated: '#243047',
    textPrimary: '#f8fafc',
    textSecondary: '#cbd5f5',
    accent: '#60a5fa',
    accentMuted: '#1d4ed8',
    border: '#334155',
    shadow: 'rgba(2, 6, 23, 0.65)',
    heroGradient: ['#0f172a', '#1f2937'],
  }
};

export const SettingsProvider = ({ children }) => {
  const [theme, setTheme] = useState('system');
  const [language, setLanguage] = useState('en');
  const systemScheme = Appearance.getColorScheme?.() || 'light';
  const activeTheme = theme === 'system' ? systemScheme : theme;

  useEffect(() => {
    const load = async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed.theme) setTheme(parsed.theme);
          if (parsed.language) setLanguage(parsed.language);
        }
      } catch (error) {
        console.warn('Failed to restore settings', error);
      }
    };
    load();
  }, []);

  useEffect(() => {
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ theme, language }));
  }, [theme, language]);

  useEffect(() => {
    setI18nConfig(language);
  }, [language]);

  const value = useMemo(() => ({
    theme,
    setTheme,
    language,
    setLanguage,
    colors: palette[activeTheme],
    isDark: activeTheme === 'dark',
    t: (key, options) => translate(key, { returnObjects: true, ...(options || {}) }),
  }), [theme, language, activeTheme]);

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const ctx = useContext(SettingsContext);
  if (!ctx) {
    throw new Error('useSettings must be used within SettingsProvider');
  }
  return ctx;
};

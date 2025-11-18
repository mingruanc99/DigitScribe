import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from '../src/context/AuthContext';
import { SettingsProvider, useSettings } from '../src/context/SettingsContext';
import { HistoryProvider } from '../src/context/HistoryContext';

const LayoutStack = () => {
  const { colors, isDark, t } = useSettings();
  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: colors.surface,
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
          },
          headerTintColor: colors.textPrimary,
          headerTitleStyle: {
            fontWeight: '600',
            fontSize: 18,
          },
          contentStyle: {
            backgroundColor: colors.background,
          },
        }}
      >
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="result"
          options={{
            title: t('result.title'),
            presentation: 'card',
          }}
        />
        <Stack.Screen
          name="database"
          options={{
            title: t('database.title'),
            presentation: 'card',
          }}
        />
        <Stack.Screen
          name="about"
          options={{
            title: t('about.title'),
            presentation: 'card',
          }}
        />
        <Stack.Screen
          name="result-detail"
          options={{
            title: t('resultDetail.title'),
            presentation: 'card',
          }}
        />
      </Stack>
    </>
  );
};

export default function RootLayout() {
  return (
    <SettingsProvider>
      <AuthProvider>
        <HistoryProvider>
          <LayoutStack />
        </HistoryProvider>
      </AuthProvider>
    </SettingsProvider>
  );
}

import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { AppProvider, useApp } from "./contexts/AppContext";
import { View, ActivityIndicator } from "react-native";

// Loading component while preferences load
function LoadingScreen() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#ffffff' }}>
      <ActivityIndicator size="large" color="#000000" />
    </View>
  );
}

// Main layout component that uses the app context
function RootLayoutContent() {
  const { isDarkMode, isLoading, t } = useApp();

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <>
      <StatusBar style={isDarkMode ? "light" : "dark"} />
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: isDarkMode ? '#000000' : '#ffffff',
            borderBottomWidth: 1,
            borderBottomColor: isDarkMode ? '#333333' : '#e5e5e5',
          },
          headerTintColor: isDarkMode ? '#ffffff' : '#000000',
          headerTitleStyle: {
            fontWeight: '600',
            fontSize: 18,
          },
          contentStyle: {
            backgroundColor: isDarkMode ? '#000000' : '#ffffff',
          },
        }}
      >
        <Stack.Screen
          name="index"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="(tabs)"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="result"
          options={{
            title: t('recognitionResult'),
            presentation: 'card'
          }}
        />
        <Stack.Screen
          name="database"
          options={{
            title: 'Database',
            presentation: 'card'
          }}
        />
        <Stack.Screen
          name="about"
          options={{
            title: t('aboutTeam'),
            presentation: 'card'
          }}
        />
        <Stack.Screen
          name="result-detail"
          options={{
            title: t('resultDetails'),
            presentation: 'card'
          }}
        />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  return (
    <AppProvider>
      <RootLayoutContent />
    </AppProvider>
  );
}

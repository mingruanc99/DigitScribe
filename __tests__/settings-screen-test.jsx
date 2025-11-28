import React from 'react';
import { render, waitFor, fireEvent } from '@testing-library/react-native';
import SettingsScreen from '../app/(tabs)/settings';
import { AuthProvider } from '../app/contexts/AuthContext';
import { SettingsProvider } from '../app/contexts/SettingsContext';
import { HistoryProvider } from '../app/contexts/HistoryContext';

// Mock expo-router
jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  }),
  useFocusEffect: jest.fn(),
}));

// Mock Alert
jest.mock('react-native', () => {
  const RN = jest.requireActual('react-native');
  RN.Alert = {
    alert: jest.fn(),
  };
  return RN;
});

// Mock services
jest.mock('../app/services/SpringBootService.js', () => ({
  getServerStatus: jest.fn(() => Promise.resolve({
    healthy: true,
    springBoot: { healthy: true },
    flask: { healthy: true },
    models: [{ name: 'Model1', status: 'Active' }]
  })),
  getAnalyticsOverview: jest.fn(() => Promise.resolve({
    totalRecognitions: 100,
    averageConfidence: 0.92,
    topPrediction: '7',
  })),
  getDatabaseStatus: jest.fn(() => Promise.resolve({
    ok: true,
    healthy: true,
    message: '✅ Database connected - MySQL 8.0.35',
  })),
  healthCheck: jest.fn(() => Promise.resolve({
    status: 'healthy',
    code: 200,
    details: { services: ['auth', 'ml', 'db'] },
  })),
}));


const AllProviders = ({ children }) => (
  <SettingsProvider>
    <AuthProvider>
      <HistoryProvider>{children}</HistoryProvider>
    </AuthProvider>
  </SettingsProvider>
);

describe('<SettingsScreen />', () => {
  test('renders settings title', async () => {
    const { getByText } = render(
      <AllProviders>
        <SettingsScreen />
      </AllProviders>
    );

    await waitFor(() => {
      expect(getByText('Settings')).toBeTruthy();
    });
  });

  test('displays appearance section', async () => {
    const { getByText } = render(
      <AllProviders>
        <SettingsScreen />
      </AllProviders>
    );

    await waitFor(() => {
      expect(getByText('Appearance')).toBeTruthy();
      expect(getByText('System default')).toBeTruthy();
    });
  });

  test('displays language section', async () => {
    const { getByText } = render(
      <AllProviders>
        <SettingsScreen />
      </AllProviders>
    );

    await waitFor(() => {
      expect(getByText('Language')).toBeTruthy();
    });
  });

  test('shows server status section', async () => {
    const { getByText } = render(
      <AllProviders>
        <SettingsScreen />
      </AllProviders>
    );

    await waitFor(() => {
      expect(getByText('Server Status')).toBeTruthy();
      expect(getByText('Server connected')).toBeTruthy();
    });
  });

  test('shows account actions when not authenticated', async () => {
    const { getByText } = render(
      <AllProviders>
        <SettingsScreen />
      </AllProviders>
    );

    await waitFor(() => {
      expect(getByText('Account')).toBeTruthy();
    });
  });

  test('theme toggle buttons are visible', async () => {
    const { getByText } = render(
      <AllProviders>
        <SettingsScreen />
      </AllProviders>
    );

    await waitFor(() => {
      expect(getByText('Light')).toBeTruthy();
      expect(getByText('Dark')).toBeTruthy();
    });
  });

  test('language selection buttons are visible', async () => {
    const { getByText } = render(
      <AllProviders>
        <SettingsScreen />
      </AllProviders>
    );

    await waitFor(() => {
      expect(getByText('English')).toBeTruthy();
      expect(getByText('中文')).toBeTruthy();
    });
  });
});

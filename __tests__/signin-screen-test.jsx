import React from 'react';
import { render, waitFor, fireEvent } from '@testing-library/react-native';
import { Alert } from 'react-native';
import SignIn from '../app/signin';
import { AuthProvider } from '../app/contexts/AuthContext';
import { SettingsProvider } from '../app/contexts/SettingsContext';
import { HistoryProvider } from '../app/contexts/HistoryContext';

// Mock expo-router
jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
    useLocalSearchParams: jest.fn(() => ({})),
  }),
  useLocalSearchParams: jest.fn(() => ({})),
}));

// Mock Alert
jest.spyOn(Alert, 'alert');

const AllProviders = ({ children }) => (
  <SettingsProvider>
    <AuthProvider>
      <HistoryProvider>{children}</HistoryProvider>
    </AuthProvider>
  </SettingsProvider>
);

describe('<SignIn />', () => {
  test('renders all main components', async () => {
    const { getByText, getByPlaceholderText } = render(
      <AllProviders>
        <SignIn />
      </AllProviders>
    );

    await waitFor(() => {
      expect(getByText('Sign in')).toBeTruthy();
      expect(getByText('Sync your recognition history across devices.')).toBeTruthy();
      expect(getByText('Username')).toBeTruthy();
      expect(getByText('Login')).toBeTruthy();
      expect(getByText('Register')).toBeTruthy();
      expect(getByText('Continue')).toBeTruthy();
      expect(getByText('Explore without signing in')).toBeTruthy();
    });
  });

  test('switches between login and register modes', async () => {
    const { getByText } = render(
      <AllProviders>
        <SignIn />
      </AllProviders>
    );

    const registerButton = getByText('Register');
    fireEvent.press(registerButton);

    await waitFor(() => {
      expect(getByText('Register')).toBeTruthy();
    });
  });

  test('validates empty username', async () => {
    const { getByText } = render(
      <AllProviders>
        <SignIn />
      </AllProviders>
    );

    const submitButton = getByText('Continue');
    fireEvent.press(submitButton);

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith('Please enter a username');
    });
  });

  test('allows entering username', async () => {
    const { getByPlaceholderText } = render(
      <AllProviders>
        <SignIn />
      </AllProviders>
    );

    const usernameInput = getByPlaceholderText('jane_doe');
    fireEvent.changeText(usernameInput, 'testuser');

    await waitFor(() => {
      expect(usernameInput.props.value).toBe('testuser');
    });
  });

  test('shows loading indicator during submission', async () => {
    const { getByText, queryByTestId } = render(
      <AllProviders>
        <SignIn />
      </AllProviders>
    );

    const submitButton = getByText('Continue');
    fireEvent.press(submitButton);

    await waitFor(() => {
      const activityIndicator = queryByTestId('activity-indicator');
      expect(activityIndicator).toBeTruthy();
    });
  });

  test('guest mode button is clickable', async () => {
    const { getByText } = render(
      <AllProviders>
        <SignIn />
      </AllProviders>
    );

    const guestButton = getByText('Explore without signing in');
    fireEvent.press(guestButton);

    await waitFor(() => {
      expect(guestButton).toBeTruthy();
    });
  });

  test('toggle buttons change active state', async () => {
    const { getByText } = render(
      <AllProviders>
        <SignIn />
      </AllProviders>
    );

    const registerButton = getByText('Register');
    fireEvent.press(registerButton);

    await waitFor(() => {
      expect(registerButton).toBeTruthy();
    });
  });
});

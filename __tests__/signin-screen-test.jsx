import React from 'react';
import { render, waitFor, fireEvent, cleanup } from '@testing-library/react-native';
import { Alert } from 'react-native';
import SignIn from '../app/signin';
import { AuthProvider } from '../contexts/AuthContext';
import { SettingsProvider } from '../contexts/SettingsContext';
import { HistoryProvider } from '../contexts/HistoryContext';

// Mock expo-router
jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  }),
  useLocalSearchParams: jest.fn(() => ({})),
}));

// Mock Alert
jest.spyOn(Alert, 'alert');

// Simplified wrapper with all providers
const AllProviders = ({ children }) => (
  <SettingsProvider>
    <AuthProvider>
      <HistoryProvider>{children}</HistoryProvider>
    </AuthProvider>
  </SettingsProvider>
);

describe('<SignIn /> - Username Only Auth', () => {
  afterEach(() => {
    cleanup();
    jest.clearAllMocks();
  });

  test('renders username field and auth buttons', async () => {
    const { getByText, getByPlaceholderText } = render(
      <AllProviders>
        <SignIn />
      </AllProviders>
    );

    await waitFor(() => {
      expect(getByText('Sign in')).toBeTruthy();
      expect(getByPlaceholderText('Enter username')).toBeTruthy();
      expect(getByText('Login')).toBeTruthy();
      expect(getByText('Register')).toBeTruthy();
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

  test('validates empty username on submit', async () => {
    const { getByText } = render(
      <AllProviders>
        <SignIn />
      </AllProviders>
    );

    const buttonText = getByText('Login');
    const submitButton = buttonText.parent;
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

    const usernameInput = getByPlaceholderText('Enter username');
    fireEvent.changeText(usernameInput, 'testuser');

    expect(usernameInput.props.value).toBe('testuser');
  });

  test('does NOT show password or email fields', async () => {
    const { queryByText } = render(
      <AllProviders>
        <SignIn />
      </AllProviders>
    );

    await waitFor(() => {
      expect(queryByText('Password')).toBeNull();
      expect(queryByText('Email')).toBeNull();
      expect(queryByText(/password/i)).toBeNull();
      expect(queryByText(/email/i)).toBeNull();
    });
  });

  test('shows correct button text for login mode', async () => {
    const { getByText } = render(
      <AllProviders>
        <SignIn />
      </AllProviders>
    );

    await waitFor(() => {
      expect(getByText('Login')).toBeTruthy();
    });
  });

  test('shows correct button text for register mode', async () => {
    const { getByText } = render(
      <AllProviders>
        <SignIn />
      </AllProviders>
    );

    const registerToggle = getByText('Register');
    fireEvent.press(registerToggle);

    // Button should say "Register" when in register mode
    await waitFor(() => {
      const button = getByText('Register');
      expect(button).toBeTruthy();
    });
  });
});

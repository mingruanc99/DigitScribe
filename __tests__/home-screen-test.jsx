import React from 'react';
import { render, waitFor, fireEvent, act } from '@testing-library/react-native';
import Home from '../app/(tabs)/index';
import { AuthProvider } from '../app/contexts/AuthContext';
import { SettingsProvider } from '../app/contexts/SettingsContext';
import { HistoryProvider } from '../app/contexts/HistoryContext';

// Mock static assets (images, etc.)
jest.mock('../assets/images/favicon.png', () => 'mock-image-source');

// Mock react-native-svg
jest.mock('react-native-svg', () => {
  const React = require('react');
  const createComponent = (name) => {
    const Component = React.forwardRef((props, ref) => {
      return React.createElement(name, { ...props, ref }, props.children);
    });
    Component.displayName = name;
    return Component;
  };

  return {
    __esModule: true,
    Svg: createComponent('Svg'),
    Path: createComponent('Path'),
    Circle: createComponent('Circle'),
    Rect: createComponent('Rect'),
    Line: createComponent('Line'),
    Polygon: createComponent('Polygon'),
    Polyline: createComponent('Polyline'),
    Text: createComponent('Text'),
    TSpan: createComponent('TSpan'),
    TextPath: createComponent('TextPath'),
    G: createComponent('G'),
    Defs: createComponent('Defs'),
    LinearGradient: createComponent('LinearGradient'),
    RadialGradient: createComponent('RadialGradient'),
    Stop: createComponent('Stop'),
    ClipPath: createComponent('ClipPath'),
    Pattern: createComponent('Pattern'),
    Mask: createComponent('Mask'),
    Image: createComponent('Image'),
    Use: createComponent('Use'),
    Symbol: createComponent('Symbol'),
    ForeignObject: createComponent('ForeignObject'),
  };
});

// Mock react-native-view-shot
jest.mock('react-native-view-shot', () => ({
  captureRef: jest.fn(() => Promise.resolve('mock-base64-image-data')),
  captureScreen: jest.fn(() => Promise.resolve('mock-base64-screen-data')),
}));

// Mock expo-router
jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  }),
  useLocalSearchParams: jest.fn(() => ({})),
  useFocusEffect: jest.fn(),
}));

// Mock LinearGradient from expo-linear-gradient
jest.mock('expo-linear-gradient', () => {
  const React = require('react');
  const LinearGradient = React.forwardRef((props, ref) => {
    return React.createElement('LinearGradient', { ...props, ref }, props.children);
  });
  LinearGradient.displayName = 'LinearGradient';
  return {
    __esModule: true,
    LinearGradient,
  };
});

// Mock Ionicons
jest.mock('@expo/vector-icons', () => {
  const React = require('react');
  const Ionicons = React.forwardRef((props, ref) => {
    const { name, size, color, ...otherProps } = props;
    return React.createElement('Text', { ...otherProps, ref, style: { fontSize: size, color } }, name);
  });
  Ionicons.displayName = 'Ionicons';
  return {
    __esModule: true,
    Ionicons,
  };
});

// Mock services
jest.mock('../app/services/SpringBootService.js', () => ({
  getServerStatus: jest.fn(() => Promise.resolve({ healthy: true, models: [] })),
  checkIndividualServers: jest.fn(() => Promise.resolve([])),
  predictDigit: jest.fn(() => Promise.resolve({
    success: true,
    data: {
      prediction: 7,
      confidence: 0.94,
      processingTime: 45.2,
    },
  })),
}));


const AllProviders = ({ children }) => (
  <SettingsProvider>
    <AuthProvider>
      <HistoryProvider>{children}</HistoryProvider>
    </AuthProvider>
  </SettingsProvider>
);

describe('<HomeScreen />', () => {
  test('renders without crashing', async () => {
    const { getByText } = render(
      <AllProviders>
        <Home />
      </AllProviders>
    );

    await waitFor(() => {
      expect(getByText('Confidence')).toBeTruthy();
    }, { timeout: 5000 });
  });

  test('displays writing canvas', async () => {
    const { getByText } = render(
      <AllProviders>
        <Home />
      </AllProviders>
    );

    await waitFor(() => {
      expect(getByText('Smart canvas')).toBeTruthy();
    }, { timeout: 5000 });
  });

  test('shows recognition results panel', async () => {
    const { getByText } = render(
      <AllProviders>
        <Home />
      </AllProviders>
    );

    await waitFor(() => {
      expect(getByText('Latest prediction')).toBeTruthy();
      expect(getByText('Start writing to get your first prediction.')).toBeTruthy();
    }, { timeout: 5000 });
  });

  test('clear button renders correctly', async () => {
    const { getByText } = render(
      <AllProviders>
        <Home />
      </AllProviders>
    );

    await waitFor(() => {
      const clearButton = getByText('Clear');
      expect(clearButton).toBeTruthy();
    }, { timeout: 5000 });
  });

  test('recognize button renders correctly', async () => {
    const { getByText } = render(
      <AllProviders>
        <Home />
      </AllProviders>
    );

    await waitFor(() => {
      const recognizeButton = getByText('Recognize');
      expect(recognizeButton).toBeTruthy();
    }, { timeout: 5000 });
  });

  test('displays tips section', async () => {
    const { getByText } = render(
      <AllProviders>
        <Home />
      </AllProviders>
    );

    await waitFor(() => {
      expect(getByText('How it works')).toBeTruthy();
    }, { timeout: 5000 });
  });

  test('history section is visible', async () => {
    const { getByText } = render(
      <AllProviders>
        <Home />
      </AllProviders>
    );

    await waitFor(() => {
      expect(getByText('Recent recognitions')).toBeTruthy();
    }, { timeout: 5000 });
  });
});

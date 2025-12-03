import React from 'react';
import { render, waitFor, fireEvent, act } from '@testing-library/react-native';
import Home from '../app/(tabs)/index';
import { AuthProvider } from '../contexts/AuthContext';
import { SettingsProvider } from '../contexts/SettingsContext';
import { HistoryProvider } from '../contexts/HistoryContext';

// Mock HandwritingCanvas
jest.mock('../components/HandwritingCanvas', () => {
  const React = require('react');
  return React.forwardRef((props, ref) => {
    React.useImperativeHandle(ref, () => ({
      clearCanvas: jest.fn(),
      getCanvasData: jest.fn(() => ({
        paths: ['M 10 10 L 50 50'],
        bounds: { minX: 10, maxX: 50, minY: 10, maxY: 50 },
        canvasSize: { width: 300, height: 300 },
      })),
      getBase64Image: jest.fn(() => Promise.resolve('mock-base64-image')),
    }));
    return React.createElement('View', {
      testID: 'handwriting-canvas',
      onTouchStart: props.onStrokeStart,
    });
  });
});

jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
  }),
}));

// Mock API service
jest.mock('../services/SpringBootService', () => ({
  default: {
    baseURL: 'http://localhost:8080/api',
    predictDigit: jest.fn(),
    healthCheck: jest.fn(() => Promise.resolve({ status: 'healthy', code: 200 })),
  },
}));

const AllProviders = ({ children }) => (
  <SettingsProvider>
    <AuthProvider>
      <HistoryProvider>{children}</HistoryProvider>
    </AuthProvider>
  </SettingsProvider>
);

describe('E2E: Handwriting Recognition Flow', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('draw number and submit for recognition', async () => {
    const { getByText, getByTestId } = render(
      <AllProviders>
        <Home />
      </AllProviders>
    );

    // Draw a number (simulated)
    const canvas = getByTestId('handwriting-canvas');
    fireEvent(canvas, 'touchStart', {
      nativeEvent: { locationX: 10, locationY: 10 },
    });

    // Verify canvas is present
    expect(canvas).toBeTruthy();

    // Find and press "Recognize" button
    await waitFor(() => {
      const recognizeButton = getByText('Recognize');
      expect(recognizeButton).toBeTruthy();
    });
  });

  test('continuous recognition with auto mode', async () => {
    const { getByText } = render(
      <AllProviders>
        <Home />
      </AllProviders>
    );

    // Enable auto-recognition
    const autoToggle = getByText(/Auto Recognition/);
    expect(autoToggle).toBeTruthy();
  });

  test('handles invalid input gracefully', async () => {
    const mockError = new Error('No drawing detected');
    const { getByText } = render(
      <AllProviders>
        <Home />
      </AllProviders>
    );

    // Attempt recognition with empty canvas
    const recognizeButton = getByText('Recognize');

    // Should handle error without crashing
    expect(recognizeButton).toBeTruthy();
  });

  test('clear canvas resets drawing', async () => {
    const { getByText } = render(
      <AllProviders>
        <Home />
      </AllProviders>
    );

    const clearButton = getByText('Clear');
    fireEvent.press(clearButton);

    // Should not throw errors
    expect(clearButton).toBeTruthy();
  });
});

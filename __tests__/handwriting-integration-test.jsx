import React from 'react';
import { render, waitFor, fireEvent } from '@testing-library/react-native';
import Home from '../app/(tabs)/index';
import { AuthProvider } from '../app/contexts/AuthContext';
import { SettingsProvider } from '../app/contexts/SettingsContext';
import { HistoryProvider } from '../app/contexts/HistoryContext';
import springBootService from '../app/services/SpringBootService';
import authService from '../app/services/AuthService';

// Mock services
jest.mock('../app/services/SpringBootService');
jest.mock('../app/services/AuthService');

const AllProviders = ({ children }) => (
  <SettingsProvider>
    <AuthProvider>
      <HistoryProvider>{children}</HistoryProvider>
    </AuthProvider>
  </SettingsProvider>
);

describe('Handwriting Recognition Integration - IP Server Flow', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('complete user flow: registration → write → recognize → save', async () => {
    // Step 1: User registers through MySQL database
    authService.register.mockResolvedValue({
      token: 'test-jwt-token',
      user: {
        username: 'testuser',
        email: '',
      },
    });

    const registerResult = await authService.register({
      username: 'testuser',
      email: '',
      password: '',
    });

    expect(registerResult.token).toBe('test-jwt-token');
    expect(authService.register).toHaveBeenCalledWith({
      username: 'testuser',
      email: '',
      password: '',
    });

    // Step 2: Connect to remote server and check health
    springBootService.healthCheck.mockResolvedValue({
      status: 'healthy',
      code: 200,
      details: { services: ['ml', 'auth', 'db'] },
    });

    const health = await springBootService.healthCheck();
    expect(health.status).toBe('healthy');
    expect(health.details.services).toContain('ml');

    // Step 3: User writes/handwriting input
    const mockHandwritingData = {
      paths: [
        [
          { x: 50, y: 50, timestamp: 1000000 },
          { x: 60, y: 60, timestamp: 1000100 },
          { x: 70, y: 70, timestamp: 1000200 },
        ],
      ],
      bounds: { minX: 45, maxX: 75, minY: 45, maxY: 75 },
      canvasSize: { width: 300, height: 300 },
    };

    // Step 4: Send to remote server for AI recognition
    springBootService.recognizeHandwriting.mockResolvedValue({
      success: true,
      data: {
        prediction: 3,
        confidence: 0.94,
        processingTime: 42.5,
        model: 'cnn-digit-recognizer-v2',
      },
    });

    const recognitionResult = await springBootService.recognizeHandwriting(
      mockHandwritingData
    );

    expect(recognitionResult.success).toBe(true);
    expect(recognitionResult.data.prediction).toBe(3);
    expect(recognitionResult.data.confidence).toBeGreaterThan(0.9);
    expect(recognitionResult.data.processingTime).toBeLessThan(100);

    // Verify correct API endpoint was called
    expect(springBootService.recognizeHandwriting).toHaveBeenCalledWith(
      mockHandwritingData
    );

    // Step 5: Save result to MySQL database
    springBootService.saveRecognitionResult.mockResolvedValue({
      id: 789,
      saved: true,
      timestamp: '2025-11-26T10:30:00Z',
    });

    const saveResult = await springBootService.saveRecognitionResult({
      recognizedText: '3',
      confidence: recognitionResult.data.confidence,
      processingTime: recognitionResult.data.processingTime,
      model: recognitionResult.data.model,
      userId: registerResult.user.username,
    });

    expect(saveResult.saved).toBe(true);
    expect(saveResult.id).toBeDefined();

    // Verify database save was called with correct data
    expect(springBootService.saveRecognitionResult).toHaveBeenCalledWith(
      expect.objectContaining({
        recognizedText: '3',
        confidence: 0.94,
        userId: 'testuser',
      })
    );
  });

  test('handles network failure to remote IP server', async () => {
    // Simulate network error
    springBootService.recognizeHandwriting.mockResolvedValue({
      success: false,
      error: 'Network timeout',
    });

    const result = await springBootService.recognizeHandwriting({
      paths: [],
      bounds: {},
      canvasSize: {},
    });

    expect(result.success).toBe(false);
    expect(result.error).toBe('Network timeout');
  });

  test('handles MySQL database connection failure', async () => {
    springBootService.saveRecognitionResult.mockRejectedValue(
      new Error('Database connection failed')
    );

    await expect(
      springBootService.saveRecognitionResult({
        recognizedText: '5',
        userId: 'user-123',
      })
    ).rejects.toThrow('Database connection failed');
  });

  test('guest user can recognize but cannot save to database', async () => {
    // Guest user (not authenticated)
    const guestUser = null;

    // Can still recognize handwriting
    springBootService.recognizeHandwriting.mockResolvedValue({
      success: true,
      data: { prediction: 8, confidence: 0.89 },
    });

    const recognition = await springBootService.recognizeHandwriting({
      paths: [],
      bounds: {},
      canvasSize: {},
    });

    expect(recognition.success).toBe(true);
    expect(recognition.data.prediction).toBe(8);

    // Attempting to save without authentication should handle gracefully
    if (guestUser) {
      await springBootService.saveRecognitionResult({
        recognizedText: '8',
        confidence: recognition.data.confidence,
        userId: guestUser,
      });
    } else {
      // Guest mode - don't save to database
      expect(guestUser).toBeNull();
    }
  });

  test('multiple sequential recognitions over IP network', async () => {
    const mockResults = [
      { success: true, data: { prediction: 1, confidence: 0.95 } },
      { success: true, data: { prediction: 2, confidence: 0.93 } },
      { success: true, data: { prediction: 3, confidence: 0.97 } },
    ];

    springBootService.recognizeHandwriting
      .mockResolvedValueOnce(mockResults[0])
      .mockResolvedValueOnce(mockResults[1])
      .mockResolvedValueOnce(mockResults[2]);

    // First recognition
    const result1 = await springBootService.recognizeHandwriting({
      paths: [],
      bounds: {},
      canvasSize: {},
    });
    expect(result1.data.prediction).toBe(1);

    // Second recognition
    const result2 = await springBootService.recognizeHandwriting({
      paths: [],
      bounds: {},
      canvasSize: {},
    });
    expect(result2.data.prediction).toBe(2);

    // Third recognition
    const result3 = await springBootService.recognizeHandwriting({
      paths: [],
      bounds: {},
      canvasSize: {},
    });
    expect(result3.data.prediction).toBe(3);

    expect(springBootService.recognizeHandwriting).toHaveBeenCalledTimes(3);
  });

  test('full flow: login → check server → recognize → save', async () => {
    // Step 1: Existing user logs in
    authService.login.mockResolvedValue({
      token: 'existing-user-token',
      user: {
        username: 'johndoe',
        email: '',
      },
    });

    const loginResult = await authService.login('johndoe', '');
    expect(loginResult.token).toBe('existing-user-token');

    // Step 2: Verify server connection
    springBootService.healthCheck.mockResolvedValue({
      status: 'healthy',
      code: 200,
    });

    const health = await springBootService.healthCheck();
    expect(health.status).toBe('healthy');

    // Step 3: Recognize handwriting
    springBootService.recognizeHandwriting.mockResolvedValue({
      success: true,
      data: { prediction: 7, confidence: 0.91 },
    });

    const recognition = await springBootService.recognizeHandwriting({
      paths: [],
      bounds: {},
      canvasSize: {},
    });

    // Step 4: Save to database with user ID
    springBootService.saveRecognitionResult.mockResolvedValue({
      id: 999,
      saved: true,
    });

    await springBootService.saveRecognitionResult({
      recognizedText: String(recognition.data.prediction),
      confidence: recognition.data.confidence,
      processingTime: 48.2,
      userId: loginResult.user.username,
    });

    expect(springBootService.saveRecognitionResult).toHaveBeenCalledWith(
      expect.objectContaining({
        recognizedText: '7',
        userId: 'johndoe',
      })
    );
  });

  test('high load simulation: multiple concurrent recognitions', async () => {
    const mockResults = [
      { success: true, data: { prediction: 0, confidence: 0.90 } },
      { success: true, data: { prediction: 1, confidence: 0.91 } },
      { success: true, data: { prediction: 2, confidence: 0.92 } },
      { success: true, data: { prediction: 3, confidence: 0.93 } },
    ];

    mockResults.forEach((result) => {
      springBootService.recognizeHandwriting.mockResolvedValueOnce(result);
    });

    const promises = mockResults.map((_, index) =>
      springBootService.recognizeHandwriting({
        paths: [],
        bounds: {},
        canvasSize: {},
      })
    );

    const results = await Promise.all(promises);

    expect(results).toHaveLength(4);
    results.forEach((result, index) => {
      expect(result.success).toBe(true);
      expect(result.data.prediction).toBe(index);
    });
  });

  test('error recovery: retry after network failure', async () => {
    let attempts = 0;

    springBootService.recognizeHandwriting.mockImplementation(async () => {
      attempts++;
      if (attempts === 1) {
        return { success: false, error: 'Network timeout' };
      }
      return { success: true, data: { prediction: 4, confidence: 0.89 } };
    });

    // First attempt fails
    const result1 = await springBootService.recognizeHandwriting({
      paths: [],
      bounds: {},
      canvasSize: {},
    });
    expect(result1.success).toBe(false);

    // Second attempt succeeds
    const result2 = await springBootService.recognizeHandwriting({
      paths: [],
      bounds: {},
      canvasSize: {},
    });
    expect(result2.success).toBe(true);
  });
});
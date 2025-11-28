import springBootService, {
  saveRecognitionResult,
  getUserCollections,
  getAnalyticsOverview,
  getDatabaseStatus,
} from '../app/services/SpringBootService';

// Mock fetch
global.fetch = jest.fn();

describe('SpringBootService - Remote IP Server Connection', () => {
  beforeEach(() => {
    fetch.mockClear();
  });

  describe('recognizeHandwriting() - AI Handwriting Recognition', () => {
    test('successfully connects to remote server for handwriting recognition', async () => {
      const mockData = {
        prediction: 7,
        confidence: 0.95,
        processingTime: 45.2,
        model: 'cnn-digit-v2',
      };

      const mockResponse = {
        ok: true,
        json: async () => mockData,
      };
      fetch.mockResolvedValue(mockResponse);

      const handwritingData = {
        paths: [{ x: 10, y: 20 }, { x: 30, y: 40 }],
        bounds: { minX: 0, maxX: 100, minY: 0, maxY: 100 },
        canvasSize: { width: 300, height: 300 },
      };

      const result = await springBootService.recognizeHandwriting(handwritingData);

      expect(result.success).toBe(true);
      expect(result.data.prediction).toBe(7);
      expect(result.data.confidence).toBe(0.95);
      expect(fetch).toHaveBeenCalledTimes(1);

      const fetchCall = fetch.mock.calls[0];
      expect(fetchCall[0]).toMatch(/\/recognition\/handwriting$/);
    });

    test('handles remote server timeout', async () => {
      fetch.mockRejectedValue(new Error('Network timeout'));

      const handwritingData = {
        paths: [],
        bounds: {},
        canvasSize: {},
      };

      const result = await springBootService.recognizeHandwriting(handwritingData);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Network timeout');
    });

    test('sends correct payload to remote server', async () => {
      const mockResponse = {
        ok: true,
        json: async () => ({ success: true, data: {} }),
      };
      fetch.mockResolvedValue(mockResponse);

      const handwritingData = {
        paths: [[{ x: 10, y: 10 }]],
        bounds: { minX: 0, maxX: 100, minY: 0, maxY: 100 },
        canvasSize: { width: 300, height: 300 },
      };

      await springBootService.recognizeHandwriting(handwritingData);

      const fetchCall = fetch.mock.calls[0];
      const requestBody = JSON.parse(fetchCall[1].body);

      expect(requestBody.paths).toEqual([[{ x: 10, y: 10 }]]);
      expect(requestBody.bounds).toBeDefined();
      expect(requestBody.deviceInfo.platform).toBe('react-native');
      expect(requestBody.deviceInfo.screenWidth).toBe(300);
      expect(requestBody.deviceInfo.screenHeight).toBe(300);
      expect(requestBody.timestamp).toBeDefined();
    });

    test('handles HTTP errors from remote server', async () => {
      const mockResponse = {
        ok: false,
        status: 500,
      };
      fetch.mockResolvedValue(mockResponse);

      const handwritingData = { paths: [], bounds: {}, canvasSize: {} };
      const result = await springBootService.recognizeHandwriting(handwritingData);

      expect(result.success).toBe(false);
      expect(result.error).toContain('HTTP error! status: 500');
    });

    test('uses 30-second timeout for remote server', async () => {
      const mockResponse = {
        ok: true,
        json: async () => ({ success: true, data: {} }),
      };
      fetch.mockResolvedValue(mockResponse);

      await springBootService.recognizeHandwriting({ paths: [], bounds: {}, canvasSize: {} });

      const fetchCall = fetch.mock.calls[0];
      expect(fetchCall[1].timeout).toBe(30000);
    });

    test('includes correct Content-Type header', async () => {
      const mockResponse = {
        ok: true,
        json: async () => ({ success: true, data: {} }),
      };
      fetch.mockResolvedValue(mockResponse);

      await springBootService.recognizeHandwriting({ paths: [], bounds: {}, canvasSize: {} });

      const fetchCall = fetch.mock.calls[0];
      expect(fetchCall[1].headers['Content-Type']).toBe('application/json');
    });
  });

  describe('predictDigit() - Automated Digit Recognition', () => {
    test('sends image to remote server for prediction', async () => {
      const mockResponse = {
        ok: true,
        json: async () => ({
          prediction: 3,
          confidence: 0.88,
        }),
      };
      fetch.mockResolvedValue(mockResponse);

      const imagePayload = 'data:image/png;base64,iVBORw0KGgo...';
      const result = await springBootService.predictDigit(imagePayload);

      expect(result.prediction).toBe(3);
      expect(result.confidence).toBe(0.88);
    });

    test('handles prediction errors from remote server', async () => {
      const mockResponse = {
        ok: false,
        json: async () => ({ error: 'Invalid image data' }),
      };
      fetch.mockResolvedValue(mockResponse);

      await expect(springBootService.predictDigit('invalid-image')).rejects.toThrow(
        'Invalid image data'
      );
    });

    test('includes imageData and inputType in request', async () => {
      const mockResponse = {
        ok: true,
        json: async () => ({ prediction: 5, confidence: 0.92 }),
      };
      fetch.mockResolvedValue(mockResponse);

      await springBootService.predictDigit('base64-data');

      const fetchCall = fetch.mock.calls[0];
      const requestBody = JSON.parse(fetchCall[1].body);

      expect(requestBody.imageData).toBe('base64-data');
      expect(requestBody.inputType).toBe('drawing');
    });

    test('uses correct prediction endpoint', async () => {
      const mockResponse = {
        ok: true,
        json: async () => ({ prediction: 9, confidence: 0.95 }),
      };
      fetch.mockResolvedValue(mockResponse);

      await springBootService.predictDigit('image');

      const fetchCall = fetch.mock.calls[0];
      expect(fetchCall[0]).toMatch(/\/mobile\/predict$/);
    });
  });

  describe('saveRecognitionResult() - Store Results in MySQL', () => {
    test('saves recognition result to MySQL database', async () => {
      const mockResponse = {
        ok: true,
        json: async () => ({
          id: 123,
          saved: true,
        }),
      };
      fetch.mockResolvedValue(mockResponse);

      const resultData = {
        recognizedText: '3',
        confidence: 0.95,
        processingTime: 45.2,
        userId: 'user-456',
      };

      const result = await springBootService.saveRecognitionResult(resultData);

      expect(result.id).toBe(123);
      expect(result.saved).toBe(true);
    });

    test('sends correct data format to database', async () => {
      const mockResponse = {
        ok: true,
        json: async () => ({ id: 1, saved: true }),
      };
      fetch.mockResolvedValue(mockResponse);

      const resultData = {
        recognizedText: '7',
        confidence: 0.88,
        processingTime: 52.1,
        language: 'en',
        userId: 'user-789',
      };

      await springBootService.saveRecognitionResult(resultData);

      const fetchCall = fetch.mock.calls[0];
      const requestBody = JSON.parse(fetchCall[1].body);

      expect(requestBody.recognizedText).toBe('7');
      expect(requestBody.confidence).toBe(0.88);
      expect(requestBody.processingTime).toBe(52.1);
      expect(requestBody.language).toBe('en');
      expect(requestBody.userId).toBe('user-789');
      expect(requestBody.timestamp).toBeDefined();
    });

    test('throws error when database save fails', async () => {
      const mockResponse = {
        ok: false,
        status: 500,
      };
      fetch.mockResolvedValue(mockResponse);

      const resultData = {
        recognizedText: '5',
        confidence: 0.90,
        userId: 'user-123',
      };

      await expect(
        springBootService.saveRecognitionResult(resultData)
      ).rejects.toThrow('HTTP error! status: 500');
    });

    test('uses correct save endpoint', async () => {
      const mockResponse = {
        ok: true,
        json: async () => ({ id: 1, saved: true }),
      };
      fetch.mockResolvedValue(mockResponse);

      await springBootService.saveRecognitionResult({ recognizedText: '1' });

      const fetchCall = fetch.mock.calls[0];
      expect(fetchCall[0]).toMatch(/\/recognition\/save$/);
    });
  });

  describe('healthCheck() - Remote Server Health', () => {
    test('successfully checks remote server health', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        json: async () => ({
          status: 'healthy',
          timestamp: '2025-11-26T10:30:00Z',
          services: ['auth', 'ml'],
        }),
      };
      fetch.mockResolvedValue(mockResponse);

      const result = await springBootService.healthCheck();

      expect(result.status).toBe('healthy');
      expect(result.code).toBe(200);
      expect(result.details.services).toContain('auth');
      expect(result.details.services).toContain('ml');
    });

    test('detects unhealthy remote server', async () => {
      const mockResponse = {
        ok: false,
        status: 503,
        json: async () => ({ status: 'down' }),
      };
      fetch.mockResolvedValue(mockResponse);

      const result = await springBootService.healthCheck();

      expect(result.status).toBe('unhealthy');
      expect(result.code).toBe(503);
    });

    test('handles remote server unreachable', async () => {
      fetch.mockRejectedValue(new Error('Connection refused'));

      const result = await springBootService.healthCheck();

      expect(result.status).toBe('error');
      expect(result.error).toBe('Connection refused');
    });

    test('uses correct health endpoint', async () => {
      const mockResponse = {
        ok: true,
        json: async () => ({ status: 'healthy' }),
      };
      fetch.mockResolvedValue(mockResponse);

      await springBootService.healthCheck();

      const fetchCall = fetch.mock.calls[0];
      expect(fetchCall[0]).toMatch(/\/health$/);
    });

    test('includes 5-second timeout for health check', async () => {
      const mockResponse = {
        ok: true,
        json: async () => ({ status: 'healthy' }),
      };
      fetch.mockResolvedValue(mockResponse);

      await springBootService.healthCheck();

      const fetchCall = fetch.mock.calls[0];
      expect(fetchCall[1].timeout).toBe(5000);
    });
  });

  describe('getDatabaseStatus() - MySQL Connection Check', () => {
    test('successfully checks MySQL database connection', async () => {
      const mockResponse = {
        ok: true,
        text: async () => '✅ Database connected - MySQL 8.0.35',
      };
      fetch.mockResolvedValue(mockResponse);

      const result = await springBootService.getDatabaseStatus();

      expect(result.healthy).toBe(true);
      expect(result.message).toContain('Database connected');
      expect(result.checkedAt).toBeDefined();
    });

    test('detects database connection failure', async () => {
      const mockResponse = {
        ok: false,
        text: async () => '❌ Database connection failed',
      };
      fetch.mockResolvedValue(mockResponse);

      const result = await springBootService.getDatabaseStatus();

      expect(result.healthy).toBe(false);
      expect(result.message).toContain('connection failed');
    });

    test('handles database server unreachable', async () => {
      fetch.mockRejectedValue(new Error('ECONNREFUSED'));

      await expect(springBootService.getDatabaseStatus()).rejects.toThrow(
        'Unable to reach database endpoint'
      );
    });

    test('uses correct database test endpoint', async () => {
      const mockResponse = {
        ok: true,
        text: async () => '✅ Database connected',
      };
      fetch.mockResolvedValue(mockResponse);

      await springBootService.getDatabaseStatus();

      const fetchCall = fetch.mock.calls[0];
      expect(fetchCall[0]).toMatch(/\/db-test$/);
    });

    test('parses MySQL version from response', async () => {
      const mockResponse = {
        ok: true,
        text: async () => '✅ Database connected - MySQL 8.0.33',
      };
      fetch.mockResolvedValue(mockResponse);

      const result = await springBootService.getDatabaseStatus();

      expect(result.message).toContain('MySQL 8.0.33');
    });
  });

  describe('Network Configuration', () => {
    test('uses configured remote server IP address', () => {
      expect(springBootService.baseURL).toBeDefined();
      expect(springBootService.baseURL).toMatch(/http:\/\/\d+\.\d+\.\d+\.\d+/);
    });

    test('includes /api prefix in base URL', () => {
      expect(springBootService.baseURL).toMatch(/\/api$/);
    });

    test('has root URL without /api suffix', () => {
      expect(springBootService.rootURL).toBeDefined();
      expect(springBootService.rootURL).not.toMatch(/\/api$/);
    });
  });

  describe('Complete Handwriting Recognition Flow', () => {
    beforeEach(() => {
      fetch.mockClear();
    });

    test('performs full recognition cycle over IP network', async () => {
      // Step 1: Health check
      const healthResponse = {
        ok: true,
        status: 200,
        json: async () => ({ status: 'healthy' }),
      };
      fetch.mockResolvedValueOnce(healthResponse);

      // Step 2: Recognize handwriting
      const recognizeResponse = {
        ok: true,
        status: 200,
        json: async () => ({ prediction: 5, confidence: 0.91 }),
      };
      fetch.mockResolvedValueOnce(recognizeResponse);

      // Step 3: Save result
      const saveResponse = {
        ok: true,
        json: async () => ({ id: 456, saved: true }),
      };
      fetch.mockResolvedValueOnce(saveResponse);

      // Execute flow
      const health = await springBootService.healthCheck();
      expect(health.status).toBe('healthy');

      const recognition = await springBootService.recognizeHandwriting({
        paths: [],
        bounds: {},
        canvasSize: {},
      });
      expect(recognition.success).toBe(true);
      expect(recognition.data.prediction).toBe(5);

      const saveResult = await springBootService.saveRecognitionResult({
        recognizedText: '5',
        confidence: 0.91,
        processingTime: 48.3,
        userId: 'user-123',
      });
      expect(saveResult.id).toBe(456);

      expect(fetch).toHaveBeenCalledTimes(3);
    });

    test('handles network failure in multi-step flow gracefully', async () => {
      fetch.mockRejectedValueOnce(new Error('Network failure'));
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: 1, saved: true })
      });

      const result = await springBootService.recognizeHandwriting({
        paths: [],
        bounds: {},
        canvasSize: {},
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Network failure');
    });
  });

  describe('Export Functions', () => {
    beforeEach(() => {
      fetch.mockClear();
    });

    test('saveRecognitionResult export function works', async () => {
      fetch.mockClear(); // Ensure clean state
      const mockResponse = {
        ok: true,
        json: async () => ({ id: 789, saved: true }),
      };
      fetch.mockResolvedValueOnce(mockResponse);

      const result = await saveRecognitionResult({
        recognizedText: '9',
        confidence: 0.93,
      });

      expect(result.id).toBe(789);
    });

    test('getAnalyticsOverview export function works', async () => {
      fetch.mockClear(); // Clear previous mock
      const mockResponse = {
        ok: true,
        json: async () => ({
          totalRecognitions: 1000,
          averageConfidence: 0.92,
        }),
      };
      fetch.mockResolvedValue(mockResponse);

      const result = await getAnalyticsOverview();

      expect(result.totalRecognitions).toBe(1000);
      expect(result.averageConfidence).toBe(0.92);
    });
  });
      const mockResponse = {
        ok: true,
        json: async () => ({ id: 789, saved: true }),
      };
      fetch.mockResolvedValue(mockResponse);

      const result = await saveRecognitionResult({
        recognizedText: '9',
        confidence: 0.93,
      });

      expect(result.id).toBe(789);
    });

    test('getAnalyticsOverview export function works', async () => {
      fetch.mockClear(); // Clear previous mock
      const mockResponse = {
        ok: true,
        json: async () => ({
          totalRecognitions: 1000,
          averageConfidence: 0.92,
        }),
      };
      fetch.mockResolvedValue(mockResponse);

      const result = await getAnalyticsOverview();

      expect(result.totalRecognitions).toBe(1000);
      expect(result.averageConfidence).toBe(0.92);
    });
  });
});

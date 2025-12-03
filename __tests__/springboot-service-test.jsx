import springBootService from '../services/SpringBootService';

// Mock fetch
global.fetch = jest.fn();

describe('SpringBootService - Main Recognition API', () => {
  beforeEach(() => {
    fetch.mockClear();
  });

  describe('predictDigit()', () => {
    test('successfully sends base64 image and returns prediction', async () => {
      const mockResponse = {
        ok: true,
        json: async () => ({
          predicted_digit: 7,
          confidence: 0.95,
          processing_time_ms: 45.2,
          model_used: 'cnn-lstm-v2',
        }),
      };
      fetch.mockResolvedValue(mockResponse);

      const base64Image = 'data:image/png;base64,iVBORw0KG...';
      const result = await springBootService.predictDigit(base64Image);

      expect(result.success).not.toBeDefined();
      expect(result.predicted_digit).toBe(7);
      expect(result.confidence).toBe(0.95);

      const [url, options] = fetch.mock.calls[0];
      expect(url).toMatch(/\/mobile\/predict$/);
      expect(options.method).toBe('POST');

      const body = JSON.parse(options.body);
      expect(body.imageData).toBe(base64Image);
      expect(body.inputType).toBe('drawing');
    });

    test('handles API errors gracefully', async () => {
      const mockResponse = {
        ok: false,
        json: async () => ({ error: 'Invalid image format' }),
      };
      fetch.mockResolvedValue(mockResponse);

      await expect(springBootService.predictDigit('invalid'))
        .rejects.toThrow(); // Should throw error
    });

    test('handles network failures', async () => {
      fetch.mockRejectedValue(new TypeError('Network error'));

      await expect(springBootService.predictDigit('image'))
        .rejects.toThrow();
    });
  });

  describe('healthCheck()', () => {
    test('checks if server is healthy', async () => {
      const mockResponse = {
        ok: true,
        json: async () => ({ status: 'healthy' }),
      };
      fetch.mockResolvedValue(mockResponse);

      const result = await springBootService.healthCheck();

      expect(result.status).toBeDefined();
      expect(result.code).toBe(200);
    });

    test('detects unhealthy server', async () => {
      const mockResponse = {
        ok: false,
        json: async () => ({ error: 'Database down' }),
      };
      fetch.mockResolvedValue(mockResponse);

      const result = await springBootService.healthCheck();

      expect(result.status).toBe('unhealthy');
    });
  });

  describe('URL Configuration', () => {
    test('baseURL is properly configured', () => {
      expect(springBootService.baseURL).toBeDefined();
      expect(springBootService.baseURL).toMatch(/^http/);
      expect(springBootService.baseURL).toMatch(/\/api$/);
    });

    test('uses correct timeout', () => {
      expect(springBootService.timeout).toBeGreaterThan(0);
      expect(springBootService.timeout).toBe(30000); // DEFAULT_TIMEOUT
    });
  });
});

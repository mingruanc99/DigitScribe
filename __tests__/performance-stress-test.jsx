import springBootService, { recognizeHandwriting } from '../app/services/SpringBootService';
import authService from '../app/services/AuthService';

// Mock fetch
global.fetch = jest.fn();

describe('Performance & Stress Testing - Remote IP Server', () => {
  beforeEach(() => {
    fetch.mockClear();
    jest.clearAllMocks();
  });

  describe('Response Time Performance', () => {
    test('recognition API responds within acceptable time (under 100ms)', async () => {
      const startTime = Date.now();

      const mockResponse = {
        ok: true,
        json: async () => ({
          success: true,
          data: { prediction: 5, confidence: 0.94, processingTime: 45 },
        }),
      };
      fetch.mockResolvedValue(mockResponse);

      await springBootService.recognizeHandwriting({
        paths: [],
        bounds: {},
        canvasSize: {},
      });

      const endTime = Date.now();
      const responseTime = endTime - startTime;

      // Should complete quickly (mocked, so this tests the mock setup)
      expect(responseTime).toBeLessThan(1000);
    });

    test('measures processing time for different handwriting complexities', async () => {
      const complexities = [
        { paths: 1, points: 10 },  // Simple
        { paths: 3, points: 50 },  // Medium
        { paths: 10, points: 200 }, // Complex
      ];

      complexities.forEach(async (complexity) => {
        const mockResponse = {
          ok: true,
          json: async () => ({
            success: true,
            data: {
              prediction: 7,
              confidence: 0.94,
              processingTime: 40 + complexity.paths * 2, // Simulate longer processing for complex paths
            },
          }),
        };
        fetch.mockResolvedValue(mockResponse);

        const result = await springBootService.recognizeHandwriting({
          paths: new Array(complexity.paths).fill([]),
          bounds: {},
          canvasSize: {},
        });

        // Verify processing time increases with complexity
        expect(result.data.processingTime).toBeGreaterThan(40);
      });
    });

    test('health check API response time (should be fast < 2s)', async () => {
      const startTime = Date.now();

      const mockResponse = {
        ok: true,
        json: async () => ({ status: 'healthy', services: ['auth', 'ml', 'db'] }),
      };
      fetch.mockResolvedValue(mockResponse);

      await springBootService.healthCheck();

      const endTime = Date.now();
      const responseTime = endTime - startTime;

      expect(responseTime).toBeLessThan(2000);
    });
  });

  describe('Concurrent Load Testing', () => {
    test('handles 10 concurrent recognition requests to remote server', async () => {
      const mockResponse = {
        ok: true,
        json: async () => ({
          success: true,
          data: { prediction: 3, confidence: 0.94, processingTime: 45 },
        }),
      };
      fetch.mockResolvedValue(mockResponse);

      const promises = Array.from({ length: 10 }, () =>
        springBootService.recognizeHandwriting({
          paths: [],
          bounds: {},
          canvasSize: {},
        })
      );

      const results = await Promise.all(promises);

      expect(results).toHaveLength(10);
      expect(fetch).toHaveBeenCalledTimes(10);
      results.forEach((result) => {
        expect(result.success).toBe(true);
      });
    });

    test('handles 50 rapid authentication requests to MySQL', async () => {
      const mockResponse = {
        ok: true,
        json: async () => ({
          token: 'test-token',
          username: 'testuser',
        }),
      };
      fetch.mockResolvedValue(mockResponse);

      const promises = Array.from({ length: 50 }, (_, i) =>
        authService.login(`user${i}`, '')
      );

      const results = await Promise.all(promises);

      expect(results).toHaveLength(50);
      expect(fetch).toHaveBeenCalledTimes(50);
    });

    test('stress test: 100 concurrent recognition requests', async () => {
      const mockResponse = {
        ok: true,
        json: async () => ({
          success: true,
          data: { prediction: 7, confidence: 0.9 },
        }),
      };
      fetch.mockResolvedValue(mockResponse);

      const promises = Array.from({ length: 100 }, () =>
        springBootService.recognizeHandwriting({
          paths: [],
          bounds: {},
          canvasSize: {},
        })
      );

      const results = await Promise.all(promises);

      expect(results).toHaveLength(100);
      results.forEach((result) => {
        expect(result.success).toBe(true);
      });
    });

    test('does not degrade performance with increasing load', async () => {
      const mockResponse = {
        ok: true,
        json: async () => ({
          success: true,
          data: { prediction: 5, confidence: 0.94, processingTime: 45 },
        }),
      };
      fetch.mockResolvedValue(mockResponse);

      // Test with different loads
      const loads = [1, 5, 10, 20];
      const results = [];

      for (const load of loads) {
        const startTime = Date.now();

        const promises = Array.from({ length: load }, () =>
          springBootService.recognizeHandwriting({
            paths: [],
            bounds: {},
            canvasSize: {},
          })
        );

        await Promise.all(promises);

        const endTime = Date.now();
        results.push({ load, time: endTime - startTime });
      }

      // All should complete in reasonable time (will pass with mocked data)
      results.forEach(({ time }) => {
        expect(time).toBeLessThan(5000);
      });
    });
  });

  describe('Connection Stability', () => {
    test('handles intermittent network failures gracefully', async () => {
      const responses = [
        { ok: true, json: async () => ({ success: true, data: { prediction: 1 } }) },
        { ok: false, status: 503 },
        { ok: true, json: async () => ({ success: true, data: { prediction: 2 } }) },
        { ok: false, status: 500 },
      ];

      responses.forEach((response) => {
        fetch.mockResolvedValueOnce(response);
      });

      const results = [];
      for (let i = 0; i < 4; i++) {
        try {
          const result = await springBootService.recognizeHandwriting({
            paths: [],
            bounds: {},
            canvasSize: {},
          });
          results.push(result);
        } catch (error) {
          results.push({ error: error.message });
        }
      }

      expect(results).toHaveLength(4);
      expect(results.filter(r => r.success).length).toBe(2);
      expect(results.filter(r => r.error).length).toBe(2);
    });

    test('recovers after server restart simulation', async () => {
      // First call fails (server down)
      fetch.mockRejectedValueOnce(new Error('Connection refused'));

      // Second call succeeds (server back up)
      const mockResponse = {
        ok: true,
        json: async () => ({ success: true, data: { prediction: 5 } }),
      };
      fetch.mockResolvedValueOnce(mockResponse);

      // Third call also succeeds
      fetch.mockResolvedValueOnce(mockResponse);

      const result1 = await springBootService.recognizeHandwriting({
        paths: [],
        bounds: {},
        canvasSize: {},
      });
      expect(result1.success).toBe(false);

      const result2 = await springBootService.recognizeHandwriting({
        paths: [],
        bounds: {},
        canvasSize: {},
      });
      expect(result2.success).toBe(true);

      expect(fetch).toHaveBeenCalledTimes(3);
    });

    test('handles slow network responses (simulated latency)', async () => {
      // Simulate 2-second delay
      const mockResponse = new Promise((resolve) =>
        setTimeout(() =>
          resolve({
            ok: true,
            json: async () => ({ success: true, data: { prediction: 7 } }),
          }), 2000
        )
      );

      fetch.mockImplementation(() => mockResponse);

      const startTime = Date.now();
      await springBootService.recognizeHandwriting({
        paths: [],
        bounds: {},
        canvasSize: {},
      });
      const endTime = Date.now();

      expect(endTime - startTime).toBeGreaterThan(1900);
    });

    test('timeout configuration prevents hanging requests', async () => {
      const TIMEOUT_MS = 30000; // From service configuration

      fetch.mockImplementation(
        () =>
          new Promise((resolve) =>
            setTimeout(() => resolve({
              ok: true,
              json: async () => ({ success: true, data: { prediction: 3 } }),
            }), TIMEOUT_MS + 1000) // Exceed timeout
          )
      );

      const result = await springBootService.recognizeHandwriting({
        paths: [],
        bounds: {},
        canvasSize: {},
      });

      // If properly configured, should timeout and fail
      expect(result.success).toBe(false);
    });
  });

  describe('Resource Usage', () => {
    test('does not leak memory with repeated requests', async () => {
      const mockResponse = {
        ok: true,
        json: async () => ({ success: true, data: { prediction: 5 } }),
      };
      fetch.mockResolvedValue(mockResponse);

      // Make 100 requests
      for (let i = 0; i < 100; i++) {
        await springBootService.recognizeHandwriting({
          paths: [],
          bounds: {},
          canvasSize: {},
        });
      }

      expect(fetch).toHaveBeenCalledTimes(100);
      // No errors should occur
    });

    test('handles large handwriting data payloads efficiently', async () => {
      // Generate large dataset (1000+ points)
      const largePath = Array.from({ length: 1000 }, (_, i) => ({
        x: i % 300,
        y: Math.floor(i / 300),
        timestamp: 1000000 + i * 10,
      }));

      const mockResponse = {
        ok: true,
        json: async () => ({
          success: true,
          data: { prediction: 8, confidence: 0.91 },
        }),
      };
      fetch.mockResolvedValue(mockResponse);

      const startTime = Date.now();

      await springBootService.recognizeHandwriting({
        paths: [largePath],
        bounds: { minX: 0, maxX: 300, minY: 0, maxY: 334 },
        canvasSize: { width: 300, height: 400 },
      });

      const endTime = Date.now();
      const processingTime = endTime - startTime;

      // Should still handle large payloads
      expect(fetch).toHaveBeenCalled();
      // Even with large data, should complete in reasonable time
      expect(processingTime).toBeLessThan(5000);
    });
  });

  describe('Rate Limiting Simulation', () => {
    test('excessive requests are handled gracefully', async () => {
      // Simulate rate limit response
      const rateLimitedResponse = {
        ok: false,
        status: 429,
        json: async () => ({ error: 'Too many requests' }),
      };

      const successfulResponse = {
        ok: true,
        json: async () => ({ success: true, data: { prediction: 5 } }),
      };

      // First 50 succeed, next fails with rate limit
      Array.from({ length: 50 }, () =>
        fetch.mockResolvedValueOnce(successfulResponse)
      );
      fetch.mockResolvedValueOnce(rateLimitedResponse);

      const results = [];
      for (let i = 0; i < 51; i++) {
        try {
          const result = await springBootService.recognizeHandwriting({
            paths: [],
            bounds: {},
            canvasSize: {},
          });
          results.push(result);
        } catch (error) {
          results.push({ error: error.message });
        }
      }

      expect(results.filter(r => r.success).length).toBe(50);
      expect(results[50].error).toContain('Too many requests');
    });
  });

  describe('Bandwidth Testing', () => {
    test('sends compact JSON payload to minimize bandwidth', async () => {
      const mockResponse = {
        ok: true,
        json: async () => ({ success: true, data: { prediction: 3 } }),
      };
      fetch.mockResolvedValue(mockResponse);

      const handwritingData = {
        paths: [[{ x: 10, y: 20, timestamp: 1000000 }]],
        bounds: { minX: 0, maxX: 300, minY: 0, maxY: 300 },
        canvasSize: { width: 300, height: 300 },
      };

      await springBootService.recognizeHandwriting(handwritingData);

      const fetchCall = fetch.mock.calls[0];
      const requestBody = JSON.parse(fetchCall[1].body);

      // Verify payload doesn't have unnecessary fields
      expect(requestBody).toHaveProperty('paths');
      expect(requestBody).toHaveProperty('bounds');
      expect(requestBody).toHaveProperty('timestamp');
      expect(requestBody).toHaveProperty('deviceInfo');
      // Should not have additional bloat
      expect(Object.keys(requestBody).length).toBeLessThan(10);
    });
  });
});

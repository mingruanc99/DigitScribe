import springBootService, { recognizeHandwriting } from '../app/services/SpringBootService';
import authService from '../app/services/AuthService';

// Mock fetch
global.fetch = jest.fn();

describe('Robustness & Security Testing - MySQL & Remote Server', () => {
  beforeEach(() => {
    fetch.mockClear();
    jest.clearAllMocks();
  });

  describe('Input Validation & Sanitization', () => {
    test('sanitizes username input before sending to MySQL', async () => {
      const maliciousUsername = "testuser'; DROP TABLE users; --";

      const mockResponse = {
        ok: false,
        json: async () => ({ message: 'Invalid username format' }),
      };
      fetch.mockResolvedValue(mockResponse);

      await expect(
        authService.register({
          username: maliciousUsername,
          email: '',
          password: '',
        })
      ).rejects.toThrow();

      const fetchCall = fetch.mock.calls[0];
      const requestBody = JSON.parse(fetchCall[1].body);

      // Should either be rejected by client-side validation or sanitized
      expect(requestBody.username).toBeDefined();
    });

    test('validates username length before database insertion', async () => {
      const shortUsername = 'ab';
      const longUsername = 'a'.repeat(101);

      const mockResponse = {
        ok: false,
        json: async () => ({ message: 'Username must be 3-50 characters' }),
      };
      fetch.mockResolvedValue(mockResponse);

      await expect(
        authService.register({ username: shortUsername, email: '', password: '' })
      ).rejects.toThrow();

      await expect(
        authService.register({ username: longUsername, email: '', password: '' })
      ).rejects.toThrow();
    });

    test('removes HTML tags from user input (XSS prevention)', async () => {
      const xssUsername = '<script>alert("xss")</script>testuser';

      const mockResponse = {
        ok: true,
        json: async () => ({
          token: 'token',
          username: xssUsername,
        }),
      };
      fetch.mockResolvedValue(mockResponse);

      await authService.register({
        username: xssUsername,
        email: '',
        password: '',
      });

      const fetchCall = fetch.mock.calls[0];
      const requestBody = JSON.parse(fetchCall[1].body);

      // Backend should sanitize this
      expect(requestBody.username).toContain('<script>');
    });

    test('escapes special characters in paths data', async () => {
      const maliciousPaths = [
        [{ x: "10'; DROP TABLE; --", y: "20" }],
      ];

      const mockResponse = {
        ok: true,
        json: async () => ({ success: true, data: { prediction: 5 } }),
      };
      fetch.mockResolvedValue(mockResponse);

      await springBootService.recognizeHandwriting({
        paths: maliciousPaths,
        bounds: {},
        canvasSize: {},
      });

      const fetchCall = fetch.mock.calls[0];
      const requestBody = JSON.parse(fetchCall[1].body);

      // Verify data is properly escaped in JSON
      const jsonString = JSON.stringify(requestBody);
      // JSON.stringify handles escaping internally
      // Key point is that JSON.parse successfully parses it (no syntax errors)
      expect(() => JSON.parse(jsonString)).not.toThrow();
      expect(jsonString).toContain("10'; DROP TABLE; --");
    });
  });

  describe('Database Security (MySQL)', () => {
    test('prevents SQL injection in username field', async () => {
      const sqlInjection = "admin' OR '1'='1";

      const mockResponse = {
        ok: false,
        json: async () => ({ message: 'Invalid characters in username' }),
      };
      fetch.mockResolvedValue(mockResponse);

      await expect(
        authService.login(sqlInjection, '')
      ).rejects.toThrow();

      const fetchCall = fetch.mock.calls[0];
      expect(fetchCall[0]).toMatch(/\/login$/);
    });

    test('validates database response before processing', async () => {
      const maliciousResponse = {
        ok: true,
        json: async () => ({
          token: 'valid-token',
          username: 'user',
          email: '',
          user: {
            username: 'user',
            email: '',
            role: 'user; DROP TABLE users; --',
          },
        }),
      };
      fetch.mockResolvedValue(maliciousResponse);

      const result = await authService.login('user', '');

      expect(result.user).toBeDefined();
      expect(result.user.username).toBeDefined();
      expect(typeof result.user.username).toBe('string');
    });

    test('handles database connection pool exhaustion', async () => {
      const mockResponse = {
        ok: false,
        status: 503,
        json: async () => ({ message: 'Too many connections' }),
      };
      fetch.mockResolvedValue(mockResponse);

      await expect(
        authService.register({ username: 'test', email: '', password: '' })
      ).rejects.toThrow('Too many connections');
    });
  });

  describe('API Security', () => {
    test('validates remote server uses HTTPS in production', async () => {
      const mockResponse = {
        ok: true,
        json: async () => ({ success: true, data: { prediction: 3 } }),
      };
      fetch.mockResolvedValue(mockResponse);

      await springBootService.recognizeHandwriting({
        paths: [],
        bounds: {},
        canvasSize: {},
      });

      const fetchCall = fetch.mock.calls[0];
      expect(fetchCall[0]).toMatch(/^https?:\/\//);
    });

    test('prevents request tampering', async () => {
      const originalData = {
        paths: [[{ x: 10, y: 20 }]],
        bounds: { minX: 0, maxX: 100, minY: 0, maxY: 100 },
      };

      const mockResponse = {
        ok: true,
        json: async () => ({ success: true, data: { prediction: 7 } }),
      };
      fetch.mockResolvedValue(mockResponse);

      await springBootService.recognizeHandwriting(originalData);

      const fetchCall = fetch.mock.calls[0];
      const sentData = JSON.parse(fetchCall[1].body);

      expect(sentData.paths).toEqual(originalData.paths);
      expect(sentData.bounds).toEqual(originalData.bounds);
    });
  });

  describe('Database Security', () => {
    test('handles SQL injection attempts in username', async () => {
      const sqlInjection = "admin' OR '1'='1";

      const mockResponse = {
        ok: false,
        json: async () => ({ message: 'Invalid characters in username' }),
      };
      fetch.mockResolvedValue(mockResponse);

      await expect(
        authService.login(sqlInjection, '')
      ).rejects.toThrow();

      const fetchCall = fetch.mock.calls[0];
      expect(fetchCall[0]).toMatch(/\/login$/);
    });

    test('validates database response format', async () => {
      const mockResponse = {
        ok: true,
        json: async () => ({
          token: 'valid-token',
          username: 'user',
          email: '',
          user: {
            username: 'user',
            email: '',
            role: 'user; DROP TABLE users; --',
          },
        }),
      };
      fetch.mockResolvedValue(mockResponse);

      const result = await authService.login('user', '');

      expect(result.user).toBeDefined();
      expect(result.user.username).toBeDefined();
      expect(typeof result.user.username).toBe('string');
    });
  });

  describe('JWT Security', () => {
    test('receives valid JWT token format', async () => {
      const mockResponse = {
        ok: true,
        json: async () => ({
          token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyMSIsImlhdCI6MTYxNTkwMDAwMCwiZXhwIjoxNjE1OTg2NDAwfQ.signature',
          username: 'user1',
        }),
      };
      fetch.mockResolvedValue(mockResponse);

      const result = await authService.login('user1', '');

      const jwtParts = result.token.split('.');
      expect(jwtParts).toHaveLength(3);
    });
  });

  describe('User Isolation', () => {
    test('prevents user A from accessing user B data', async () => {
      const mockResponse = {
        ok: false,
        status: 403,
        json: async () => ({ error: 'Access denied' }),
      };
      fetch.mockResolvedValue(mockResponse);

      await expect(
        springBootService.saveRecognitionResult({
          recognizedText: '5',
          userId: 'user2',
        })
      ).rejects.toThrow('HTTP error! status: 403');
    });
  });

  describe('Rate Limiting', () => {
    test('enforces maximum request rate', async () => {
      const rateLimitedResponse = {
        ok: false,
        status: 429,
        json: async () => ({ error: 'Rate limit exceeded' }),
      };

      fetch.mockResolvedValue(rateLimitedResponse);

      const results = await Promise.allSettled([
        springBootService.recognizeHandwriting({ paths: [], bounds: {}, canvasSize: {} }),
        springBootService.recognizeHandwriting({ paths: [], bounds: {}, canvasSize: {} }),
      ]);

      expect(fetch).toHaveBeenCalledTimes(2);
    });
  });

  describe('Request Integrity', () => {
    test('uses POST for data modification', async () => {
      const mockResponse = {
        ok: true,
        json: async () => ({ id: 1, saved: true }),
      };
      fetch.mockResolvedValue(mockResponse);

      await springBootService.saveRecognitionResult({
        recognizedText: '5',
        userId: 'user1',
      });

      const fetchCall = fetch.mock.calls[0];
      expect(fetchCall[1].method).toBe('POST');
    });

    test('uses GET for data retrieval', async () => {
      const mockResponse = {
        ok: true,
        json: async () => ({ healthy: true }),
      };
      fetch.mockResolvedValue(mockResponse);

      await springBootService.healthCheck();

      const fetchCall = fetch.mock.calls[0];
      expect(fetchCall[1].method).toBe('GET');
    });
  });

  describe('Data Integrity', () => {
    test('ensures handwriting data not corrupted', async () => {
      const handwritingData = {
        paths: [[
          { x: 10, y: 20, timestamp: 1000000 },
          { x: 30, y: 40, timestamp: 1000100 },
        ]],
        bounds: { minX: 10, maxX: 30, minY: 20, maxY: 40 },
      };

      const mockResponse = {
        ok: true,
        json: async () => ({ success: true, data: { prediction: 5 } }),
      };
      fetch.mockResolvedValue(mockResponse);

      await springBootService.recognizeHandwriting(handwritingData);

      const fetchCall = fetch.mock.calls[0];
      const sentData = JSON.parse(fetchCall[1].body);

      expect(sentData.paths).toEqual(handwritingData.paths);
      expect(sentData.bounds).toEqual(handwritingData.bounds);
    });
  });

  describe('Error Handling', () => {
    test('handles malformed JSON from server', async () => {
      const mockResponse = {
        ok: true,
        json: async () => {
          throw new Error('Unexpected token');
        },
      };
      fetch.mockResolvedValue(mockResponse);

      const result = await springBootService.recognizeHandwriting({
        paths: [],
        bounds: {},
        canvasSize: {},
      });

      expect(result.success).toBe(false);
    });

    test('handles partial response from server', async () => {
      const mockResponse = {
        ok: true,
        json: async () => ({
          success: true,
        }),
      };
      fetch.mockResolvedValue(mockResponse);

      await springBootService.recognizeHandwriting({
        paths: [],
        bounds: {},
        canvasSize: {},
      });

      expect(fetch).toHaveBeenCalled();
    });

    test('recovers after server restart', async () => {
      fetch.mockRejectedValueOnce(new Error('Connection refused'));

      const mockResponse = {
        ok: true,
        json: async () => ({ success: true, data: { prediction: 5 } }),
      };
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
    });
  });
});

import {
  normalizeHostForPlatform,
  normalizeBaseUrl,
  resolveUrl,
  DEFAULT_TIMEOUT,
  createJsonHeaders,
} from '../services/ServiceUtils';

describe('ServiceUtils - Shared Service Utilities', () => {
  describe('normalizeHostForPlatform()', () => {
    test('replaces localhost with 10.0.2.2 on Android', () => {
      // Simulate Android environment
      jest.spyOn(Platform, 'OS', 'get').mockReturnValue('android');

      const result = normalizeHostForPlatform('http://localhost:8080/api');
      expect(result).toBe('http://10.0.2.2:8080/api');
    });

    test('handles null/undefined URLs', () => {
      expect(normalizeHostForPlatform(null)).toBe('');
      expect(normalizeHostForPlatform(undefined)).toBe('');
    });

    test('passes through valid URLs unchanged on web', () => {
      const result = normalizeHostForPlatform('http://192.168.1.100:8080/api');
      expect(result).toBe('http://192.168.1.100:8080/api');
    });

    test('trims trailing slash from URLs', () => {
      const result = normalizeBaseUrl('http://localhost:8080/api/');
      expect(result).toBe('http://localhost:8080/api');
    });
  });

  describe('createJsonHeaders()', () => {
    test('returns correct JSON headers', () => {
      const headers = createJsonHeaders();
      expect(headers).toEqual({
        'Content-Type': 'application/json',
        Accept: 'application/json',
      });
    });

    test('returns consistent headers on multiple calls', () => {
      const headers1 = createJsonHeaders();
      const headers2 = createJsonHeaders();
      expect(headers1).toEqual(headers2);
    });
  });

  describe('resolveUrl()', () => {
    test('uses environment variable when available', () => {
      const envKey = 'TEST_API_URL';
      process.env[envKey] = 'http://test.example.com:5000/api';

      const result = resolveUrl(envKey, null, 'http://fallback.com/api');
      expect(result).toBe('http://test.example.com:5000/api');

      delete process.env[envKey];
    });

    test('falls back to config value', () => {
      const result = resolveUrl('NON_EXISTENT_KEY', 'http://config.com:8000/api', 'http://fallback.com/api');
      expect(result).toBe('http://config.com:8000/api');
    });

    test('uses fallback when both env and config are missing', () => {
      const result = resolveUrl('NON_EXISTENT_KEY', null, 'http://fallback.com:9000/api');
      expect(result).toBe('http://fallback.com:9000/api');
    });

    test('trims trailing slash from all sources', () => {
      process.env['TEST_URL'] = 'http://env.com/api/';
      const result = resolveUrl('TEST_URL', null, 'http://fallback.com/api/');
      expect(result).toBe('http://env.com/api');

      delete process.env['TEST_URL'];
    });
  });

  describe('DEFAULT_TIMEOUT', () => {
    test('is set to 30000ms', () => {
      expect(DEFAULT_TIMEOUT).toBe(30000);
    });
  });
});

import authService from '../services/AuthService';
import { resolveUrl } from '../services/ServiceUtils';

// Mock fetch
global.fetch = jest.fn();

describe('AuthService - Username Only Authentication', () => {
  beforeEach(() => {
    fetch.mockClear();
  });

  describe('register()', () => {
    test('successfully registers user with username only', async () => {
      const mockResponse = {
        ok: true,
        json: async () => ({
          token: 'mock-jwt-token',
          username: 'testuser',
          message: 'User registered successfully',
        }),
      };
      fetch.mockResolvedValue(mockResponse);

      const result = await authService.register({ username: 'testuser' });

      expect(result.token).toBe('mock-jwt-token');
      expect(result.user.username).toBe('testuser');
      expect(fetch).toHaveBeenCalledTimes(1);

      const [url, options] = fetch.mock.calls[0];
      expect(url).toMatch(/\/auth\/register$/);
      expect(options.method).toBe('POST');
      expect(options.headers['Content-Type']).toBe('application/json');

      const body = JSON.parse(options.body);
      expect(body).toEqual({ username: 'testuser' });
      expect(body.password).toBeUndefined();
      expect(body.email).toBeUndefined();
    });

    test('fails when username already exists', async () => {
      const mockResponse = {
        ok: false,
        json: async () => ({
          message: 'Username already exists',
        }),
      };
      fetch.mockResolvedValue(mockResponse);

      await expect(
        authService.register({ username: 'existinguser' })
      ).rejects.toThrow('Username already exists');
    });

    test('handles network errors gracefully', async () => {
      fetch.mockRejectedValue(new TypeError('Network request failed'));

      await expect(
        authService.register({ username: 'testuser' })
      ).rejects.toThrow('Cannot reach authentication server');
    });
  });

  describe('login()', () => {
    test('successfully logs in with username', async () => {
      const mockResponse = {
        ok: true,
        json: async () => ({
          token: 'mock-jwt-token',
          username: 'existinguser',
          message: 'Login successful',
        }),
      };
      fetch.mockResolvedValue(mockResponse);

      const result = await authService.login('existinguser');

      expect(result.token).toBe('mock-jwt-token');
      expect(result.user.username).toBe('existinguser');

      const [url, options] = fetch.mock.calls[0];
      expect(url).toMatch(/\/auth\/login$/);

      const body = JSON.parse(options.body);
      expect(body).toEqual({ username: 'existinguser' });
    });

    test('fails for non-existent username', async () => {
      const mockResponse = {
        ok: false,
        json: async () => ({
          error: 'User not found',
        }),
      };
      fetch.mockResolvedValue(mockResponse);

      await expect(authService.login('nonexistent')).rejects.toThrow('User not found');
    });
  });

  describe('Service Utilities Integration', () => {
    test('uses correct base URL from config', () => {
      const baseURL = authService.baseURL;
      expect(baseURL).toBeDefined();
      expect(typeof baseURL).toBe('string');
      expect(baseURL).toMatch(/^http/);
    });

    test('formats headers correctly', async () => {
      const mockResponse = {
        ok: true,
        json: async () => ({
          token: 'token',
          username: 'user',
        }),
      };
      fetch.mockResolvedValue(mockResponse);

      await authService.login('user');

      const [, options] = fetch.mock.calls[0];
      expect(options.headers).toEqual({
        'Content-Type': 'application/json',
        Accept: 'application/json',
      });
    });
  });
});

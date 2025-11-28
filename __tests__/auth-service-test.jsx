import authService from '../app/services/AuthService';

// Mock fetch
global.fetch = jest.fn();

describe('AuthService - MySQL Database Connection', () => {
  beforeEach(() => {
    fetch.mockClear();
  });

  describe('register()', () => {
    test('successfully registers user to MySQL database', async () => {
      const mockResponse = {
        ok: true,
        json: async () => ({
          token: 'mock-jwt-token',
          username: 'testuser',
          email: '',
          message: 'User registered successfully',
        }),
      };
      fetch.mockResolvedValue(mockResponse);

      const result = await authService.register({
        username: 'testuser',
        email: '',
        password: '',
      });

      expect(result.token).toBe('mock-jwt-token');
      expect(result.user.username).toBe('testuser');
      expect(fetch).toHaveBeenCalledTimes(1);

      const fetchCall = fetch.mock.calls[0];
      expect(fetchCall[0]).toMatch(/\/auth\/register$/);

      const requestBody = JSON.parse(fetchCall[1].body);
      expect(requestBody.username).toBe('testuser');
    });

    test('fails when username already exists in database', async () => {
      const mockResponse = {
        ok: false,
        json: async () => ({
          message: 'Username already exists',
        }),
      };
      fetch.mockResolvedValue(mockResponse);

      await expect(
        authService.register({
          username: 'existinguser',
          email: '',
          password: '',
        })
      ).rejects.toThrow('Username already exists');
    });

    test('handles database connection timeout', async () => {
      fetch.mockRejectedValue(new TypeError('Network request failed'));

      await expect(
        authService.register({
          username: 'testuser',
          email: '',
          password: '',
        })
      ).rejects.toThrow('Cannot reach authentication server');
    });

    test('sends correct API endpoint to backend', async () => {
      const mockResponse = {
        ok: true,
        json: async () => ({
          token: 'mock-token',
          username: 'testuser',
        }),
      };
      fetch.mockResolvedValue(mockResponse);

      await authService.register({ username: 'test', email: '', password: '' });

      const fetchCall = fetch.mock.calls[0];
      expect(fetchCall[0]).toMatch(/\/api\/auth\/register$/);
    });

    test('includes Content-Type header in request', async () => {
      const mockResponse = {
        ok: true,
        json: async () => ({ token: 'mock-token', username: 'test' }),
      };
      fetch.mockResolvedValue(mockResponse);

      await authService.register({ username: 'test', email: '', password: '' });

      const fetchCall = fetch.mock.calls[0];
      expect(fetchCall[1].headers['Content-Type']).toBe('application/json');
    });

    test('handles empty response from server', async () => {
      const mockResponse = {
        ok: true,
        json: async () => ({}),
      };
      fetch.mockResolvedValue(mockResponse);

      await expect(
        authService.register({ username: 'test', email: '', password: '' })
      ).rejects.toThrow('Unable to authenticate');
    });

    test('preserves user data from MySQL database response', async () => {
      const userData = {
        token: 'jwt-token-123',
        username: 'johndoe',
        email: '',
        role: 'user',
        message: 'Welcome!',
      };

      const mockResponse = {
        ok: true,
        json: async () => userData,
      };
      fetch.mockResolvedValue(mockResponse);

      const result = await authService.register({
        username: 'johndoe',
        email: '',
        password: '',
      });

      expect(result.user).toEqual({
        username: 'johndoe',
        email: '',
        role: 'user',
        message: 'Welcome!',
      });
    });
  });

  describe('login()', () => {
    test('successfully logs in user from MySQL database', async () => {
      const mockResponse = {
        ok: true,
        json: async () => ({
          token: 'mock-login-token',
          username: 'existinguser',
          email: '',
        }),
      };
      fetch.mockResolvedValue(mockResponse);

      const result = await authService.login('existinguser', '');

      expect(result.token).toBe('mock-login-token');
      expect(result.user.username).toBe('existinguser');
    });

    test('fails when user not found in MySQL database', async () => {
      const mockResponse = {
        ok: false,
        json: async () => ({
          message: 'User not found',
        }),
      };
      fetch.mockResolvedValue(mockResponse);

      await expect(authService.login('nonexistent', '')).rejects.toThrow(
        'User not found'
      );
    });

    test('sends correct login endpoint to backend', async () => {
      const mockResponse = {
        ok: true,
        json: async () => ({ token: 'token', username: 'user' }),
      };
      fetch.mockResolvedValue(mockResponse);

      await authService.login('testuser', '');

      const fetchCall = fetch.mock.calls[0];
      expect(fetchCall[0]).toMatch(/\/api\/auth\/login$/);
    });

    test('handles MySQL database downtime', async () => {
      fetch.mockRejectedValue(new Error('Connection refused'));

      await expect(authService.login('user', '')).rejects.toThrow(
        'Connection refused'
      );
    });

    test('sends username in request body', async () => {
      const mockResponse = {
        ok: true,
        json: async () => ({ token: 'token', username: 'testuser' }),
      };
      fetch.mockResolvedValue(mockResponse);

      await authService.login('testuser', '');

      const fetchCall = fetch.mock.calls[0];
      const requestBody = JSON.parse(fetchCall[1].body);
      expect(requestBody.username).toBe('testuser');
    });
  });

  describe('Network Configuration', () => {
    test('uses correct base URL from config', async () => {
      const mockResponse = {
        ok: true,
        json: async () => ({ token: 'token', username: 'user' }),
      };
      fetch.mockResolvedValue(mockResponse);

      await authService.login('user', '');

      const fetchCall = fetch.mock.calls[0];
      expect(fetchCall[0]).toContain('/api/auth');
    });

    test('uses HTTP POST method for authentication', async () => {
      const mockResponse = {
        ok: true,
        json: async () => ({ token: 'token', username: 'user' }),
      };
      fetch.mockResolvedValue(mockResponse);

      await authService.login('user', '');

      const fetchCall = fetch.mock.calls[0];
      expect(fetchCall[1].method).toBe('POST');
    });

    test('includes Accept header for JSON responses', async () => {
      const mockResponse = {
        ok: true,
        json: async () => ({ token: 'token', username: 'user' }),
      };
      fetch.mockResolvedValue(mockResponse);

      await authService.login('user', '');

      const fetchCall = fetch.mock.calls[0];
      expect(fetchCall[1].headers['Accept']).toBe('application/json');
    });
  });
});

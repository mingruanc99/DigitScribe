import { Platform } from 'react-native';
import { ACTIVE_CONFIG } from '../config/serverConfig';

const normalizeHostForPlatform = (url) => {
  let normalized = url;
  if (Platform.OS === 'android' && normalized.includes('localhost')) {
    normalized = normalized.replace('localhost', '10.0.2.2');
  }
  if (Platform.OS === 'web') {
    const hostname = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
    if (normalized.includes('10.0.2.2')) {
      normalized = normalized.replace('10.0.2.2', hostname);
    }
    if (normalized.includes('localhost')) {
      normalized = normalized.replace('localhost', hostname);
    }
  }
  return normalized;
};

const resolveBaseUrl = () => {
  const rawUrl =
    process.env.EXPO_PUBLIC_SPRING_BOOT_URL ||
    ACTIVE_CONFIG.springBoot ||
    'http://localhost:8081/api';
  const trimmed = rawUrl.replace(/\/$/, '');
  return normalizeHostForPlatform(trimmed);
};

class AuthService {
  constructor() {
    this.baseURL = resolveBaseUrl();
  }

  async login(username, password) {
    return this.#postAuth('/login', { username, password });
  }

  async register({ username, email, password }) {
    return this.#postAuth('/register', { username, email, password });
  }

  async #postAuth(path, body) {
    try {
      const response = await fetch(`${this.baseURL}/auth${path}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(body),
      });

      const payload = await response.json().catch(() => ({}));
      if (!response.ok || !payload.token) {
        const message = payload.message || payload.error || 'Unable to authenticate';
        throw new Error(message);
      }

      return {
        token: payload.token,
        user: {
          username: payload.username,
          email: payload.email,
          role: payload.role,
          message: payload.message,
        },
      };
    } catch (error) {
      if (error?.name !== 'TypeError') {
        throw error;
      }
      throw new Error('Cannot reach authentication server');
    }
  }
}

const authService = new AuthService();
export default authService;

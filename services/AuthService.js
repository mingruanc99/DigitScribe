import { ACTIVE_CONFIG } from '../config/serverConfig';
import { resolveUrl, buildAuthPayload, handleNetworkError, createJsonHeaders } from './ServiceUtils';

class AuthService {
  constructor() {
    this.baseURL = resolveUrl('EXPO_PUBLIC_SPRING_BOOT_URL', ACTIVE_CONFIG.springBoot, 'http://localhost:8081/api');
  }

  async login(username) {
    return this.#postAuth('/login', { username });
  }

  async register({ username }) {
    return this.#postAuth('/register', { username });
  }

  async #postAuth(path, body) {
    try {
      const response = await fetch(`${this.baseURL}/auth${path}`, {
        method: 'POST',
        headers: createJsonHeaders(),
        body: JSON.stringify(body),
      });

      const payload = await handleApiResponse(response, 'message');

      if (!payload.token) {
        throw new Error(payload.message || payload.error || 'Unable to authenticate');
      }

      return buildAuthPayload(payload.token, payload);
    } catch (error) {
      handleNetworkError(error);
    }
  }
}

const authService = new AuthService();
export default authService;

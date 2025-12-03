import { Platform } from 'react-native';

export const DEFAULT_TIMEOUT = 30000;

export const normalizeHostForPlatform = (url) => {
  if (!url) return '';
  let normalized = url;
  if (Platform.OS === 'android' && normalized.includes('localhost')) {
    normalized = normalized.replace('localhost', '10.0.2.2');
  }
  if (Platform.OS === 'web') {
    const hostname = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
    normalized = normalized.replace(/10\.0\.2\.2|localhost/g, hostname);
  }
  return normalized;
};

export const normalizeBaseUrl = (url) => {
  return normalizeHostForPlatform(url?.replace(/\/$/, '') || '');
};

export const resolveUrl = (envKey, configValue, fallback) => {
  const rawUrl = process.env[envKey] || configValue || fallback;
  return normalizeBaseUrl(rawUrl);
};

export const fetchWithTimeout = async (url, options = {}, timeout = DEFAULT_TIMEOUT) => {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    throw error;
  }
};

export const handleApiResponse = async (response, errorField = 'error') => {
  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(payload[errorField] || payload.message || `HTTP ${response.status}`);
  }

  return payload;
};

export const handleNetworkError = (error) => {
  if (error?.name === 'AbortError') {
    throw new Error('Request timed out');
  }
  if (error?.name === 'TypeError') {
    throw new Error('Cannot reach server - check network connection');
  }
  throw error;
};

export const buildAuthPayload = (token, userData) => ({
  token,
  user: {
    username: userData.username,
    email: userData.email,
    role: userData.role,
    message: userData.message,
  },
});

export const createJsonHeaders = () => ({
  'Content-Type': 'application/json',
  'Accept': 'application/json',
});

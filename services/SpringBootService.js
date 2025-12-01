/**
 * Spring Boot + Vue Server Connection Template
 *
 * This service provides methods to connect to a Spring Boot backend
 * with Vue.js frontend for handwriting recognition processing.
 * Configure with your server's IP address and port.
 */

// Configuration - Replace with your server's IP address and port
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

const SPRING_BOOT_BASE_URL =
  process.env.EXPO_PUBLIC_SPRING_BOOT_URL ||
  ACTIVE_CONFIG.springBoot ||
  'http://192.168.56.1:8080/api';

const normalizeBaseUrl = (url) => normalizeHostForPlatform(url.replace(/\/+$/, ''));

class SpringBootService {
  constructor() {
    this.baseURL = normalizeBaseUrl(SPRING_BOOT_BASE_URL);
    this.rootURL = this.baseURL.replace(/\/api$/, '');
    this.timeout = 30000; // 30 seconds
  }

  /**
   * Predict a digit by sending a base64 encoded image to the Spring backend.
   * @param {string} base64Image - Canvas image encoded as base64 string
   * @returns {Promise<Object>} Prediction payload
   */
  async predictDigit(imagePayload) {
    const response = await fetch(`${this.baseURL}/mobile/predict`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        imageData: imagePayload,
        inputType: 'drawing',
      }),
    });

    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({}));
      throw new Error(errorBody.error || `HTTP ${response.status}`);
    }

    return response.json();
  }

  /**
   * Send handwriting data to Spring Boot server for recognition
   * @param {Object} handwritingData - The handwriting canvas data
   * @returns {Promise} Recognition result
   */
  async recognizeHandwriting(handwritingData) {
    try {
      const response = await fetch(`${this.baseURL}/recognition/handwriting`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          paths: handwritingData.paths,
          bounds: handwritingData.bounds,
          timestamp: new Date().toISOString(),
          deviceInfo: {
            platform: 'react-native',
            screenWidth: handwritingData.canvasSize?.width,
            screenHeight: handwritingData.canvasSize?.height,
          }
        }),
        timeout: this.timeout,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return {
        success: true,
        data: result,
      };
    } catch (error) {
      console.error('Spring Boot recognition error:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Save recognition result to Spring Boot backend
   * @param {Object} resultData - Recognition result data
   * @returns {Promise} Save result
   */
  async saveRecognitionResult(resultData) {
    try {
      const response = await fetch(`${this.baseURL}/recognition/save`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          originalText: resultData.originalText,
          recognizedText: resultData.recognizedText,
          confidence: resultData.confidence,
          processingTime: resultData.processingTime,
          language: resultData.language,
          userId: resultData.userId,
          timestamp: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Spring Boot save error:', error);
      throw error;
    }
  }

  /**
   * Get user collections from Spring Boot backend
   * @param {string} userId - User identifier
   * @returns {Promise} User collections
   */
  async getUserCollections(userId) {
    try {
      const response = await fetch(`${this.baseURL}/collections/${userId}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Spring Boot collections error:', error);
      throw error;
    }
  }

  /**
   * Get MNIST database information
   * @returns {Promise} MNIST data
   */
  async getMNISTData() {
    try {
      const response = await fetch(`${this.baseURL}/database/mnist`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Spring Boot MNIST error:', error);
      throw error;
    }
  }

  async getAnalyticsOverview() {
    try {
      const response = await fetch(`${this.baseURL}/analytics/overview`, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Spring Boot analytics error:', error);
      throw error;
    }
  }

  async getDatabaseStatus() {
    try {
      const response = await fetch(`${this.rootURL}/db-test`, { method: 'GET' });
      const message = await response.text();
      return {
        ok: response.ok,
        healthy: /✅|connected/i.test(message),
        message: message || 'No response body',
        checkedAt: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Spring Boot database health error:', error);
      throw new Error('Unable to reach database endpoint');
    }
  }

  /**
   * Health check for Spring Boot server
   * @returns {Promise} Health status
   */
  async healthCheck() {
    try {
      const response = await fetch(`${this.baseURL}/health`, {
        method: 'GET',
        timeout: 5000,
      });

      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        return { status: 'unhealthy', code: response.status, details: payload };
      }

      const status = payload.status || 'healthy';
      return { status, code: response.status, details: payload };
    } catch (error) {
      console.error('Spring Boot health check error:', error);
      return { status: 'error', error: error.message };
    }
  }

  /**
   * Upload handwriting image for processing
   * @param {string} base64Image - Base64 encoded image
   * @param {Object} metadata - Image metadata
   * @returns {Promise} Processing result
   */
  async uploadHandwritingImage(base64Image, metadata = {}) {
    try {
      const response = await fetch(`${this.baseURL}/recognition/upload`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image: base64Image,
          metadata: metadata,
          timestamp: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Spring Boot upload error:', error);
      throw error;
    }
  }
}

// Usage example:
const springBootService = new SpringBootService();

// Example: Recognize handwriting
export const recognizeHandwriting = async (handwritingData) => {
  return await springBootService.recognizeHandwriting(handwritingData);
};

// Example: Save result
export const saveRecognitionResult = async (resultData) => {
  return await springBootService.saveRecognitionResult(resultData);
};

// Example: Get collections
export const getUserCollections = async (userId) => {
  return await springBootService.getUserCollections(userId);
};

export const getAnalyticsOverview = async () => {
  return await springBootService.getAnalyticsOverview();
};

export const getDatabaseStatus = async () => {
  return await springBootService.getDatabaseStatus();
};

export default springBootService;

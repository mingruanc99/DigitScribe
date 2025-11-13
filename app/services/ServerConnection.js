/**
 * Server Connection Service for React Native
 * Connect your mobile app to your server through a single IP address
 *
 * 🔧 CONFIGURATION:
 * Replace YOUR_SERVER_IP with your actual server IP address
 *
 * Example: '192.168.1.100' or 'your-domain.com'
 */

// ================== CONFIGURATION ==================
// REPLACE WITH YOUR SERVER IP ADDRESS
const SERVER_IP = '10.63.91.4'; 

// If your server uses a custom port, change this (default: 5000)
const SERVER_PORT = 8080;
// ================== BASE URL ==================
// Base API URL - automatically constructed from your IP and port
const BASE_URL = `http://${SERVER_IP}:${SERVER_PORT}/api`;

// ================== CORE API SERVICE ==================

class ServerConnectionService {
  constructor() {
    this.baseURL = BASE_URL;
    this.timeout = 30000; // 30 seconds
  }

  /**
   * Main handwriting recognition function
   * Sends handwriting stroke data to server and returns prediction
   *
   * @param {Object} handwritingData - The handwriting data from canvas
   * @param {Array} handwritingData.paths - Array of stroke paths [[x,y], [x,y], ...]
   * @param {Object} handwritingData.bounds - Bounding box {x, y, width, height}
   * @param {Object} handwritingData.canvasSize - Canvas dimensions {width, height}
   *
   * @returns {Promise<Object>} Recognition result with predicted text and confidence
   *
   * @example
   * const result = await recognizeHandwriting({
   *   paths: [[[10, 20], [15, 25], [20, 30]]],
   *   bounds: {x: 0, y: 0, width: 300, height: 300},
   *   canvasSize: {width: 300, height: 300}
   * });
   * console.log(result.predicted_text); // "5"
   * console.log(result.confidence); // 0.95
   */
  async recognizeHandwriting(handwritingData) {
    try {
      const response = await fetch(`${this.baseURL}/recognize`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          paths: handwritingData.paths,
          bounds: handwritingData.bounds,
          canvas_size: handwritingData.canvasSize,
          preprocessing: {
            normalize: true,
            smoothen: true,
            remove_noise: true,
          },
          model_params: {
            model_type: 'cnn_lstm',
            confidence_threshold: 0.8,
          }
        }),
        timeout: this.timeout,
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const result = await response.json();
      return {
        success: true,
        predicted_text: result.predicted_text,
        confidence: result.confidence,
        result_id: result.result_id,
        data: result
      };
    } catch (error) {
      console.error('Handwriting recognition error:', error);
      return {
        success: false,
        error: error.message,
        predicted_text: '',
        confidence: 0
      };
    }
  }

  /**
   * Process and recognize an image file
   * Uploads an image to server for recognition
   *
   * @param {Object} file - The image file (from ImagePicker, etc.)
   * @param {string} file.uri - File URI/path
   * @param {string} file.type - MIME type
   * @param {string} file.name - File name
   *
   * @returns {Promise<Object>} Recognition result
   */
  async processImage(file) {
    try {
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('file', {
        uri: file.uri,
        type: file.type || 'image/jpeg',
        name: file.name || 'photo.jpg'
      });

      const response = await fetch(`${this.baseURL}/process_image`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
        },
        body: formData,
        timeout: this.timeout,
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const result = await response.json();
      return {
        success: true,
        predicted_text: result.predicted_text,
        confidence: result.confidence,
        filename: result.filename,
        data: result
      };
    } catch (error) {
      console.error('Image processing error:', error);
      return {
        success: false,
        error: error.message,
        predicted_text: '',
        confidence: 0
      };
    }
  }

  /**
   * Check if server is running and healthy
   *
   * @returns {Promise<Object>} Health status
   *
   * @example
   * const health = await checkServerHealth();
   * if (health.status === 'healthy') {
   *   console.log('Server is ready!');
   * }
   */
  async checkServerHealth() {
    try {
      const response = await fetch(`${this.baseURL}/health`, {
        method: 'GET',
        timeout: 5000,
      });

      if (!response.ok) {
        return {
          status: 'unhealthy',
          code: response.status,
          message: 'Server not responding properly'
        };
      }

      const data = await response.json();
      return {
        status: 'healthy',
        code: 200,
        timestamp: data.timestamp,
        model_loaded: data.model_loaded,
        message: 'Server is running correctly'
      };
    } catch (error) {
      console.error('Health check error:', error);
      return {
        status: 'error',
        error: error.message,
        message: 'Cannot connect to server - check IP address'
      };
    }
  }

  /**
   * Save a recognition result to server database
   *
   * @param {Object} result - Recognition result to save
   * @param {string} result.predicted_text - The predicted text/number
   * @param {number} result.confidence - Confidence score (0-1)
   * @param {Array} result.strokes_data - Original stroke paths
   * @param {string} result.image_hash - Optional image hash
   *
   * @returns {Promise<Object>} Save result
   */
  async saveRecognitionResult(result) {
    try {
      const response = await fetch(`${this.baseURL}/recognition/save`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          predicted_text: result.predicted_text,
          confidence: result.confidence,
          strokes_data: result.strokes_data || [],
          image_hash: result.image_hash || null
        }),
        timeout: this.timeout,
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const data = await response.json();
      return {
        success: true,
        result_id: data.result_id,
        message: 'Result saved successfully'
      };
    } catch (error) {
      console.error('Save result error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get all saved recognition results
   *
   * @param {Object} options - Pagination options
   * @param {number} options.page - Page number (default: 1)
   * @param {number} options.per_page - Results per page (default: 20)
   *
   * @returns {Promise<Object>} Results with pagination
   */
  async getRecognitionResults(options = {}) {
    try {
      const page = options.page || 1;
      const per_page = options.per_page || 20;

      const response = await fetch(
        `${this.baseURL}/recognition/results?page=${page}&per_page=${per_page}`,
        {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
          },
          timeout: this.timeout,
        }
      );

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const data = await response.json();
      return {
        success: true,
        results: data.results,
        pagination: data.pagination
      };
    } catch (error) {
      console.error('Get results error:', error);
      return {
        success: false,
        error: error.message,
        results: [],
        pagination: {}
      };
    }
  }

  /**
   * Get specific result by ID
   *
   * @param {number} resultId - The result ID
   * @returns {Promise<Object>} Result data
   */
  async getResult(resultId) {
    try {
      const response = await fetch(`${this.baseURL}/recognition/results/${resultId}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
        timeout: this.timeout,
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const data = await response.json();
      return {
        success: true,
        result: data.result
      };
    } catch (error) {
      console.error('Get result error:', error);
      return {
        success: false,
        error: error.message,
        result: null
      };
    }
  }

  /**
   * Create a new collection for organizing results
   *
   * @param {Object} collection - Collection data
   * @param {string} collection.name - Collection name
   * @param {string} collection.description - Description (optional)
   *
   * @returns {Promise<Object>} Created collection
   */
  async createCollection(collection) {
    try {
      const response = await fetch(`${this.baseURL}/collections`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          name: collection.name,
          description: collection.description || ''
        }),
        timeout: this.timeout,
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const data = await response.json();
      return {
        success: true,
        collection_id: data.collection_id,
        collection: data.collection
      };
    } catch (error) {
      console.error('Create collection error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get all collections
   *
   * @returns {Promise<Object>} List of collections
   */
  async getCollections() {
    try {
      const response = await fetch(`${this.baseURL}/collections`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
        timeout: this.timeout,
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const data = await response.json();
      return {
        success: true,
        collections: data.collections
      };
    } catch (error) {
      console.error('Get collections error:', error);
      return {
        success: false,
        error: error.message,
        collections: []
      };
    }
  }

  /**
   * Get MNIST dataset samples
   *
   * @param {Object} options - Options
   * @param {number} options.count - Number of samples (default: 10)
   *
   * @returns {Promise<Object>} MNIST samples
   */
  async getMNISTSamples(options = {}) {
    try {
      const count = options.count || 10;
      const response = await fetch(`${this.baseURL}/mnist_samples?count=${count}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
        timeout: this.timeout,
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const data = await response.json();
      return {
        success: true,
        samples: data.samples
      };
    } catch (error) {
      console.error('Get MNIST samples error:', error);
      return {
        success: false,
        error: error.message,
        samples: []
      };
    }
  }

  /**
   * Get server performance metrics
   *
   * @returns {Promise<Object>} Server metrics
   */
  async getMetrics() {
    try {
      const response = await fetch(`${this.baseURL}/metrics`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
        timeout: this.timeout,
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const data = await response.json();
      return {
        success: true,
        metrics: data.metrics
      };
    } catch (error) {
      console.error('Get metrics error:', error);
      return {
        success: false,
        error: error.message,
        metrics: {}
      };
    }
  }

  // ================== USER AUTHENTICATION ==================

  /**
   * Login user with username only
   * @param {string} username - Username
   * @returns {Promise<Object>} Login result with token
   */
  async loginUser(username) {
    try {
      const response = await fetch(`${this.baseURL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          username
        }),
        timeout: this.timeout,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || `Server error: ${response.status}`);
      }

      const result = await response.json();
      return {
        success: true,
        token: result.token,
        user: result.user
      };
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Register a new user with username only
   * @param {string} username - Username
   * @returns {Promise<Object>} Registration result
   */
  async registerUser(username) {
    try {
      const response = await fetch(`${this.baseURL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          username
        }),
        timeout: this.timeout,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || `Server error: ${response.status}`);
      }

      const result = await response.json();
      return {
        success: true,
        token: result.token,
        user: result.user
      };
    } catch (error) {
      console.error('Registration error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get current user profile (requires authentication token)
   * @param {string} token - Auth token
   * @returns {Promise<Object>} User profile data
   */
  async getUserProfile(token) {
    try {
      const response = await fetch(`${this.baseURL}/auth/me`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        timeout: this.timeout,
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const result = await response.json();
      return {
        success: true,
        user: result
      };
    } catch (error) {
      console.error('Get user profile error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Update user profile
   * @param {string} token - Auth token
   * @param {Object} profileData - Profile data to update
   * @returns {Promise<Object>} Update result
   */
  async updateUserProfile(token, profileData) {
    try {
      const response = await fetch(`${this.baseURL}/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(profileData),
        timeout: this.timeout,
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const result = await response.json();
      return {
        success: true,
        user: result
      };
    } catch (error) {
      console.error('Update profile error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Guest login (no authentication required)
   * @returns {Promise<Object>} Guest session
   */
  async guestLogin() {
    try {
      const response = await fetch(`${this.baseURL}/auth/guest`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        timeout: this.timeout,
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const result = await response.json();
      return {
        success: true,
        token: result.token,
        user: result.user
      };
    } catch (error) {
      console.error('Guest login error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

// ================== INSTANCE ==================

// Create service instance
const serverService = new ServerConnectionService();

// ================== QUICK EXPORT FUNCTIONS ==================

/**
 * Quick function to recognize handwriting
 * @param {Object} handwritingData - Handwriting stroke data
 * @returns {Promise<Object>} Recognition result
 */
export const recognizeHandwriting = async (handwritingData) => {
  return await serverService.recognizeHandwriting(handwritingData);
};

/**
 * Quick function to check server health
 * @returns {Promise<Object>} Health status
 */
export const checkServerHealth = async () => {
  return await serverService.checkServerHealth();
};

/**
 * Quick function to save a recognition result
 * @param {Object} result - Result to save
 * @returns {Promise<Object>} Save result
 */
export const saveRecognitionResult = async (result) => {
  return await serverService.saveRecognitionResult(result);
};

/**
 * Quick function to get all saved results
 * @param {Object} options - Pagination options
 * @returns {Promise<Object>} Results list
 */
export const getRecognitionResults = async (options) => {
  return await serverService.getRecognitionResults(options);
};

/**
 * Quick function to create a collection
 * @param {Object} collection - Collection data
 * @returns {Promise<Object>} Created collection
 */
export const createCollection = async (collection) => {
  return await serverService.createCollection(collection);
};

/**
 * Quick function to get MNIST samples
 * @param {Object} options - Options
 * @returns {Promise<Object>} MNIST samples
 */
export const getMNISTSamples = async (options) => {
  return await serverService.getMNISTSamples(options);
};

/**
 * Quick function to login user
 * @param {string} username - Username or email
 * @param {string} password - Password
 * @returns {Promise<Object>} Login result
 */
export const loginUser = async (username) => {
  return await serverService.loginUser(username);
};

/**
 * Quick function to register new user
 * @param {string} username - Username
 * @returns {Promise<Object>} Registration result
 */
export const registerUser = async (username) => {
  return await serverService.registerUser(username);
};

/**
 * Quick function to get user profile
 * @param {string} token - Auth token
 * @returns {Promise<Object>} User profile
 */
export const getUserProfile = async (token) => {
  return await serverService.getUserProfile(token);
};

/**
 * Quick function to update user profile
 * @param {string} token - Auth token
 * @param {Object} profileData - Profile data to update
 * @returns {Promise<Object>} Update result
 */
export const updateUserProfile = async (token, profileData) => {
  return await serverService.updateUserProfile(token, profileData);
};

/**
 * Quick function for guest login
 * @returns {Promise<Object>} Guest session
 */
export const guestLogin = async () => {
  return await serverService.guestLogin();
};

// ================== USAGE EXAMPLES ==================

/*
// Example 1: Recognize handwriting
import { recognizeHandwriting, checkServerHealth } from './services/ServerConnection';

// First check if server is running
const health = await checkServerHealth();
if (health.status === 'healthy') {
  console.log('Server is ready!');

  // Send handwriting data
  const handwritingData = {
    paths: [[[10, 20], [15, 25], [20, 30]]], // Your stroke data
    bounds: { x: 0, y: 0, width: 300, height: 300 },
    canvasSize: { width: 300, height: 300 }
  };

  const result = await recognizeHandwriting(handwritingData);

  if (result.success) {
    console.log('Predicted:', result.predicted_text);
    console.log('Confidence:', result.confidence);
  }
}


// Example 2: Save recognition result
import { saveRecognitionResult } from './services/ServerConnection';

const result = {
  predicted_text: '7',
  confidence: 0.95,
  strokes_data: [...], // Original stroke data
  image_hash: 'abc123...'
};

const saved = await saveRecognitionResult(result);
if (saved.success) {
  console.log('Saved with ID:', saved.result_id);
}


// Example 3: Create a collection
import { createCollection } from './services/ServerConnection';

const collection = await createCollection({
  name: 'Math Homework',
  description: 'Practice problems from Chapter 3'
});

if (collection.success) {
  console.log('Collection created:', collection.collection_id);
}


// Example 4: Get all previous results
import { getRecognitionResults } from './services/ServerConnection';

const results = await getRecognitionResults({
  page: 1,
  per_page: 20
});

if (results.success) {
  results.results.forEach(result => {
    console.log(`[${result.created_at}] ${result.predicted_text}`);
  });
}

// Example 5: User authentication
import { loginUser, registerUser, guestLogin } from './services/ServerConnection';

// Login user
const loginResult = await loginUser('username', 'password');
if (loginResult.success) {
  console.log('Logged in:', loginResult.user);
  console.log('Token:', loginResult.token);
}

// Register new user
const registerResult = await registerUser('newuser', 'user@example.com', 'password123');
if (registerResult.success) {
  console.log('Registered:', registerResult.user);
}

// Guest login
const guestResult = await guestLogin();
if (guestResult.success) {
  console.log('Guest session:', guestResult.user);
}
*/

export default serverService;

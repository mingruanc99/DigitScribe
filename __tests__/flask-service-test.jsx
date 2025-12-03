import flaskService from '../services/FlaskService';

// Mock fetch
global.fetch = jest.fn();

describe('FlaskService - TensorFlow/ML Recognition API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('recognizeHandwriting() - TensorFlow Model', () => {
    test('successfully recognizes handwritten digit from stroke data', async () => {
      const mockResponse = {
        ok: true,
        json: async () => ({
          prediction: 7,
          confidence: 0.94,
          processing_time_ms: 52.3,
          model_version: 'tf-cnn-v3',
          probabilities: [0.02, 0.01, 0.01, 0.01, 0.01, 0.05, 0.02, 0.94, 0.01, 0.02],
        }),
      };
      fetch.mockResolvedValue(mockResponse);

      const handwritingData = {
        paths: ['M 50 50 L 100 100 L 100 150 L 50 200 L 50 100 M 50 100 L 150 100'],
        bounds: { minX: 45, maxX: 155, minY: 45, maxY: 205 },
        canvasSize: { width: 300, height: 300 },
      };

      const result = await flaskService.recognizeHandwriting(handwritingData);

      expect(result.success).toBe(true);
      expect(result.data.prediction).toBe(7);
      expect(result.data.confidence).toBeGreaterThan(0.9);
      expect(result.data.probabilities).toHaveLength(10);
      expect(result.data.model_version).toBe('tf-cnn-v3');

      const [url, options] = fetch.mock.calls[0];
      expect(url).toMatch(/\/recognize$/);
      expect(options.method).toBe('POST');
      expect(options.timeout).toBe(30000);

      const body = JSON.parse(options.body);
      expect(body.strokes).toBeDefined();
      expect(body.model_params.model_type).toBe('cnn_lstm');
      expect(body.preprocessing.normalize).toBe(true);
    });

    test('handles low confidence predictions', async () => {
      const mockResponse = {
        ok: true,
        json: async () => ({
          prediction: 3,
          confidence: 0.45,
          processing_time_ms: 38.1,
          model_version: 'tf-cnn-v3',
          probabilities: [0.1, 0.05, 0.15, 0.45, 0.05, 0.1, 0.05, 0.03, 0.01, 0.01],
        }),
      };
      fetch.mockResolvedValue(mockResponse);

      const handwritingData = { paths: [], bounds: {}, canvasSize: {} };
      const result = await flaskService.recognizeHandwriting(handwritingData);

      expect(result.data.confidence).toBeLessThan(0.5);
    });

    test('handles ambiguous handwriting', async () => {
      const mockResponse = {
        ok: true,
        json: async () => ({
          prediction: 5,
          confidence: 0.62,
          message: 'Low confidence - multiple possible digits',
          alternatives: [
            { digit: 5, confidence: 0.62 },
            { digit: 6, confidence: 0.38 },
          ],
        }),
      };
      fetch.mockResolvedValue(mockResponse);

      const result = await flaskService.recognizeHandwriting({ paths: [] });

      expect(result.data.message).toBeDefined();
      expect(result.data.alternatives).toHaveLength(2);
    });
  });

  describe('processImage() - OpenCV Processing', () => {
    test('processes base64 image with OpenCV', async () => {
      const mockResponse = {
        ok: true,
        json: async () => ({
          processed_image: 'data:image/png;base64,iVBORw0K...',
          operations_applied: ['denoise', 'normalize', 'thinning'],
          original_size: { width: 300, height: 300 },
          processed_size: { width: 28, height: 28 },
        }),
      };
      fetch.mockResolvedValue(mockResponse);

      const base64Image = 'data:image/png;base64,some-image-data';
      const result = await flaskService.processImage(base64Image, {
        denoise: true,
        normalize: true,
        thinning: true,
      });

      expect(result.success).toBe(true);
      expect(result.processed_image).toMatch(/^data:image\/png;base64,/);
      expect(result.operations_applied).toContain('denoise');
      expect(result.processed_size).toEqual({ width: 28, height: 28 });

      const [url, options] = fetch.mock.calls[0];
      expect(url).toMatch(/\/process_image$/);
      expect(JSON.parse(options.body).image_data).toBe(base64Image);
    });

    test('handles minimal processing options', async () => {
      const mockResponse = {
        ok: true,
        json: async () => ({
          processed_image: 'data:...',
          operations_applied: ['normalize'],
        }),
      };
      fetch.mockResolvedValue(mockResponse);

      const result = await flaskService.processImage('image', { normalize: true });

      expect(result.operations_applied).toHaveLength(1);
      expect(result.operations_applied[0]).toBe('normalize');
    });
  });

  describe('getModelInfo() - Model Metadata', () => {
    test('returns model information', async () => {
      const mockResponse = {
        ok: true,
        json: async () => ({
          model_name: 'MNIST-CNN',
          version: '3.0.1',
          framework: 'TensorFlow 2.15.0',
          input_shape: [28, 28, 1],
          output_classes: 10,
          accuracy: 0.983,
          training_date: '2024-11-15',
          deployment_date: '2024-12-01',
        }),
      };
      fetch.mockResolvedValue(mockResponse);

      const result = await flaskService.getModelInfo();

      expect(result.model_name).toBe('MNIST-CNN');
      expect(result.accuracy).toBeGreaterThan(0.98);
      expect(result.framework).toBe('TensorFlow 2.15.0');
      expect(result.input_shape).toEqual([28, 28, 1]);
      expect(result.output_classes).toBe(10);
    });

    test('includes model metadata for debugging', async () => {
      const mockResponse = {
        ok: true,
        json: async () => ({
          model_name: 'Digit-Classifier',
          layers: 12,
          parameters: 245678,
          quantization: 'int8',
        }),
      };
      fetch.mockResolvedValue(mockResponse);

      const result = await flaskService.getModelInfo();

      expect(result.layers).toBeDefined();
      expect(result.parameters).toBeGreaterThan(0);
    });
  });

  describe('getMNISTSamples() - Dataset Samples', () => {
    test('returns MNIST digit samples', async () => {
      const mockResponse = {
        ok: true,
        json: async () => ({
          digit: 5,
          count: 10,
          samples: [
            { image: 'data:image/png;base64,mnbvc', label: 5, index: 0 },
            { image: 'data:image/png;base64,qwert', label: 5, index: 1 },
          ],
        }),
      };
      fetch.mockResolvedValue(mockResponse);

      const result = await flaskService.getMNISTSamples('5', 10);

      expect(result.digit).toBe(5);
      expect(result.count).toBe(2); // Mock returns 2
      expect(result.samples).toHaveLength(2);
      expect(result.samples[0].image).toMatch(/^data:image\/png;base64,/);
    });

    test('handles "all" parameter to get all digits', async () => {
      const mockResponse = {
        ok: true,
        json: async () => ({
          digit: 'all',
          count: 100,
          samples_by_digit: {
            0: [{ image: 'data:...,', label: 0 }],
            1: [{ image: 'data:...,', label: 1 }],
          },
        }),
      };
      fetch.mockResolvedValue(mockResponse);

      const result = await flaskService.getMNISTSamples('all', 100);

      expect(result.samples_by_digit).toBeDefined();
      expect(Object.keys(result.samples_by_digit)).toHaveLength(2);
    });
  });

  describe('healthCheck() - Flask Server Status', () => {
    test('returns server health status', async () => {
      const mockResponse = {
        ok: true,
        json: async () => ({
          status: 'healthy',
          timestamp: '2024-12-03T17:30:00Z',
          uptime: '2 days, 4 hours, 15 minutes',
          version: '1.5.2',
          models_loaded: ['mnist-cnn', 'handwriting-recognizer'],
        }),
      };
      fetch.mockResolvedValue(mockResponse);

      const result = await flaskService.healthCheck();

      expect(result.status).toBe('healthy');
      expect(result.version).toBe('1.5.2');
      expect(result.models_loaded).toContain('mnist-cnn');
      expect(result.uptime).toBeDefined();
    });

    test('detects unhealthy server state', async () => {
      const mockResponse = {
        ok: false,
        status: 503,
        json: async () => ({
          status: 'unhealthy',
          error: 'Model not loaded',
          timestamp: '2024-12-03T17:30:00Z',
        }),
      };
      fetch.mockResolvedValue(mockResponse);

      const result = await flaskService.healthCheck();

      expect(result.status).toBe('unhealthy');
      expect(result.error).toBe('Model not loaded');
    });

    test('handles missing model weights', async () => {
      const mockResponse = {
        ok: false,
        json: async () => ({
          error: 'TensorFlow model file not found',
          status: 'error',
        }),
      };
      fetch.mockResolvedValue(mockResponse);

      await expect(flaskService.healthCheck())
        .rejects.toThrow();
    });
  });

  describe('Error Handling', () => {
    test('handles TensorFlow model errors', async () => {
      const mockResponse = {
        ok: false,
        json: async () => ({
          error: 'TensorFlow session not initialized',
          code: 'MODEL_ERROR',
        }),
      };
      fetch.mockResolvedValue(mockResponse);

      await expect(
        flaskService.recognizeHandwriting({ paths: [] })
      ).rejects.toThrow();
    });

    test('handles CUDA/GPU memory errors', async () => {
      fetch.mockRejectedValue(new Error('CUDA out of memory'));

      await expect(
        flaskService.processImage('large-image')
      ).rejects.toThrow();
    });

    test('handles OpenCV processing errors', async () => {
      const mockResponse = {
        ok: false,
        json: async () => ({
          error: 'OpenCV failed to process image',
          operation: 'thinning',
        }),
      };
      fetch.mockResolvedValue(mockResponse);

      await expect(
        flaskService.processImage('image', { thinning: true })
      ).rejects.toThrow();
    });
  });

  describe('Performance Validation', () => {
    test('recognition completes within timeout', async () => {
      const mockResponse = {
        ok: true,
        json: async () => ({
          prediction: 9,
          confidence: 0.91,
          processing_time_ms: 125.4,
        }),
      };
      fetch.mockResolvedValue(mockResponse);

      const start = Date.now();
      await flaskService.recognizeHandwriting({ paths: [] });
      const duration = Date.now() - start;

      expect(duration).toBeLessThan(30000); // Should complete before timeout
    });

    test('checks processing time is reasonable', async () => {
      const mockResponse = {
        ok: true,
        json: async () => ({
          prediction: 4,
          confidence: 0.88,
          processing_time_ms: 89.2, // Under 100ms
        }),
      };
      fetch.mockResolvedValue(mockResponse);

      const result = await flaskService.recognizeHandwriting({ paths: [] });

      expect(result.processing_time_ms).toBeLessThan(300); // Target: <300ms
    });
  });

  describe('Data Validation', () => {
    test('sends correct preprocessing flags', async () => {
      const mockResponse = {
        ok: true,
        json: async () => ({
          prediction: 2,
          confidence: 0.93,
        }),
      };
      fetch.mockResolvedValue(mockResponse);

      await flaskService.recognizeHandwriting({ paths: [] });

      const [, options] = fetch.mock.calls[0];
      const body = JSON.parse(options.body);

      expect(body.preprocessing).toEqual({
        normalize: true,
        smoothen: true,
        remove_noise: true,
      });
    });

    test('sends correct model parameters', async () => {
      const mockResponse = {
        ok: true,
        json: async () => ({ prediction: 1, confidence: 0.95 }),
      };
      fetch.mockResolvedValue(mockResponse);

      await flaskService.recognizeHandwriting({ paths: [] });

      const [, options] = fetch.mock.calls[0];
      const body = JSON.parse(options.body);

      expect(body.model_params).toEqual({
        model_type: 'cnn_lstm',
        confidence_threshold: 0.8,
      });
    });
  });

  describe('Integration Points', () => {
    test('returns success format consistent with SpringBoot', async () => {
      const mockResponse = {
        ok: true,
        json: async () => ({
          prediction: 7,
          confidence: 0.94,
          processing_time_ms: 52.3,
        }),
      };
      fetch.mockResolvedValue(mockResponse);

      const result = await flaskService.recognizeHandwriting({ paths: [] });

      expect(result.data).toBeDefined();
      expect(result.data.prediction).toBeDefined();
      expect(result.data.confidence).toBeDefined();
    });
  });
});

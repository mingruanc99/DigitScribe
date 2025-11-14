<template>
  <div class="digit-recognition">
    <div class="page-header">
      <h1>Digit Recognition</h1>
      <p>Draw a digit (0-9) and let AI predict what it is</p>
      <div v-if="backendAvailable" class="backend-status available">
        ✓ Connected to AI Backend
      </div>
      <div v-else class="backend-status unavailable">
        ⚠ Using Demo Mode (Flask backend not available)
      </div>
    </div>

    <div class="recognition-container">
      <!-- Left Panel - Drawing Area -->
      <div class="drawing-panel">
        <div class="canvas-container">
          <canvas 
            ref="canvas"
            width="280" 
            height="280"
            class="drawing-canvas"
            @mousedown="startDrawing"
            @mousemove="draw"
            @mouseup="stopDrawing"
            @mouseleave="stopDrawing"
            @touchstart="startDrawingTouch"
            @touchmove="drawTouch"
            @touchend="stopDrawing"
          ></canvas>
          
          <div class="canvas-overlay">
            <div class="grid-overlay"></div>
          </div>
        </div>
        
        <div class="drawing-controls">
          <button class="control-btn secondary" @click="clearCanvas">
            Clear Canvas
          </button>
          <button class="control-btn primary" @click="predictDigit" :disabled="loading">
            <span v-if="loading" class="loading-spinner"></span>
            {{ loading ? 'Analyzing...' : 'Predict Digit' }}
          </button>
        </div>

        <div class="quick-actions">
          <h3>Quick Test</h3>
          <div class="quick-digits">
            <button 
              v-for="digit in [0,1,2,3,4,5,6,7,8,9]" 
              :key="digit"
              class="digit-btn"
              @click="loadTestDigit(digit)"
            >
              {{ digit }}
            </button>
          </div>
        </div>

        <!-- Debug Preview -->
        <div v-if="debugPreview" class="debug-preview">
          <h4>Debug Preview (28x28 sent to AI)</h4>
          <canvas ref="debugCanvas" width="28" height="28" class="debug-canvas"></canvas>
          <div class="debug-stats">
            <div>Min: {{ debugStats.min }}</div>
            <div>Max: {{ debugStats.max }}</div>
            <div>Avg: {{ debugStats.avg }}</div>
          </div>
          <button class="control-btn small" @click="debugPreview = !debugPreview">
            Hide Debug
          </button>
        </div>
        <div v-else class="debug-toggle">
          <button class="control-btn small" @click="debugPreview = true">
            Show Debug Preview
          </button>
        </div>
      </div>

      <!-- Right Panel - Results & History -->
      <div class="results-panel">
        <!-- Current Prediction -->
        <div class="prediction-card">
          <h3>Prediction Result</h3>
          <div v-if="currentPrediction" class="prediction-result">
            <div class="predicted-digit">
              {{ currentPrediction.predicted_digit }}
            </div>
            <div class="confidence">
              Confidence: {{ (currentPrediction.confidence * 100).toFixed(1) }}%
            </div>
            <div class="prediction-time">
              Processed in {{ currentPrediction.processing_time }}ms
            </div>
            <div class="backend-source">
              Source: {{ currentPrediction.backend }}
            </div>
          </div>
          <div v-else class="no-prediction">
            <div class="placeholder-icon">?</div>
            <p>Draw a digit to see prediction</p>
          </div>
        </div>

        <!-- Confidence Distribution -->
        <div class="confidence-card">
          <h3>Confidence Distribution</h3>
          <div class="confidence-bars">
            <div 
              v-for="i in 10" 
              :key="i"
              class="confidence-bar-container"
            >
              <div class="digit-label">{{ i-1 }}</div>
              <div class="confidence-bar-background">
                <div 
                  class="confidence-bar-fill"
                  :class="{ 
                    'highest': currentPrediction && (i-1) === currentPrediction.predicted_digit,
                    'active': currentPrediction && currentPrediction.confidence_distribution 
                      && currentPrediction.confidence_distribution[i-1] > 0.1
                  }"
                  :style="{ 
                    width: currentPrediction && currentPrediction.confidence_distribution 
                      ? `${currentPrediction.confidence_distribution[i-1] * 100}%` 
                      : '0%' 
                  }"
                ></div>
              </div>
              <div class="confidence-percent">
                {{ currentPrediction && currentPrediction.confidence_distribution 
                  ? `${(currentPrediction.confidence_distribution[i-1] * 100).toFixed(1)}%` 
                  : '0.0%' }}
              </div>
            </div>
          </div>
        </div>

        <!-- Feedback System -->
        <div class="feedback-card">
          <h3>Was this prediction correct?</h3>
          <div v-if="currentPrediction" class="feedback-buttons">
            <button 
              class="feedback-btn correct" 
              @click="submitFeedback(true)"
              :disabled="feedbackSubmitted"
            >
              ✓ Correct
            </button>
            <button 
              class="feedback-btn incorrect" 
              @click="submitFeedback(false)"
              :disabled="feedbackSubmitted"
            >
              ✗ Incorrect
            </button>
          </div>
          <div v-else class="feedback-placeholder">
            Provide feedback after prediction
          </div>
          <div v-if="feedbackSubmitted" class="feedback-thanks">
            Thank you for your feedback!
          </div>
        </div>

        <!-- Recent Predictions -->
        <div class="history-card">
          <h3>Recent Predictions</h3>
          <div class="predictions-list">
            <div 
              v-for="prediction in recentPredictions" 
              :key="prediction.id"
              class="prediction-item"
            >
              <div class="prediction-info">
                <span class="prediction-digit">{{ prediction.predicted_digit }}</span>
                <span class="prediction-confidence">
                  {{ (prediction.confidence * 100).toFixed(1) }}%
                </span>
              </div>
              <div class="prediction-meta">
                <span class="prediction-time">{{ formatTime(prediction.timestamp) }}</span>
                <span 
                  class="prediction-status"
                  :class="prediction.correct ? 'correct' : 'incorrect'"
                >
                  {{ prediction.correct ? '✓' : '✗' }}
                </span>
                <span class="backend-indicator" :title="prediction.backend">
                  {{ prediction.backend === 'flask' ? '🤖' : '💡' }}
                </span>
              </div>
            </div>
            <div v-if="recentPredictions.length === 0" class="no-history">
              No predictions yet
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import api from '@/services/api'
import flaskApi from '@/services/flaskApi'

export default {
  name: 'DigitRecognition',
  setup() {
    const canvas = ref(null)
    const ctx = ref(null)
    const debugCanvas = ref(null)
    const debugCtx = ref(null)
    const isDrawing = ref(false)
    const loading = ref(false)
    const currentPrediction = ref(null)
    const feedbackSubmitted = ref(false)
    const recentPredictions = ref([])
    const backendAvailable = ref(false)
    const debugPreview = ref(true)
    const debugStats = ref({ min: 0, max: 0, avg: 0 })

    onMounted(() => {
      initCanvas()
      initDebugCanvas()
      checkBackendHealth()
    })

    const initCanvas = () => {
      const canvasEl = canvas.value
      ctx.value = canvasEl.getContext('2d')
      
      // Set white background
      ctx.value.fillStyle = '#ffffff'
      ctx.value.fillRect(0, 0, canvasEl.width, canvasEl.height)
      ctx.value.strokeStyle = '#000000'
      ctx.value.lineWidth = 20 // Thicker lines for better recognition
      ctx.value.lineCap = 'round'
      ctx.value.lineJoin = 'round'
      ctx.value.globalCompositeOperation = 'source-over'
    }

    const initDebugCanvas = () => {
      if (debugCanvas.value) {
        debugCtx.value = debugCanvas.value.getContext('2d')
        // Set debug canvas to black background
        debugCtx.value.fillStyle = '#000000'
        debugCtx.value.fillRect(0, 0, 28, 28)
      }
    }

    const startDrawing = (event) => {
      isDrawing.value = true
      ctx.value.beginPath()
      const coords = getCanvasCoordinates(event)
      ctx.value.moveTo(coords.x, coords.y)
    }

    const draw = (event) => {
      if (!isDrawing.value) return
      
      const coords = getCanvasCoordinates(event)
      ctx.value.lineTo(coords.x, coords.y)
      ctx.value.stroke()
    }

    const getCanvasCoordinates = (event) => {
      const canvasEl = canvas.value
      const rect = canvasEl.getBoundingClientRect()
      const scaleX = canvasEl.width / rect.width
      const scaleY = canvasEl.height / rect.height
      
      const clientX = event.clientX || (event.touches && event.touches[0].clientX)
      const clientY = event.clientY || (event.touches && event.touches[0].clientY)
      
      return {
        x: (clientX - rect.left) * scaleX,
        y: (clientY - rect.top) * scaleY
      }
    }

    const stopDrawing = () => {
      isDrawing.value = false
      ctx.value.beginPath()
    }

    const clearCanvas = () => {
      const canvasEl = canvas.value
      ctx.value.fillStyle = '#ffffff'
      ctx.value.fillRect(0, 0, canvasEl.width, canvasEl.height)
      ctx.value.strokeStyle = '#000000'
      currentPrediction.value = null
      feedbackSubmitted.value = false
      
      // Clear debug canvas
      if (debugCtx.value) {
        debugCtx.value.fillStyle = '#000000'
        debugCtx.value.fillRect(0, 0, 28, 28)
      }
    }

    const startDrawingTouch = (event) => {
      event.preventDefault()
      startDrawing(event)
    }

    const drawTouch = (event) => {
      event.preventDefault()
      draw(event)
    }

    const checkBackendHealth = async () => {
      try {
        const response = await flaskApi.get('/health')
        backendAvailable.value = true
        console.log('Flask backend is available')
      } catch (error) {
        backendAvailable.value = false
        console.warn('Flask backend is not available. Using demo mode.')
      }
    }

    const predictDigit = async () => {
      loading.value = true
      feedbackSubmitted.value = false
      
      try {
        // Get image data in the format expected by Flask backend
        const imageData = getImageDataArray()
        
        console.log('Sending prediction request to Flask...')
        
        let response
        
        if (backendAvailable.value) {
          // Call Flask backend
          response = await flaskApi.post('/predict', {
            image: imageData
          })
          console.log('Prediction response from Flask:', response.data)
        } else {
          // Fallback to demo prediction
          response = await generateDemoPrediction(imageData)
        }
        
        currentPrediction.value = {
          predicted_digit: response.data.prediction,
          confidence: response.data.confidence,
          processing_time: response.data.processing_time || 50,
          confidence_distribution: response.data.all_predictions || Array(10).fill(0.1),
          backend: backendAvailable.value ? 'flask' : 'demo'
        }
        
        // Add to recent predictions
        recentPredictions.value.unshift({
          id: Date.now(),
          predicted_digit: response.data.prediction,
          confidence: response.data.confidence,
          timestamp: new Date(),
          correct: null,
          backend: backendAvailable.value ? 'flask' : 'demo'
        })
        
        // Keep only last 10 predictions
        if (recentPredictions.value.length > 10) {
          recentPredictions.value = recentPredictions.value.slice(0, 10)
        }
        
      } catch (error) {
        console.error('Prediction failed:', error)
        alert(`Prediction failed: ${error.message}`)
      } finally {
        loading.value = false
      }
    }

    const getImageDataArray = () => {
      // Create a temporary canvas to resize to 28x28 for MNIST
      const tempCanvas = document.createElement('canvas')
      const tempCtx = tempCanvas.getContext('2d')
      tempCanvas.width = 28
      tempCanvas.height = 28
      
      // Fill with black background first (MNIST expects black background)
      tempCtx.fillStyle = '#000000'
      tempCtx.fillRect(0, 0, 28, 28)
      
      // Draw and resize with smoothing disabled for crisp scaling
      tempCtx.imageSmoothingEnabled = false
      tempCtx.drawImage(canvas.value, 0, 0, 28, 28)
      
      // Get image data
      const imageData = tempCtx.getImageData(0, 0, 28, 28)
      
      // Convert to grayscale array (MNIST format)
      const grayscale = []
      let sum = 0
      let min = 1
      let max = 0
      
      for (let i = 0; i < imageData.data.length; i += 4) {
        const r = imageData.data[i]
        const g = imageData.data[i + 1]
        const b = imageData.data[i + 2]
        
        // Convert to grayscale and normalize to 0-1
        // Use weighted grayscale conversion for better perception
        const gray = (r * 0.299 + g * 0.587 + b * 0.114) / 255.0
        
        grayscale.push(gray)
        sum += gray
        min = Math.min(min, gray)
        max = Math.max(max, gray)
      }
      
      // Update debug stats
      debugStats.value = {
        min: min.toFixed(3),
        max: max.toFixed(3),
        avg: (sum / grayscale.length).toFixed(3)
      }
      
      // Update debug preview
      updateDebugPreview(grayscale)
      
      console.log('Processed image data:', {
        length: grayscale.length,
        min: min,
        max: max,
        avg: sum / grayscale.length
      })
      
      return grayscale
    }

    const updateDebugPreview = (grayscale) => {
      if (!debugCtx.value) return
      
      const imageData = debugCtx.value.createImageData(28, 28)
      
      for (let i = 0; i < grayscale.length; i++) {
        const gray = Math.floor(grayscale[i] * 255)
        imageData.data[i * 4] = gray     // R
        imageData.data[i * 4 + 1] = gray // G
        imageData.data[i * 4 + 2] = gray // B
        imageData.data[i * 4 + 3] = 255  // A
      }
      
      debugCtx.value.putImageData(imageData, 0, 0)
    }

    const generateDemoPrediction = async (imageData) => {
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // Simple random prediction for demo
      const randomDigit = Math.floor(Math.random() * 10)
      const confidence = 0.7 + Math.random() * 0.25
      const allPredictions = Array.from({length: 10}, (_, i) => 
        i === randomDigit ? confidence : (1 - confidence) / 9
      )
      
      return {
        data: {
          prediction: randomDigit,
          confidence: confidence,
          processing_time: Math.floor(Math.random() * 50) + 25,
          all_predictions: allPredictions
        }
      }
    }

    const submitFeedback = async (isCorrect) => {
      if (currentPrediction.value && recentPredictions.value.length > 0) {
        try {
          recentPredictions.value[0].correct = isCorrect
          feedbackSubmitted.value = true
          
          if (isCorrect !== null) {
            await api.post('/predictions/feedback', {
              predictionId: recentPredictions.value[0].id,
              predictedDigit: currentPrediction.value.predicted_digit,
              actualDigit: isCorrect ? currentPrediction.value.predicted_digit : null,
              isCorrect: isCorrect,
              confidence: currentPrediction.value.confidence,
              userFeedback: true,
              backendUsed: recentPredictions.value[0].backend
            })
          }
          
        } catch (error) {
          console.error('Failed to submit feedback to Spring Boot:', error)
        }
      }
    }

    const loadTestDigit = async (digit) => {
      clearCanvas()
      
      setTimeout(() => {
        currentPrediction.value = {
          predicted_digit: digit,
          confidence: 0.95,
          processing_time: 25,
          confidence_distribution: Array.from({length: 10}, (_, i) => 
            i === digit ? 0.95 : 0.05 / 9
          ),
          backend: 'demo'
        }
        
        recentPredictions.value.unshift({
          id: Date.now(),
          predicted_digit: digit,
          confidence: 0.95,
          timestamp: new Date(),
          correct: null,
          backend: 'demo'
        })
      }, 500)
    }

    const formatTime = (timestamp) => {
      const now = new Date()
      const diff = now - new Date(timestamp)
      const minutes = Math.floor(diff / 60000)
      if (minutes < 1) return 'Just now'
      if (minutes < 60) return `${minutes}m ago`
      const hours = Math.floor(minutes / 60)
      if (hours < 24) return `${hours}h ago`
      return new Date(timestamp).toLocaleDateString()
    }

    return {
      canvas,
      debugCanvas,
      isDrawing,
      loading,
      currentPrediction,
      feedbackSubmitted,
      recentPredictions,
      backendAvailable,
      debugPreview,
      debugStats,
      startDrawing,
      draw,
      stopDrawing,
      clearCanvas,
      startDrawingTouch,
      drawTouch,
      predictDigit,
      submitFeedback,
      loadTestDigit,
      formatTime
    }
  }
}
</script>

<style scoped>
/* Add these new styles */
.backend-status {
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  margin-top: 8px;
}

.backend-status.available {
  background: #f0fdf4;
  color: #059669;
  border: 1px solid #bbf7d0;
}

.backend-status.unavailable {
  background: #fffbeb;
  color: #d97706;
  border: 1px solid #fed7aa;
}

.debug-preview {
  margin-top: 20px;
  padding: 16px;
  background: #f8fafc;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
}

.debug-preview h4 {
  font-size: 14px;
  font-weight: 600;
  color: #475569;
  margin-bottom: 8px;
}

.debug-canvas {
  border: 1px solid #cbd5e1;
  background: #000;
  image-rendering: pixelated;
  transform: scale(2);
  transform-origin: top left;
  margin-bottom: 8px;
  display: block;
}

.debug-stats {
  display: flex;
  gap: 12px;
  font-size: 12px;
  color: #64748b;
  margin-bottom: 8px;
}

.debug-toggle {
  margin-top: 16px;
}

.control-btn.small {
  padding: 6px 12px;
  font-size: 12px;
}

.backend-source {
  font-size: 12px;
  color: #64748b;
  margin-top: 4px;
}

.backend-indicator {
  font-size: 12px;
}

.prediction-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: #64748b;
}

/* Rest of your existing styles remain the same */
.digit-recognition {
  padding: 0;
}

.page-header {
  margin-bottom: 32px;
}

.page-header h1 {
  font-size: 28px;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 8px;
}

.page-header p {
  color: #64748b;
  font-size: 16px;
}

.recognition-container {
  display: grid;
  grid-template-columns: 1fr 400px;
  gap: 32px;
  align-items: start;
}

/* Drawing Panel */
.drawing-panel {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1);
}

.canvas-container {
  position: relative;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  background: white;
  margin-bottom: 24px;
}

.drawing-canvas {
  display: block;
  cursor: crosshair;
  border-radius: 6px;
  width: 100%;
  height: auto;
}

.canvas-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
}

.grid-overlay {
  width: 100%;
  height: 100%;
  background-image: 
    linear-gradient(#f1f5f9 1px, transparent 1px),
    linear-gradient(90deg, #f1f5f9 1px, transparent 1px);
  background-size: 28px 28px;
  opacity: 0.5;
  border-radius: 6px;
}

.drawing-controls {
  display: flex;
  gap: 12px;
  margin-bottom: 32px;
}

.control-btn {
  flex: 1;
  padding: 12px 20px;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 14px;
}

.control-btn.secondary {
  background: #f8fafc;
  color: #475569;
  border: 1px solid #e2e8f0;
}

.control-btn.secondary:hover {
  background: #f1f5f9;
}

.control-btn.primary {
  background: #059669;
  color: white;
}

.control-btn.primary:hover:not(:disabled) {
  background: #047857;
  transform: translateY(-1px);
}

.control-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.loading-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid transparent;
  border-top: 2px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  display: inline-block;
  margin-right: 8px;
}

.quick-actions h3 {
  font-size: 16px;
  font-weight: 600;
  color: #374151;
  margin-bottom: 12px;
}

.quick-digits {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 8px;
}

.digit-btn {
  padding: 12px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 16px;
  font-weight: 600;
  color: #475569;
  cursor: pointer;
  transition: all 0.2s ease;
}

.digit-btn:hover {
  background: #059669;
  color: white;
  border-color: #059669;
}

/* Results Panel */
.results-panel {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.prediction-card,
.confidence-card,
.feedback-card,
.history-card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1);
}

.prediction-card h3,
.confidence-card h3,
.feedback-card h3,
.history-card h3 {
  font-size: 18px;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 16px;
}

.prediction-result {
  text-align: center;
}

.predicted-digit {
  font-size: 64px;
  font-weight: 700;
  color: #059669;
  margin-bottom: 8px;
}

.confidence {
  font-size: 16px;
  color: #64748b;
  margin-bottom: 4px;
}

.prediction-time {
  font-size: 14px;
  color: #94a3b8;
}

.no-prediction {
  text-align: center;
  padding: 40px 20px;
}

.placeholder-icon {
  font-size: 48px;
  color: #cbd5e1;
  margin-bottom: 12px;
}

.no-prediction p {
  color: #64748b;
  margin: 0;
}

/* Confidence Bars */
.confidence-bars {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.confidence-bar-container {
  display: flex;
  align-items: center;
  gap: 12px;
}

.digit-label {
  width: 20px;
  font-weight: 600;
  color: #475569;
  font-size: 14px;
}

.confidence-bar-background {
  flex: 1;
  height: 20px;
  background: #f1f5f9;
  border-radius: 10px;
  overflow: hidden;
}

.confidence-bar-fill {
  height: 100%;
  background: #cbd5e1;
  border-radius: 10px;
  transition: width 0.3s ease;
}

.confidence-bar-fill.active {
  background: #059669;
}

.confidence-bar-fill.highest {
  background: #047857;
}

.confidence-percent {
  width: 40px;
  font-size: 12px;
  color: #64748b;
  text-align: right;
}

/* Feedback */
.feedback-buttons {
  display: flex;
  gap: 12px;
}

.feedback-btn {
  flex: 1;
  padding: 12px 16px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background: white;
  cursor: pointer;
  transition: all 0.2s ease;
  font-weight: 500;
}

.feedback-btn.correct:hover:not(:disabled) {
  background: #f0fdf4;
  border-color: #059669;
  color: #059669;
}

.feedback-btn.incorrect:hover:not(:disabled) {
  background: #fef2f2;
  border-color: #ef4444;
  color: #ef4444;
}

.feedback-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.feedback-placeholder {
  text-align: center;
  color: #64748b;
  padding: 20px;
  font-style: italic;
}

.feedback-thanks {
  text-align: center;
  color: #059669;
  font-weight: 500;
  margin-top: 12px;
}

/* History */
.predictions-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-height: 300px;
  overflow-y: auto;
}

.prediction-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  background: #f8fafc;
  border-radius: 8px;
  border-left: 4px solid #059669;
}

.prediction-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.prediction-digit {
  font-size: 20px;
  font-weight: 700;
  color: #059669;
}

.prediction-confidence {
  font-size: 12px;
  color: #64748b;
  background: white;
  padding: 2px 6px;
  border-radius: 4px;
}

.prediction-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: #64748b;
}

.prediction-status {
  width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  font-size: 10px;
}

.prediction-status.correct {
  background: #f0fdf4;
  color: #059669;
}

.prediction-status.incorrect {
  background: #fef2f2;
  color: #ef4444;
}

.no-history {
  text-align: center;
  color: #64748b;
  padding: 20px;
  font-style: italic;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Responsive */
@media (max-width: 1024px) {
  .recognition-container {
    grid-template-columns: 1fr;
  }
  
  .results-panel {
    grid-template-columns: 1fr 1fr;
  }
}

@media (max-width: 768px) {
  .drawing-controls {
    flex-direction: column;
  }
  
  .feedback-buttons {
    flex-direction: column;
  }
}
</style>
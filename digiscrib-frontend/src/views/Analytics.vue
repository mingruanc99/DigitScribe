<template>
  <div class="analytics">
    <div class="page-header">
      <h1>Analytics Dashboard</h1>
      <p>Comprehensive insights into your digit recognition performance</p>
    </div>

    <!-- Date Range Filter -->
    <div class="filters">
      <div class="filter-group">
        <label>Date Range</label>
        <select v-model="selectedRange" @change="updateAnalytics" class="filter-select">
          <option value="7d">Last 7 Days</option>
          <option value="30d">Last 30 Days</option>
          <option value="90d">Last 90 Days</option>
          <option value="1y">Last Year</option>
          <option value="all">All Time</option>
        </select>
      </div>
      <div class="filter-group">
        <label>Model</label>
        <select v-model="selectedModel" @change="updateAnalytics" class="filter-select">
          <option value="all">All Models</option>
          <option v-for="model in models" :key="model.id" :value="model.id">
            {{ model.name }}
          </option>
        </select>
      </div>
      <button class="export-btn" @click="exportData">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
          <polyline points="7 10 12 15 17 10"/>
          <line x1="12" y1="15" x2="12" y2="3"/>
        </svg>
        Export Data
      </button>
      <button class="refresh-btn" @click="refreshData" :disabled="loading">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M23 4v6h-6"/>
          <path d="M1 20v-6h6"/>
          <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
        </svg>
        Refresh
      </button>
    </div>

    <!-- Error State -->
    <div v-if="error" class="error-state">
      <div class="error-icon">⚠️</div>
      <h3>Failed to Load Analytics</h3>
      <p>{{ error }}</p>
      <button @click="loadAnalyticsData" class="retry-btn">Retry</button>
    </div>

    <!-- Loading State -->
    <div v-else-if="loading" class="loading-state">
      <div class="loading-spinner"></div>
      <p>Loading analytics data...</p>
    </div>

    <!-- Main Content -->
    <div v-else class="analytics-content">
      <!-- Key Metrics -->
      <div class="metrics-overview">
        <div class="metric-card large">
          <div class="metric-value">{{ totalPredictions.toLocaleString() }}</div>
          <div class="metric-label">Total Predictions</div>
          <div class="metric-change" :class="predictionTrend >= 0 ? 'positive' : 'negative'">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <template v-if="predictionTrend >= 0">
                <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
                <polyline points="17 6 23 6 23 12"/>
              </template>
              <template v-else>
                <polyline points="23 18 13.5 8.5 8.5 13.5 1 6"/>
                <polyline points="17 18 23 18 23 12"/>
              </template>
            </svg>
            {{ Math.abs(predictionTrend) }}% from last period
          </div>
        </div>

        <div class="metric-card large">
          <div class="metric-value">{{ overallAccuracy }}%</div>
          <div class="metric-label">Overall Accuracy</div>
          <div class="metric-change" :class="accuracyTrend >= 0 ? 'positive' : 'negative'">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <template v-if="accuracyTrend >= 0">
                <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
                <polyline points="17 6 23 6 23 12"/>
              </template>
              <template v-else>
                <polyline points="23 18 13.5 8.5 8.5 13.5 1 6"/>
                <polyline points="17 18 23 18 23 12"/>
              </template>
            </svg>
            {{ Math.abs(accuracyTrend) }}% {{ accuracyTrend >= 0 ? 'improvement' : 'decline' }}
          </div>
        </div>

        <div class="metric-card large">
          <div class="metric-value">{{ averageConfidence }}%</div>
          <div class="metric-label">Average Confidence</div>
          <div class="metric-change" :class="confidenceTrend > 0 ? 'positive' : confidenceTrend < 0 ? 'negative' : 'neutral'">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <template v-if="confidenceTrend > 0">
                <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
                <polyline points="17 6 23 6 23 12"/>
              </template>
              <template v-else-if="confidenceTrend < 0">
                <polyline points="23 18 13.5 8.5 8.5 13.5 1 6"/>
                <polyline points="17 18 23 18 23 12"/>
              </template>
              <template v-else>
                <line x1="5" y1="12" x2="19" y2="12"/>
              </template>
            </svg>
            {{ confidenceTrend > 0 ? `+${Math.abs(confidenceTrend)}%` : confidenceTrend < 0 ? `${Math.abs(confidenceTrend)}%` : 'No change' }}
          </div>
        </div>

        <div class="metric-card large">
          <div class="metric-value">{{ activeModelsCount }}</div>
          <div class="metric-label">Active Models</div>
          <div class="metric-change neutral">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Currently active
          </div>
        </div>
      </div>

      <!-- Charts Grid -->
      <div class="charts-grid">
        <!-- Predictions Over Time -->
        <div class="chart-card">
          <div class="chart-header">
            <h3>Predictions Over Time</h3>
            <div class="chart-legend">
              <div class="legend-item">
                <div class="legend-color success"></div>
                <span>Successful</span>
              </div>
              <div class="legend-item">
                <div class="legend-color failed"></div>
                <span>Failed</span>
              </div>
            </div>
          </div>
          <div class="chart-container">
            <div v-if="predictionsOverTime.length === 0" class="no-data">
              No prediction data available
            </div>
            <div v-else class="bar-chart">
              <div 
                v-for="day in predictionsOverTime" 
                :key="day.date"
                class="bar-group"
              >
                <div class="bar-label">{{ formatDateLabel(day.date) }}</div>
                <div class="bars">
                  <div 
                    class="bar success" 
                    :style="{ height: `${(day.successful / maxPredictions) * 100}%` }"
                    :title="`Successful: ${day.successful}`"
                  ></div>
                  <div 
                    class="bar failed" 
                    :style="{ height: `${(day.failed / maxPredictions) * 100}%` }"
                    :title="`Failed: ${day.failed}`"
                  ></div>
                </div>
                <div class="bar-total">{{ day.total }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Accuracy by Digit -->
        <div class="chart-card">
          <div class="chart-header">
            <h3>Accuracy by Digit</h3>
          </div>
          <div class="chart-container">
            <div v-if="digitAccuracy.length === 0" class="no-data">
              No digit accuracy data available
            </div>
            <div v-else class="accuracy-chart">
              <div 
                v-for="digit in digitAccuracy" 
                :key="digit.digit"
                class="accuracy-item"
              >
                <div class="digit">{{ digit.digit }}</div>
                <div class="accuracy-bar-container">
                  <div 
                    class="accuracy-bar" 
                    :style="{ width: `${digit.accuracy}%` }"
                    :class="getAccuracyClass(digit.accuracy)"
                  ></div>
                  <div class="accuracy-value">{{ digit.accuracy.toFixed(1) }}%</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Model Performance Comparison -->
        <div class="chart-card">
          <div class="chart-header">
            <h3>Model Performance</h3>
          </div>
          <div class="chart-container">
            <div v-if="modelPerformance.length === 0" class="no-data">
              No model performance data available
            </div>
            <div v-else class="model-comparison">
              <div 
                v-for="model in modelPerformance" 
                :key="model.id"
                class="model-bar"
              >
                <div class="model-name">{{ model.name }}</div>
                <div class="performance-bar-container">
                  <div 
                    class="performance-bar" 
                    :style="{ width: `${model.accuracy}%` }"
                  ></div>
                  <div class="performance-value">{{ model.accuracy.toFixed(1) }}%</div>
                </div>
                <div class="model-stats">
                  <span>{{ model.predictions.toLocaleString() }} predictions</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Confidence Distribution -->
        <div class="chart-card">
          <div class="chart-header">
            <h3>Confidence Distribution</h3>
          </div>
          <div class="chart-container">
            <div v-if="confidenceDistribution.length === 0" class="no-data">
              No confidence data available
            </div>
            <div v-else class="confidence-distribution">
              <div 
                v-for="bucket in confidenceDistribution" 
                :key="bucket.range"
                class="confidence-bucket"
              >
                <div class="bucket-range">{{ bucket.range }}%</div>
                <div class="bucket-bar-container">
                  <div 
                    class="bucket-bar" 
                    :style="{ width: `${(bucket.count / maxConfidenceCount) * 100}%` }"
                  ></div>
                  <div class="bucket-count">{{ bucket.count.toLocaleString() }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Recent Activity -->
        <div class="chart-card">
          <div class="chart-header">
            <h3>Recent Activity</h3>
          </div>
          <div class="chart-container">
            <div v-if="recentActivity.length === 0" class="no-data">
              No recent activity
            </div>
            <div v-else class="recent-activity">
              <div 
                v-for="activity in recentActivity" 
                :key="activity.id"
                class="activity-item"
              >
                <div class="activity-icon" :class="activity.type">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path v-if="activity.type === 'prediction'" d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                    <path v-if="activity.type === 'training'" d="M22 12h-4l-3 9L9 3l-3 9H2"/>
                    <path v-if="activity.type === 'model'" d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/>
                  </svg>
                </div>
                <div class="activity-details">
                  <div class="activity-title">{{ activity.title }}</div>
                  <div class="activity-time">{{ activity.time }}</div>
                </div>
                <div class="activity-value" :class="activity.valueClass">
                  {{ activity.value }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Detailed Statistics -->
      <div class="detailed-stats">
        <h2>Detailed Statistics</h2>
        <div class="stats-grid">
          <div class="stat-card">
            <h4>Model Statistics</h4>
            <div class="stat-item">
              <span>Total Models</span>
              <strong>{{ modelStats.total }}</strong>
            </div>
            <div class="stat-item">
              <span>Active Models</span>
              <strong>{{ modelStats.active }}</strong>
            </div>
            <div class="stat-item">
              <span>Training Samples</span>
              <strong>{{ modelStats.trainingSamples.toLocaleString() }}</strong>
            </div>
          </div>

          <div class="stat-card">
            <h4>Performance Metrics</h4>
            <div class="stat-item">
              <span>Best Accuracy</span>
              <strong>{{ performanceMetrics.bestAccuracy }}%</strong>
            </div>
            <div class="stat-item">
              <span>Worst Accuracy</span>
              <strong>{{ performanceMetrics.worstAccuracy }}%</strong>
            </div>
            <div class="stat-item">
              <span>Avg Training Time</span>
              <strong>{{ performanceMetrics.avgTrainingTime }}</strong>
            </div>
          </div>

          <div class="stat-card">
            <h4>Usage Patterns</h4>
            <div class="stat-item">
              <span>Most Used Model</span>
              <strong>{{ usagePatterns.mostUsed }}</strong>
            </div>
            <div class="stat-item">
              <span>Avg Predictions/Day</span>
              <strong>{{ usagePatterns.avgDailyPredictions.toLocaleString() }}</strong>
            </div>
            <div class="stat-item">
              <span>Peak Hour</span>
              <strong>{{ usagePatterns.peakHour }}</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import flaskApi from '@/services/flaskApi'

export default {
  name: 'Analytics',
  setup() {
    const selectedRange = ref('30d')
    const selectedModel = ref('all')
    const loading = ref(true)
    const error = ref(null)

    // Real data from backend
    const models = ref([])
    const predictionsData = ref([])
    const digitAccuracyData = ref([])
    const modelPerformanceData = ref([])
    const confidenceData = ref([])
    const activityData = ref([])

    // Load real data from backend
    const loadAnalyticsData = async () => {
      try {
        loading.value = true
        error.value = null
        
        // Load models
        const modelsResponse = await flaskApi.get('/api/models')
        models.value = modelsResponse.data

        // Load analytics data
        const [accuracyResponse, predictionsResponse, performanceResponse, confidenceResponse, activityResponse] = 
          await Promise.all([
            flaskApi.get('/api/models/accuracy-by-digit'),
            flaskApi.get('/api/predictions/stats', {
              params: { range: selectedRange.value, model: selectedModel.value }
            }),
            flaskApi.get('/api/models/performance'),
            flaskApi.get('/api/predictions/confidence-distribution'),
            flaskApi.get('/api/activity/recent')
          ])

        digitAccuracyData.value = accuracyResponse.data
        predictionsData.value = predictionsResponse.data
        modelPerformanceData.value = performanceResponse.data
        confidenceData.value = confidenceResponse.data
        activityData.value = activityResponse.data

        // Process the real data
        processRealData()

      } catch (err) {
        console.error('Failed to load analytics data:', err)
        error.value = err.response?.data?.message || 'Failed to load analytics data'
      } finally {
        loading.value = false
      }
    }

    const processRealData = () => {
      // Process predictions over time from real data
      if (predictionsData.value.daily_stats) {
        predictionsOverTime.value = predictionsData.value.daily_stats.map(day => ({
          date: day.date,
          successful: day.correct_predictions,
          failed: day.total_predictions - day.correct_predictions,
          total: day.total_predictions
        }))
      }

      // Process model performance from real data
      if (modelPerformanceData.value) {
        modelPerformance.value = modelPerformanceData.value.map(model => ({
          id: model.model_id,
          name: model.model_name,
          accuracy: model.accuracy * 100, // Convert to percentage
          predictions: model.total_predictions
        }))
      }

      // Process confidence distribution from real data
      if (confidenceData.value) {
        confidenceDistribution.value = confidenceData.value
      }

      // Process recent activity from real data
      if (activityData.value) {
        recentActivity.value = activityData.value.map(activity => ({
          id: activity.id,
          type: activity.activity_type,
          title: getActivityTitle(activity),
          time: formatTimeAgo(activity.timestamp),
          value: getActivityValue(activity),
          valueClass: getActivityValueClass(activity)
        }))
      }

      // Calculate model statistics from real data
      modelStats.value = {
        total: models.value.length,
        active: models.value.filter(m => m.status === 'active' || m.status === 'trained').length,
        trainingSamples: models.value.reduce((sum, model) => sum + (model.training_samples || 0), 0)
      }

      // Calculate performance metrics from real data
      const accuracies = modelPerformance.value.map(m => m.accuracy)
      performanceMetrics.value = {
        bestAccuracy: accuracies.length > 0 ? Math.max(...accuracies).toFixed(1) : '0.0',
        worstAccuracy: accuracies.length > 0 ? Math.min(...accuracies).toFixed(1) : '0.0',
        avgTrainingTime: calculateAverageTrainingTime(models.value)
      }

      // Calculate usage patterns from real data
      const mostUsedModel = modelPerformance.value.reduce((prev, current) => 
        (prev.predictions || 0) > (current.predictions || 0) ? prev : current, { predictions: 0 }
      )
      usagePatterns.value = {
        mostUsed: mostUsedModel?.name || 'None',
        avgDailyPredictions: Math.floor(totalPredictions.value / getDaysInRange(selectedRange.value)),
        peakHour: calculatePeakHour(predictionsData.value.hourly_stats)
      }
    }

    // Helper functions
    const getActivityTitle = (activity) => {
      const types = {
        'prediction': 'Digit Prediction',
        'training': 'Model Training',
        'model_create': 'New Model Created',
        'model_update': 'Model Updated'
      }
      return types[activity.activity_type] || 'Activity'
    }

    const getActivityValue = (activity) => {
      switch (activity.activity_type) {
        case 'prediction':
          return activity.predicted_digit || 'N/A'
        case 'training':
          return `${(activity.accuracy * 100).toFixed(1)}%`
        case 'model_create':
        case 'model_update':
          return activity.model_name || 'Unknown'
        default:
          return 'Completed'
      }
    }

    const getActivityValueClass = (activity) => {
      switch (activity.activity_type) {
        case 'prediction':
          return activity.is_correct ? 'success' : 'failed'
        case 'training':
          return 'success'
        default:
          return 'info'
      }
    }

    const formatTimeAgo = (timestamp) => {
      const now = new Date()
      const time = new Date(timestamp)
      const diffMs = now - time
      const diffMins = Math.floor(diffMs / 60000)
      const diffHours = Math.floor(diffMs / 3600000)
      const diffDays = Math.floor(diffMs / 86400000)

      if (diffMins < 1) return 'Just now'
      if (diffMins < 60) return `${diffMins} minutes ago`
      if (diffHours < 24) return `${diffHours} hours ago`
      return `${diffDays} days ago`
    }

    const calculateAverageTrainingTime = (models) => {
      const trainingTimes = models
        .filter(m => m.training_time)
        .map(m => m.training_time)
      
      if (trainingTimes.length === 0) return 'N/A'
      
      const avgMinutes = trainingTimes.reduce((sum, time) => sum + time, 0) / trainingTimes.length
      return avgMinutes > 60 ? 
        `${(avgMinutes / 60).toFixed(1)}h` : 
        `${Math.round(avgMinutes)}m`
    }

    const calculatePeakHour = (hourlyStats) => {
      if (!hourlyStats || hourlyStats.length === 0) return 'N/A'
      
      const peak = hourlyStats.reduce((prev, current) => 
        prev.count > current.count ? prev : current
      )
      return `${peak.hour}:00`
    }

    const getDaysInRange = (range) => {
      const ranges = {
        '7d': 7,
        '30d': 30,
        '90d': 90,
        '1y': 365,
        'all': 365
      }
      return ranges[range] || 30
    }

    const formatDateLabel = (dateString) => {
      const date = new Date(dateString)
      return selectedRange.value === '7d' ? 
        date.toLocaleDateString('en-US', { weekday: 'short' }) :
        date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    }

    // Reactive data
    const predictionsOverTime = ref([])
    const modelPerformance = ref([])
    const confidenceDistribution = ref([])
    const recentActivity = ref([])
    const modelStats = ref({})
    const performanceMetrics = ref({})
    const usagePatterns = ref({})

    // Computed properties
    const totalPredictions = computed(() => {
      return predictionsOverTime.value.reduce((sum, day) => sum + day.total, 0)
    })

    const overallAccuracy = computed(() => {
      const totalSuccessful = predictionsOverTime.value.reduce((sum, day) => sum + day.successful, 0)
      return totalPredictions.value > 0 ? ((totalSuccessful / totalPredictions.value) * 100).toFixed(1) : '0.0'
    })

    const averageConfidence = computed(() => {
      if (!confidenceDistribution.value.length) return '0.0'
      
      const total = confidenceDistribution.value.reduce((sum, bucket) => {
        const midRange = (parseInt(bucket.range.split('-')[0]) + parseInt(bucket.range.split('-')[1])) / 2
        return sum + (midRange * bucket.count)
      }, 0)
      const totalCount = confidenceDistribution.value.reduce((sum, bucket) => sum + bucket.count, 0)
      return totalCount > 0 ? (total / totalCount).toFixed(1) : '0.0'
    })

    const activeModelsCount = computed(() => {
      return models.value.filter(model => 
        model.status === 'active' || model.status === 'trained'
      ).length
    })

    const maxPredictions = computed(() => {
      return predictionsOverTime.value.length > 0 ? 
        Math.max(...predictionsOverTime.value.map(day => day.total)) : 1
    })

    const maxConfidenceCount = computed(() => {
      return confidenceDistribution.value.length > 0 ? 
        Math.max(...confidenceDistribution.value.map(bucket => bucket.count)) : 1
    })

    const digitAccuracy = computed(() => digitAccuracyData.value)

    // Trend calculations (you would implement real trend calculation based on historical data)
    const predictionTrend = computed(() => {
      // This would be calculated by comparing current period with previous period
      if (predictionsOverTime.value.length < 2) return 0
      return 5.2 // Placeholder - implement real calculation
    })

    const accuracyTrend = computed(() => {
      // This would be calculated by comparing current period with previous period
      if (predictionsOverTime.value.length < 2) return 0
      return 1.8 // Placeholder - implement real calculation
    })

    const confidenceTrend = computed(() => {
      // This would be calculated by comparing current period with previous period
      return 0.5 // Placeholder - implement real calculation
    })

    // Methods
    const getAccuracyClass = (accuracy) => {
      if (accuracy >= 99) return 'excellent'
      if (accuracy >= 97) return 'good'
      if (accuracy >= 95) return 'fair'
      return 'poor'
    }

    const updateAnalytics = async () => {
      await loadAnalyticsData()
    }

    const refreshData = async () => {
      await loadAnalyticsData()
    }

    const exportData = () => {
      const analyticsData = {
        models: models.value,
        predictions: predictionsOverTime.value,
        accuracy: digitAccuracy.value,
        performance: modelPerformance.value,
        confidence: confidenceDistribution.value,
        activity: recentActivity.value,
        statistics: {
          modelStats: modelStats.value,
          performanceMetrics: performanceMetrics.value,
          usagePatterns: usagePatterns.value
        },
        timestamp: new Date().toISOString(),
        filters: {
          range: selectedRange.value,
          model: selectedModel.value
        }
      }
      
      const dataStr = JSON.stringify(analyticsData, null, 2)
      const dataBlob = new Blob([dataStr], { type: 'application/json' })
      const url = URL.createObjectURL(dataBlob)
      const link = document.createElement('a')
      link.href = url
      link.download = `digit-recognition-analytics-${new Date().toISOString().split('T')[0]}.json`
      link.click()
      URL.revokeObjectURL(url)
    }

    onMounted(() => {
      loadAnalyticsData()
    })

    return {
      selectedRange,
      selectedModel,
      loading,
      error,
      models,
      predictionsOverTime,
      digitAccuracy,
      modelPerformance,
      confidenceDistribution,
      recentActivity,
      totalPredictions,
      overallAccuracy,
      averageConfidence,
      activeModelsCount,
      maxPredictions,
      maxConfidenceCount,
      predictionTrend,
      accuracyTrend,
      confidenceTrend,
      modelStats,
      performanceMetrics,
      usagePatterns,
      getAccuracyClass,
      updateAnalytics,
      refreshData,
      exportData,
      formatDateLabel
    }
  }
}
</script>

<style scoped>
/* Add new styles for error state and refresh button */
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 12px;
  margin-bottom: 32px;
}

.error-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.error-state h3 {
  color: #dc2626;
  margin-bottom: 8px;
}

.error-state p {
  color: #7f1d1d;
  margin-bottom: 20px;
}

.retry-btn {
  background: #dc2626;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 10px 20px;
  cursor: pointer;
  font-weight: 500;
}

.retry-btn:hover {
  background: #b91c1c;
}

.refresh-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 8px 16px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.refresh-btn:hover:not(:disabled) {
  background: #2563eb;
}

.refresh-btn:disabled {
  background: #9ca3af;
  cursor: not-allowed;
}

.no-data {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #64748b;
  font-style: italic;
}

/* Update activity value styles */
.activity-value.failed {
  background: #fef2f2;
  color: #dc2626;
}

/* Keep all your existing styles below */
/* ... (all your existing CSS styles remain the same) ... */

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
}

.loading-state .loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f1f5f9;
  border-top: 4px solid #059669;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

.loading-state p {
  color: #64748b;
  font-size: 16px;
  margin: 0;
}

.metric-change.negative {
  color: #ef4444;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Recent Activity Styles */
.recent-activity {
  display: flex;
  flex-direction: column;
  gap: 12px;
  height: 100%;
}

.activity-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px;
  border-radius: 6px;
  transition: background-color 0.2s ease;
}

.activity-item:hover {
  background: #f8fafc;
}

.activity-icon {
  width: 32px;
  height: 32px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.activity-icon.prediction {
  background: #dbeafe;
  color: #1d4ed8;
}

.activity-icon.training {
  background: #f0fdf4;
  color: #059669;
}

.activity-icon.model {
  background: #fef3c7;
  color: #d97706;
}

.activity-details {
  flex: 1;
}

.activity-title {
  font-size: 14px;
  font-weight: 500;
  color: #1e293b;
  margin-bottom: 2px;
}

.activity-time {
  font-size: 12px;
  color: #64748b;
}

.activity-value {
  font-size: 14px;
  font-weight: 600;
  padding: 4px 8px;
  border-radius: 4px;
}

.activity-value.success {
  background: #f0fdf4;
  color: #059669;
}

.activity-value.info {
  background: #eff6ff;
  color: #1d4ed8;
}

/* Keep all your existing styles below */
.analytics {
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

/* Filters */
.filters {
  display: flex;
  gap: 16px;
  align-items: end;
  margin-bottom: 32px;
  flex-wrap: wrap;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.filter-group label {
  font-size: 14px;
  font-weight: 500;
  color: #374151;
}

.filter-select {
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  background: white;
  min-width: 120px;
}

.export-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #059669;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 8px 16px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.export-btn:hover {
  background: #047857;
}

/* Metrics Overview */
.metrics-overview {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 32px;
}

.metric-card.large {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1);
  text-align: center;
}

.metric-card.large .metric-value {
  font-size: 36px;
  font-weight: 700;
  color: #059669;
  margin-bottom: 8px;
}

.metric-card.large .metric-label {
  font-size: 16px;
  color: #64748b;
  margin-bottom: 12px;
}

.metric-change {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  font-size: 14px;
  font-weight: 500;
}

.metric-change.positive {
  color: #059669;
}

.metric-change.neutral {
  color: #64748b;
}

/* Charts Grid */
.charts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 24px;
  margin-bottom: 48px;
}

.chart-card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1);
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.chart-header h3 {
  font-size: 18px;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
}

.chart-legend {
  display: flex;
  gap: 16px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #64748b;
}

.legend-color {
  width: 12px;
  height: 12px;
  border-radius: 2px;
}

.legend-color.success {
  background: #059669;
}

.legend-color.failed {
  background: #ef4444;
}

.chart-container {
  height: 200px;
}

/* Bar Chart */
.bar-chart {
  display: flex;
  align-items: end;
  gap: 12px;
  height: 100%;
  padding: 0 20px;
}

.bar-group {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  flex: 1;
}

.bar-label {
  font-size: 12px;
  color: #64748b;
}

.bars {
  display: flex;
  align-items: end;
  gap: 2px;
  height: 140px;
  width: 100%;
}

.bar {
  flex: 1;
  border-radius: 2px 2px 0 0;
  transition: all 0.3s ease;
  min-height: 2px;
}

.bar.success {
  background: #059669;
}

.bar.failed {
  background: #ef4444;
}

.bar-total {
  font-size: 12px;
  font-weight: 600;
  color: #374151;
}

/* Accuracy Chart */
.accuracy-chart {
  display: flex;
  flex-direction: column;
  gap: 12px;
  height: 100%;
}

.accuracy-item {
  display: flex;
  align-items: center;
  gap: 12px;
}

.digit {
  width: 20px;
  font-weight: 600;
  color: #475569;
  font-size: 14px;
}

.accuracy-bar-container {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 8px;
}

.accuracy-bar {
  height: 16px;
  border-radius: 8px;
  transition: width 0.3s ease;
  min-width: 2px;
}

.accuracy-bar.excellent {
  background: #059669;
}

.accuracy-bar.good {
  background: #10b981;
}

.accuracy-bar.fair {
  background: #f59e0b;
}

.accuracy-bar.poor {
  background: #ef4444;
}

.accuracy-value {
  width: 50px;
  font-size: 12px;
  color: #64748b;
  text-align: right;
}

/* Model Comparison */
.model-comparison {
  display: flex;
  flex-direction: column;
  gap: 16px;
  height: 100%;
}

.model-bar {
  display: flex;
  align-items: center;
  gap: 12px;
}

.model-name {
  width: 120px;
  font-size: 14px;
  color: #374151;
  font-weight: 500;
}

.performance-bar-container {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 8px;
}

.performance-bar {
  height: 20px;
  background: linear-gradient(90deg, #059669, #10b981);
  border-radius: 10px;
  transition: width 0.3s ease;
  min-width: 2px;
}

.performance-value {
  width: 50px;
  font-size: 14px;
  font-weight: 600;
  color: #059669;
  text-align: right;
}

.model-stats {
  width: 100px;
  font-size: 12px;
  color: #64748b;
  text-align: right;
}

/* Confidence Distribution */
.confidence-distribution {
  display: flex;
  flex-direction: column;
  gap: 12px;
  height: 100%;
}

.confidence-bucket {
  display: flex;
  align-items: center;
  gap: 12px;
}

.bucket-range {
  width: 50px;
  font-size: 12px;
  color: #475569;
  font-weight: 500;
}

.bucket-bar-container {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 8px;
}

.bucket-bar {
  height: 16px;
  background: linear-gradient(90deg, #6366f1, #8b5cf6);
  border-radius: 8px;
  transition: width 0.3s ease;
  min-width: 2px;
}

.bucket-count {
  width: 40px;
  font-size: 12px;
  color: #64748b;
  text-align: right;
}

/* Usage Chart */
.usage-chart {
  display: flex;
  align-items: end;
  gap: 8px;
  height: 100%;
  padding: 0 20px;
}

.usage-hour {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  flex: 1;
}

.hour-label {
  font-size: 11px;
  color: #64748b;
}

.usage-bar-container {
  height: 140px;
  width: 100%;
  display: flex;
  align-items: end;
}

.usage-bar {
  width: 100%;
  background: linear-gradient(to top, #f59e0b, #d97706);
  border-radius: 2px 2px 0 0;
  transition: height 0.3s ease;
  min-height: 2px;
}

.usage-count {
  font-size: 11px;
  color: #374151;
  font-weight: 500;
}

/* Sentiment Chart */
.sentiment-chart {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 40px;
  height: 100%;
}

.sentiment-donut {
  position: relative;
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: conic-gradient(#059669 0deg var(--correct-angle, 0deg), #ef4444 var(--correct-angle, 0deg) 360deg);
}

.donut-segment {
  position: absolute;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  clip-path: polygon(50% 50%, 50% 0%, 100% 0%, 100% 100%, 50% 100%);
}

.donut-segment.correct {
  background: #059669;
}

.donut-segment.incorrect {
  background: #ef4444;
}

.donut-center {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 60px;
  height: 60px;
  background: white;
  border-radius: 50%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.donut-value {
  font-size: 16px;
  font-weight: 700;
  color: #059669;
}

.donut-label {
  font-size: 10px;
  color: #64748b;
}

.sentiment-legend {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.sentiment-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
}

.sentiment-color {
  width: 12px;
  height: 12px;
  border-radius: 2px;
}

.sentiment-color.correct {
  background: #059669;
}

.sentiment-color.incorrect {
  background: #ef4444;
}

.sentiment-item strong {
  color: #1e293b;
  margin-left: 4px;
}

/* Detailed Statistics */
.detailed-stats {
  margin-bottom: 48px;
}

.detailed-stats h2 {
  font-size: 24px;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 24px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
}

.stat-card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1);
}

.stat-card h4 {
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 16px;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #f1f5f9;
}

.stat-item:last-child {
  border-bottom: none;
}

.stat-item span {
  color: #64748b;
  font-size: 14px;
}

.stat-item strong {
  color: #1e293b;
  font-size: 14px;
  font-weight: 600;
}

/* Responsive */
@media (max-width: 768px) {
  .charts-grid {
    grid-template-columns: 1fr;
  }
  
  .filters {
    flex-direction: column;
    align-items: stretch;
  }
  
  .filter-group {
    width: 100%;
  }
  
  .filter-select {
    width: 100%;
  }
  
  .sentiment-chart {
    flex-direction: column;
    gap: 20px;
  }
  
  .metrics-overview {
    grid-template-columns: 1fr 1fr;
  }
}
</style>
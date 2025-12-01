<template>
  <div class="dashboard-home">
    <div class="page-header">
      <h1>Dashboard</h1>
      <p>Welcome back! Here's your digital recognition overview</p>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading-state">
      <div class="loading-spinner"></div>
      <p>Loading data...</p>
    </div>

    <!-- Quick Stats -->
    <div v-else class="stats-overview">
      <div class="stat-card">
        <div class="stat-icon predictions">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
          </svg>
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ dashboardStats.totalPredictions.toLocaleString() }}</div>
          <div class="stat-label">Total Predictions</div>
          <div class="stat-change" :class="getChangeClass(dashboardStats.predictionChange)">
            {{ formatChange(dashboardStats.predictionChange) }}
          </div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon accuracy">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
            <polyline points="22 4 12 14.01 9 11.01"/>
          </svg>
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ dashboardStats.accuracy.toFixed(1) }}%</div>
          <div class="stat-label">Overall Accuracy</div>
          <div class="stat-change" :class="getChangeClass(dashboardStats.accuracyChange)">
            {{ formatChange(dashboardStats.accuracyChange, true) }}
          </div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon models">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
            <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
            <line x1="12" y1="22.08" x2="12" y2="12"/>
          </svg>
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ dashboardStats.activeModels }}</div>
          <div class="stat-label">Active Models</div>
          <div v-if="dashboardStats.activeModelName" class="stat-change positive">
            {{ dashboardStats.activeModelName }}
          </div>
          <div v-else class="stat-change neutral">
            No model active
          </div>
        </div>
      </div>
    </div>

    <!-- Quick Actions -->
    <div class="quick-actions-section">
      <h2>Quick Actions</h2>
      <div class="actions-grid">
        <router-link :to="{ name: 'DigitRecognition' }" class="action-card">
          <div class="action-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
              <polyline points="7.5 4.21 12 6.81 16.5 4.21"/>
              <polyline points="7.5 19.79 7.5 14.6 3 12"/>
              <polyline points="21 12 16.5 14.6 16.5 19.79"/>
              <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
              <line x1="12" y1="22.08" x2="12" y2="12"/>
            </svg>
          </div>
          <div class="action-content">
            <h3>Digital Recognition</h3>
            <p>Upload handwritten digit images for real-time recognition</p>
          </div>
          <div class="action-arrow">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="5" y1="12" x2="19" y2="12"/>
              <polyline points="12 5 19 12 12 19"/>
            </svg>
          </div>
        </router-link>

        <router-link :to="{ name: 'ModelManagement' }" class="action-card">
          <div class="action-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M20 14.66V20a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h5.34"/>
              <polygon points="18 2 22 6 12 16 8 16 8 12 18 2"/>
            </svg>
          </div>
          <div class="action-content">
            <h3>AI Models</h3>
            <p>Manage MNIST recognition models and training configurations</p>
          </div>
          <div class="action-arrow">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="5" y1="12" x2="19" y2="12"/>
              <polyline points="12 5 19 12 12 19"/>
            </svg>
          </div>
        </router-link>
      </div>
    </div>

    <!-- Recent Activity -->
    <div class="recent-activity">
      <div class="activity-header">
        <h2>Recent Activity</h2>
        <router-link :to="{ name: 'Analytics' }" class="view-all-link">
          View All
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="5" y1="12" x2="19" y2="12"/>
            <polyline points="12 5 19 12 12 19"/>
          </svg>
        </router-link>
      </div>
      <div class="activity-list">
        <div 
          v-for="activity in recentActivities" 
          :key="activity.id"
          class="activity-item"
        >
          <div class="activity-icon" :class="activity.type">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path v-if="activity.type === 'prediction'" d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
              <path v-if="activity.type === 'deployment'" d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              <path v-if="activity.type === 'training'" d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2v11z"/>
            </svg>
          </div>
          <div class="activity-content">
            <div class="activity-message">{{ activity.message }}</div>
            <div class="activity-time">{{ formatTime(activity.timestamp) }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, computed, onUnmounted } from 'vue'
import { useDashboardStore } from '@/stores/dashboard'

export default {
  name: 'DashboardHome',
  setup() {
    const dashboardStore = useDashboardStore()
    const loading = ref(true)
    
    // Computed properties from store
    const dashboardStats = computed(() => dashboardStore.dashboardStats)
    const recentActivities = computed(() => dashboardStore.recentActivities)
    
    // Translations for dashboard
    const translations = {
      en: {
        welcomeBack: "Welcome back! Here's your digital recognition overview",
        totalPredictions: "Total Predictions",
        overallAccuracy: "Overall Accuracy",
        activeModels: "Active Models",
        quickActions: "Quick Actions",
        digitalRecognition: "Digital Recognition",
        uploadHandwritten: "Upload handwritten digit images for real-time recognition",
        aiModels: "AI Models",
        manageModels: "Manage MNIST recognition models and training configurations",
        recentActivity: "Recent Activity",
        viewAll: "View All",
        loading: "Loading data...",
        noChange: "No change",
        noModelActive: "No model active",
        newModelDeployment: "New model deployment",
        modelTrainingCompleted: "Model training completed",
        digitPredictionCompleted: "Digit prediction completed"
      },
      zh: {
        welcomeBack: "欢迎回来！这是您的数字识别概览",
        totalPredictions: "总预测数",
        overallAccuracy: "整体准确率",
        activeModels: "活跃模型",
        quickActions: "快速操作",
        digitalRecognition: "数字识别",
        uploadHandwritten: "上传手写数字图像进行实时识别",
        aiModels: "AI模型",
        manageModels: "管理MNIST识别模型和训练配置",
        recentActivity: "最近活动",
        viewAll: "查看全部",
        loading: "加载数据...",
        noChange: "无变化",
        noModelActive: "无活跃模型",
        newModelDeployment: "新模型部署",
        modelTrainingCompleted: "模型训练完成",
        digitPredictionCompleted: "数字预测完成"
      }
    }
    
    // Translation function
    const t = (key) => {
      return translations[currentLanguage.value][key] || key
    }

    
    // Listen for storage events (updates from other tabs/windows)
    const handleStorageChange = (e) => {
      if (e.key === 'totalPredictions') {
        // Force reload from localStorage
        const newValue = Number(localStorage.getItem('totalPredictions'))
        if (newValue !== dashboardStore.totalPredictions) {
          dashboardStore.totalPredictions = newValue
        }
      }
    }
    
    // Fetch data on mount
    const fetchDashboardData = async () => {
      try {
        loading.value = true
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 800))
        dashboardStore.loadMockData()
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error)
        dashboardStore.loadMockData()
      } finally {
        loading.value = false
      }
    }
    
    // Helper methods
    const getChangeClass = (change) => {
      if (change > 0) return 'positive'
      if (change < 0) return 'negative'
      return 'neutral'
    }
    
    const formatChange = (change, isPercentage = false) => {
      if (change === 0) return 'No change'
      const sign = change > 0 ? '+' : ''
      const value = isPercentage ? change.toFixed(1) : Math.abs(change)
      const unit = isPercentage ? '%' : ''
      return `${sign}${value}${unit}`
    }
    
    const formatTime = (timestamp) => {
      const now = new Date()
      const past = new Date(timestamp)
      const diff = now - past
      const days = Math.floor(diff / 86400000)
      const hours = Math.floor(diff / 3600000)
      const minutes = Math.floor(diff / 60000)
      
      if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`
      if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`
      if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`
      return 'Just now'
    }
    
    onMounted(() => {
      fetchDashboardData()
      // Add event listener for cross-tab updates
      window.addEventListener('storage', handleStorageChange)
    })
    
    onUnmounted(() => {
      // Clean up event listener
      window.removeEventListener('storage', handleStorageChange)
    })
    
    return {
      dashboardStats,
      recentActivities,
      loading,
      getChangeClass,
      formatChange,
      formatTime
    }
  }
}
</script>

<style scoped>
.dashboard-home {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 120px 0;
  color: #64748b;
}

.loading-spinner {
  width: 60px;
  height: 60px;
  border: 6px solid #f1f5f9;
  border-top: 6px solid #059669;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 24px;
}

.stat-change.negative {
  color: #ef4444;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.page-header {
  margin-bottom: 48px;
}

.page-header h1 {
  font-size: 36px;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 12px;
}

.page-header p {
  color: #64748b;
  font-size: 18px;
  line-height: 1.6;
}

.stats-overview {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
  margin-bottom: 60px;
}

.stat-card {
  background: white;
  border-radius: 16px;
  padding: 32px;
  box-shadow: 0 2px 8px 0 rgb(0 0 0 / 0.1);
  display: flex;
  align-items: center;
  gap: 20px;
  transition: all 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px -5px rgb(0 0 0 / 0.1), 0 4px 10px -6px rgb(0 0 0 / 0.1);
}

.stat-icon {
  width: 64px;
  height: 64px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.stat-icon.predictions {
  background: #f0fdf4;
  color: #059669;
}

.stat-icon.accuracy {
  background: #fef7cd;
  color: #d97706;
}

.stat-icon.models {
  background: #dbeafe;
  color: #1d4ed8;
}

.stat-content {
  flex: 1;
}

.stat-value {
  font-size: 32px;
  font-weight: 800;
  color: #1e293b;
  margin-bottom: 8px;
}

.stat-label {
  font-size: 16px;
  color: #64748b;
  margin-bottom: 8px;
  font-weight: 500;
}

.stat-change {
  font-size: 14px;
  font-weight: 600;
}

.stat-change.positive {
  color: #059669;
}

.stat-change.neutral {
  color: #64748b;
}

.quick-actions-section {
  margin-bottom: 60px;
}

.quick-actions-section h2 {
  font-size: 28px;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 32px;
}

.actions-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24px;
}

.action-card {
  background: white;
  border-radius: 16px;
  padding: 32px;
  box-shadow: 0 2px 8px 0 rgb(0 0 0 / 0.1);
  display: flex;
  align-items: center;
  gap: 20px;
  text-decoration: none;
  color: inherit;
  transition: all 0.3s ease;
  border: 2px solid transparent;
  cursor: pointer;
  min-height: 140px;
}

.action-card:hover {
  border-color: #059669;
  transform: translateY(-4px);
  box-shadow: 0 8px 25px -5px rgb(0 0 0 / 0.1);
}

.action-icon {
  width: 64px;
  height: 64px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f0fdf4;
  color: #059669;
  flex-shrink: 0;
  font-size: 24px;
}

.action-content {
  flex: 1;
}

.action-content h3 {
  font-size: 20px;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 8px;
}

.action-content p {
  font-size: 15px;
  color: #64748b;
  margin: 0;
  line-height: 1.5;
}

.action-arrow {
  color: #64748b;
  flex-shrink: 0;
  transition: all 0.3s ease;
  font-size: 20px;
}

.action-card:hover .action-arrow {
  color: #059669;
  transform: translateX(8px);
}

.recent-activity {
  background: white;
  border-radius: 16px;
  padding: 32px;
  box-shadow: 0 2px 8px 0 rgb(0 0 0 / 0.1);
  margin-bottom: 60px;
}

.activity-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
}

.activity-header h2 {
  font-size: 24px;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
}

.view-all-link {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #059669;
  text-decoration: none;
  font-size: 16px;
  font-weight: 600;
  transition: all 0.3s ease;
}

.view-all-link:hover {
  gap: 12px;
}

.activity-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.activity-item {
  display: flex;
  align-items: flex-start;
  gap: 20px;
  padding: 20px;
  border-radius: 12px;
  background: #f8fafc;
  transition: all 0.3s ease;
}

.activity-item:hover {
  background: #f1f5f9;
  transform: translateX(4px);
}

.activity-icon {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  margin-top: 2px;
  font-size: 16px;
}

.activity-icon.prediction {
  background: #d1fae5;
  color: #059669;
}

.activity-icon.deployment {
  background: #dbeafe;
  color: #1d4ed8;
}

.activity-icon.training {
  background: #fef3c7;
  color: #d97706;
}

.activity-content {
  flex: 1;
}

.activity-message {
  font-size: 16px;
  color: #374151;
  margin-bottom: 6px;
  line-height: 1.5;
}

.activity-time {
  font-size: 14px;
  color: #64748b;
  font-weight: 500;
}

@media (min-width: 1024px) {
  .dashboard-home {
    padding: 0 20px;
  }
  
  .stats-overview {
    grid-template-columns: repeat(3, 1fr);
  }
  
  .actions-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .stat-card:hover .stat-value {
    color: #059669;
  }
}

@media (max-width: 1023px) {
  .stats-overview {
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
  }
  
  .actions-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 640px) {
  .stats-overview {
    grid-template-columns: 1fr;
  }
  
  .page-header h1 {
    font-size: 28px;
  }
  
  .page-header p {
    font-size: 16px;
  }
  
  .activity-header {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }
  
  .view-all-link {
    align-self: flex-end;
  }
}
</style>
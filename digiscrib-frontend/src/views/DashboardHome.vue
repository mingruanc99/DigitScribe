<template>
  <div class="dashboard-home">
    <div class="page-header">
      <h1>控制面板</h1>
      <p>欢迎回来！这是您的数字识别概览</p>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading-state">
      <div class="loading-spinner"></div>
      <p>加载数据中...</p>
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
          <div class="stat-label">总预测次数</div>
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
          <div class="stat-label">整体准确率</div>
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
          <div class="stat-label">活跃模型</div>
          <div class="stat-change neutral">无变化</div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon feedback">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
          </svg>
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ dashboardStats.feedbackCount }}</div>
          <div class="stat-label">收到反馈</div>
          <div class="stat-change" :class="getChangeClass(dashboardStats.feedbackChange)">
            {{ formatChange(dashboardStats.feedbackChange) }}
          </div>
        </div>
      </div>
    </div>

    <!-- Rest of the template remains the same -->
 <!-- Quick Actions -->
<div class="quick-actions-section">
  <h2>快速操作</h2>
  <div class="actions-grid">
    <router-link to="/mnist/predict" class="action-card">
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
        <h3>数字识别</h3>
        <p>上传手写数字图片进行实时识别预测</p>
      </div>
      <div class="action-arrow">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="5" y1="12" x2="19" y2="12"/>
          <polyline points="12 5 19 12 12 19"/>
        </svg>
      </div>
    </router-link>

    <router-link to="/models" class="action-card">
      <div class="action-icon">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M20 14.66V20a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h5.34"/>
          <polygon points="18 2 22 6 12 16 8 16 8 12 18 2"/>
        </svg>
      </div>
      <div class="action-content">
        <h3>AI模型</h3>
        <p>管理MNIST识别模型和训练配置</p>
      </div>
      <div class="action-arrow">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="5" y1="12" x2="19" y2="12"/>
          <polyline points="12 5 19 12 12 19"/>
        </svg>
      </div>
    </router-link>

    <router-link to="/analytics" class="action-card">
      <div class="action-icon">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M3 3v18h18"/>
          <path d="M18.7 8l-5.1 5.2-2.8-2.7L7 14.3"/>
          <path d="M18 14l-5.1-5.2-2.8 2.7"/>
        </svg>
      </div>
      <div class="action-content">
        <h3>性能分析</h3>
        <p>查看模型准确率、混淆矩阵和性能指标</p>
      </div>
      <div class="action-arrow">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="5" y1="12" x2="19" y2="12"/>
          <polyline points="12 5 19 12 12 19"/>
        </svg>
      </div>
    </router-link>

    <router-link to="/feedback" class="action-card">
      <div class="action-icon">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
        </svg>
      </div>
      <div class="action-content">
        <h3>反馈系统</h3>
        <p>查看用户反馈和改进模型准确性</p>
      </div>
      <div class="action-arrow">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="5" y1="12" x2="19" y2="12"/>
          <polyline points="12 5 19 12 12 19"/>
        </svg>
      </div>
    </router-link>

    <router-link to="/admin" class="action-card">
      <div class="action-icon">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M12 2L2 7l10 5 10-5-10-5z"/>
          <path d="M2 17l10 5 10-5"/>
          <path d="M2 12l10 5 10-5"/>
        </svg>
      </div>
      <div class="action-content">
        <h3>管理面板</h3>
        <p>系统设置、用户管理和数据监控</p>
      </div>
      <div class="action-arrow">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="5" y1="12" x2="19" y2="12"/>
          <polyline points="12 5 19 12 12 19"/>
        </svg>
      </div>
    </router-link>

    <router-link to="/dataset" class="action-card">
      <div class="action-icon">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <ellipse cx="12" cy="5" rx="9" ry="3"/>
          <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/>
          <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/>
        </svg>
      </div>
      <div class="action-content">
        <h3>数据集管理</h3>
        <p>浏览和上传MNIST训练数据集</p>
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
        <h2>最近活动</h2>
        <router-link to="/dashboard/analytics" class="view-all-link">
          查看全部
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
              <path v-if="activity.type === 'success'" d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
              <polyline v-if="activity.type === 'success'" points="22 4 12 14.01 9 11.01"/>
              <path v-if="activity.type === 'training'" d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
              <path v-if="activity.type === 'feedback'" d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
              <path v-if="activity.type === 'user'" d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle v-if="activity.type === 'user'" cx="12" cy="7" r="4"/>
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
import { ref, onMounted } from 'vue'
import api from '@/services/api'
import authService from '@/services/authService'

export default {
  name: 'DashboardHome',
  setup() {
    const loading = ref(true)
    const dashboardStats = ref({
      totalPredictions: 0,
      accuracy: 0,
      activeModels: 0,
      feedbackCount: 0,
      predictionChange: 0,
      accuracyChange: 0,
      feedbackChange: 0
    })
    
    const recentActivities = ref([])

    const fetchDashboardData = async () => {
      try {
        loading.value = true
        
        const [statsResponse, activitiesResponse] = await Promise.all([
          api.get('/dashboard/stats'),
          api.get('/activities/recent')
        ])
        
        dashboardStats.value = statsResponse.data
        recentActivities.value = activitiesResponse.data
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error)
        // Fallback to mock data if API fails
        dashboardStats.value = {
          totalPredictions: 15420,
          accuracy: 98.3,
          activeModels: 3,
          feedbackCount: 1323,
          predictionChange: 12.5,
          accuracyChange: 2.3,
          feedbackChange: 8.2
        }
        recentActivities.value = getMockActivities()
      } finally {
        loading.value = false
      }
    }

    const getChangeClass = (change) => {
      if (change > 0) return 'positive'
      if (change < 0) return 'negative'
      return 'neutral'
    }

    const formatChange = (change, isPercentage = false) => {
      if (change === 0) return '无变化'
      const sign = change > 0 ? '+' : ''
      const value = isPercentage ? change.toFixed(1) : Math.abs(change)
      const unit = isPercentage ? '%' : ''
      return `${sign}${value}${unit}`
    }

    const formatTime = (timestamp) => {
      const now = new Date()
      const diff = now - new Date(timestamp)
      const days = Math.floor(diff / 86400000)
      const hours = Math.floor(diff / 3600000)
      const minutes = Math.floor(diff / 60000)
      
      if (days > 0) return `${days}天前`
      if (hours > 0) return `${hours}小时前`
      if (minutes > 0) return `${minutes}分钟前`
      return '刚刚'
    }

    const getMockActivities = () => {
      return [
        {
          id: 1,
          type: 'success',
          message: '数字8预测成功，置信度95%',
          timestamp: new Date(Date.now() - 120000)
        },
        {
          id: 2,
          type: 'training',
          message: '模型"CNN增强版"训练完成',
          timestamp: new Date(Date.now() - 3600000)
        },
        {
          id: 3,
          type: 'feedback',
          message: '收到关于预测准确性的新反馈',
          timestamp: new Date(Date.now() - 10800000)
        },
        {
          id: 4,
          type: 'user',
          message: '新用户注册: alex.johnson@example.com',
          timestamp: new Date(Date.now() - 18000000)
        }
      ]
    }

    onMounted(() => {
      fetchDashboardData()
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
/* Add desktop-first base styles */
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
  padding: 120px 0; /* Increased for desktop */
  color: #64748b;
}

.loading-spinner {
  width: 60px; /* Larger for desktop */
  height: 60px;
  border: 6px solid #f1f5f9;
  border-top: 6px solid #059669;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 24px; /* Increased spacing */
}

.stat-change.negative {
  color: #ef4444;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.page-header {
  margin-bottom: 48px; /* More space on desktop */
}

.page-header h1 {
  font-size: 36px; /* Larger title for desktop */
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 12px;
}

.actions-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr); /* 改为3列 */
  gap: 24px;
}

.page-header p {
  color: #64748b;
  font-size: 18px; /* Larger subtitle */
  line-height: 1.6;
}

/* DESKTOP IMPROVEMENT: Wider stats grid */
.stats-overview {
  display: grid;
  grid-template-columns: repeat(4, 1fr); /* Fixed 4 columns for desktop */
  gap: 24px; /* More gap on desktop */
  margin-bottom: 60px; /* More space between sections */
}

.stat-card {
  background: white;
  border-radius: 16px; /* Slightly larger radius */
  padding: 32px; /* More padding on desktop */
  box-shadow: 0 2px 8px 0 rgb(0 0 0 / 0.1); /* Slightly stronger shadow */
  display: flex;
  align-items: center;
  gap: 20px; /* More gap between icon and content */
  transition: all 0.3s ease; /* Smoother transition */
}

.stat-card:hover {
  transform: translateY(-4px); /* More pronounced hover effect */
  box-shadow: 0 8px 25px -5px rgb(0 0 0 / 0.1), 0 4px 10px -6px rgb(0 0 0 / 0.1);
}

.stat-icon {
  width: 64px; /* Larger icons for desktop */
  height: 64px;
  border-radius: 16px; /* Larger radius */
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

.stat-icon.feedback {
  background: #f3e8ff;
  color: #7c3aed;
}

.stat-content {
  flex: 1;
}

.stat-value {
  font-size: 32px; /* Larger numbers for desktop */
  font-weight: 800; /* Bolder for emphasis */
  color: #1e293b;
  margin-bottom: 8px;
}

.stat-label {
  font-size: 16px; /* Larger labels */
  color: #64748b;
  margin-bottom: 8px;
  font-weight: 500;
}

.stat-change {
  font-size: 14px; /* Slightly larger */
  font-weight: 600; /* Bolder */
}

.stat-change.positive {
  color: #059669;
}

.stat-change.neutral {
  color: #64748b;
}

.quick-actions-section {
  margin-bottom: 60px; /* More space */
}

.quick-actions-section h2 {
  font-size: 28px; /* Larger section title */
  font-weight: 700; /* Bolder */
  color: #1e293b;
  margin-bottom: 32px; /* More space below title */
}

/* DESKTOP IMPROVEMENT: Fixed columns for actions */
.actions-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr); /* Fixed 2 columns for desktop */
  gap: 24px; /* More gap */
}

.action-card {
  background: white;
  border-radius: 16px; /* Larger radius */
  padding: 32px; /* More padding */
  box-shadow: 0 2px 8px 0 rgb(0 0 0 / 0.1);
  display: flex;
  align-items: center;
  gap: 20px; /* More gap */
  text-decoration: none;
  color: inherit;
  transition: all 0.3s ease;
  border: 2px solid transparent;
  cursor: pointer;
  min-height: 140px; /* Fixed height for consistency */
}

.action-card:hover {
  border-color: #059669;
  transform: translateY(-4px); /* More pronounced hover */
  box-shadow: 0 8px 25px -5px rgb(0 0 0 / 0.1);
}

.action-card.coming-soon {
  opacity: 0.6; /* Slightly less opaque */
  cursor: not-allowed;
}

.action-card.coming-soon:hover {
  transform: none;
  border-color: transparent;
  box-shadow: 0 2px 8px 0 rgb(0 0 0 / 0.1);
}

.action-icon {
  width: 64px; /* Larger icons */
  height: 64px;
  border-radius: 16px; /* Larger radius */
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f0fdf4;
  color: #059669;
  flex-shrink: 0;
  font-size: 24px; /* Larger icon size */
}

.action-content {
  flex: 1;
}

.action-content h3 {
  font-size: 20px; /* Larger action titles */
  font-weight: 700; /* Bolder */
  color: #1e293b;
  margin-bottom: 8px;
}

.action-content p {
  font-size: 15px; /* Slightly larger description */
  color: #64748b;
  margin: 0;
  line-height: 1.5;
}

.coming-soon-badge {
  display: inline-block;
  background: #fef3c7;
  color: #92400e;
  font-size: 12px;
  font-weight: 600; /* Bolder */
  padding: 4px 12px; /* More padding */
  border-radius: 16px; /* Larger radius */
  margin-top: 8px;
}

.action-arrow {
  color: #64748b;
  flex-shrink: 0;
  transition: all 0.3s ease;
  font-size: 20px; /* Larger arrow */
}

.action-card:hover .action-arrow {
  color: #059669;
  transform: translateX(8px); /* More movement on hover */
}

.recent-activity {
  background: white;
  border-radius: 16px; /* Larger radius */
  padding: 32px; /* More padding */
  box-shadow: 0 2px 8px 0 rgb(0 0 0 / 0.1);
  margin-bottom: 60px; /* More space below */
}

.activity-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px; /* More space */
}

.activity-header h2 {
  font-size: 24px; /* Larger title */
  font-weight: 700; /* Bolder */
  color: #1e293b;
  margin: 0;
}

.view-all-link {
  display: flex;
  align-items: center;
  gap: 8px; /* More gap */
  color: #059669;
  text-decoration: none;
  font-size: 16px; /* Larger text */
  font-weight: 600; /* Bolder */
  transition: all 0.3s ease;
}

.view-all-link:hover {
  gap: 12px; /* More movement */
}

.activity-list {
  display: flex;
  flex-direction: column;
  gap: 20px; /* More gap between items */
}

.activity-item {
  display: flex;
  align-items: flex-start;
  gap: 20px; /* More gap */
  padding: 20px; /* More padding */
  border-radius: 12px; /* Larger radius */
  background: #f8fafc;
  transition: all 0.3s ease;
}

.activity-item:hover {
  background: #f1f5f9;
  transform: translateX(4px); /* Subtle hover movement */
}

.activity-icon {
  width: 40px; /* Larger icons */
  height: 40px;
  border-radius: 12px; /* Larger radius */
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  margin-top: 2px;
  font-size: 16px; /* Larger icon size */
}

.activity-icon.success {
  background: #d1fae5;
  color: #059669;
}

.activity-icon.training {
  background: #dbeafe;
  color: #1d4ed8;
}

.activity-icon.feedback {
  background: #f3e8ff;
  color: #7c3aed;
}

.activity-icon.user {
  background: #fef3c7;
  color: #d97706;
}

.activity-content {
  flex: 1;
}

.activity-message {
  font-size: 16px; /* Larger text */
  color: #374151;
  margin-bottom: 6px;
  line-height: 1.5;
}

.activity-time {
  font-size: 14px; /* Slightly larger */
  color: #64748b;
  font-weight: 500;
}

/* DESKTOP-ONLY: Remove mobile constraints and add desktop enhancements */
@media (min-width: 1024px) {
  .dashboard-home {
    padding: 0 20px; /* Add side padding only on desktop */
  }
  
  .stats-overview {
    grid-template-columns: repeat(4, 1fr); /* Ensure 4 columns */
  }
  
  .actions-grid {
    grid-template-columns: repeat(2, 1fr); /* Ensure 2 columns */
  }
  
  /* Add hover effects that only work well on desktop */
  .stat-card:hover .stat-value {
    color: #059669; /* Color change on hover */
  }
}

/* MOBILE: Only apply mobile styles when actually needed */
@media (max-width: 1023px) {
  .stats-overview {
    grid-template-columns: repeat(2, 1fr); /* 2 columns on tablet */
    gap: 16px;
  }
  
  .actions-grid {
    grid-template-columns: 1fr; /* Single column on tablet */
  }
}

@media (max-width: 640px) {
  .stats-overview {
    grid-template-columns: 1fr; /* Single column on mobile */
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
<template>
  <div class="user-profile">
    <div class="profile-header">
      <h1>{{ t('userProfile') }}</h1>
      <p>{{ t('manageYourAccount') }}</p>
    </div>

    <div class="profile-content">
      <div class="profile-card">
        <div class="card-header">
          <h3>{{ t('personalInfo') }}</h3>
          <button class="btn-outline" @click="editProfile">
            {{ t('edit') }}
          </button>
        </div>
        
        <div class="profile-info">
          <div class="info-item">
            <label>{{ t('fullName') }}</label>
            <p>{{ user.name }}</p>
          </div>
          <div class="info-item">
            <label>{{ t('email') }}</label>
            <p>{{ user.email }}</p>
          </div>
          <div class="info-item">
            <label>{{ t('role') }}</label>
            <p class="role-badge">{{ user.role }}</p>
          </div>
          <div class="info-item">
            <label>{{ t('memberSince') }}</label>
            <p>{{ formatDate(user.createdAt) }}</p>
          </div>
        </div>
      </div>

      <div class="profile-card">
        <div class="card-header">
          <h3>{{ t('activity') }}</h3>
        </div>
        
        <div class="activity-stats">
          <div class="stat-item">
            <div class="stat-value">{{ userStats.totalPredictions }}</div>
            <div class="stat-label">{{ t('totalPredictions') }}</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">{{ userStats.accuracy }}%</div>
            <div class="stat-label">{{ t('accuracy') }}</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">{{ userStats.modelsUsed }}</div>
            <div class="stat-label">{{ t('modelsUsed') }}</div>
          </div>
        </div>
      </div>

      <div class="profile-card">
        <div class="card-header">
          <h3>{{ t('recentActivity') }}</h3>
        </div>
        
        <div class="activity-list">
          <div v-for="activity in recentActivities" :key="activity.id" class="activity-item">
            <div class="activity-icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                <polyline points="22 4 12 14.01 9 11.01"/>
              </svg>
            </div>
            <div class="activity-details">
              <div class="activity-message">{{ activity.message }}</div>
              <div class="activity-time">{{ formatTime(activity.timestamp) }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'

export default {
  name: 'UserProfile',
  setup() {
    const user = ref({
      name: '张伟',
      email: 'zhang.wei@example.com',
      role: 'Administrator',
      createdAt: new Date('2024-01-15')
    })

    const userStats = ref({
      totalPredictions: 15420,
      accuracy: 98.2,
      modelsUsed: 3
    })

    const recentActivities = ref([
      {
        id: 1,
        message: 'Predicted digit 7 with 96% confidence',
        timestamp: new Date(Date.now() - 3600000)
      },
      {
        id: 2,
        message: 'Trained new CNN model',
        timestamp: new Date(Date.now() - 86400000)
      },
      {
        id: 3,
        message: 'Updated profile settings',
        timestamp: new Date(Date.now() - 172800000)
      }
    ])

    // Translation system (same as TopNavigation)
    const currentLanguage = ref(localStorage.getItem('preferredLanguage') || 'en')
    
    const translations = {
      en: {
        userProfile: 'User Profile',
        manageYourAccount: 'Manage your account information and view your activity',
        personalInfo: 'Personal Information',
        edit: 'Edit',
        fullName: 'Full Name',
        email: 'Email Address',
        role: 'Role',
        memberSince: 'Member Since',
        activity: 'Activity Overview',
        totalPredictions: 'Total Predictions',
        accuracy: 'Accuracy',
        modelsUsed: 'Models Used',
        recentActivity: 'Recent Activity'
      },
      zh: {
        userProfile: '用户资料',
        manageYourAccount: '管理您的账户信息并查看活动记录',
        personalInfo: '个人信息',
        edit: '编辑',
        fullName: '姓名',
        email: '邮箱地址',
        role: '角色',
        memberSince: '注册时间',
        activity: '活动概览',
        totalPredictions: '总预测数',
        accuracy: '准确率',
        modelsUsed: '使用模型',
        recentActivity: '最近活动'
      }
    }

    const t = (key) => {
      return translations[currentLanguage.value][key] || key
    }

    const formatDate = (date) => {
      return new Date(date).toLocaleDateString(currentLanguage.value === 'zh' ? 'zh-CN' : 'en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    }

    const formatTime = (timestamp) => {
      const now = new Date()
      const diff = now - new Date(timestamp)
      const days = Math.floor(diff / 86400000)
      const hours = Math.floor(diff / 3600000)
      const minutes = Math.floor(diff / 60000)
      
      if (days > 0) return `${days}d ago`
      if (hours > 0) return `${hours}h ago`
      if (minutes > 0) return `${minutes}m ago`
      return 'Just now'
    }

    const editProfile = () => {
      // Navigate to edit profile page or open modal
      console.log('Edit profile clicked')
    }

    return {
      user,
      userStats,
      recentActivities,
      t,
      formatDate,
      formatTime,
      editProfile
    }
  }
}
</script>

<style scoped>
.user-profile {
  padding: 24px;
  max-width: 1200px;
  margin: 0 auto;
}

.profile-header {
  margin-bottom: 32px;
}

.profile-header h1 {
  font-size: 28px;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 8px;
}

.profile-header p {
  color: #64748b;
  font-size: 16px;
}

.profile-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
}

.profile-card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1);
  border: 1px solid #e2e8f0;
}

.profile-card:first-child {
  grid-column: 1 / -1;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.card-header h3 {
  font-size: 18px;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
}

.btn-outline {
  background: white;
  color: #475569;
  border: 1px solid #d1d5db;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s ease;
}

.btn-outline:hover {
  border-color: #059669;
  color: #059669;
}

.profile-info {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
}

.info-item label {
  display: block;
  font-size: 14px;
  color: #64748b;
  margin-bottom: 6px;
  font-weight: 500;
}

.info-item p {
  font-size: 16px;
  color: #1e293b;
  margin: 0;
}

.role-badge {
  background: #f0fdf4;
  color: #059669;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  display: inline-block;
}

.activity-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

.stat-item {
  text-align: center;
  padding: 20px;
  background: #f8fafc;
  border-radius: 8px;
}

.stat-value {
  font-size: 24px;
  font-weight: 700;
  color: #059669;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 14px;
  color: #64748b;
}

.activity-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.activity-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px;
  border-radius: 6px;
  background: #f8fafc;
}

.activity-icon {
  color: #059669;
  margin-top: 2px;
}

.activity-details {
  flex: 1;
}

.activity-message {
  font-size: 14px;
  color: #374151;
  margin-bottom: 4px;
}

.activity-time {
  font-size: 12px;
  color: #64748b;
}

@media (max-width: 768px) {
  .profile-content {
    grid-template-columns: 1fr;
  }
  
  .activity-stats {
    grid-template-columns: 1fr;
  }
  
  .profile-info {
    grid-template-columns: 1fr;
  }
}
</style>
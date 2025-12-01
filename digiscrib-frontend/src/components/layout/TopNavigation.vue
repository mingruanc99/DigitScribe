<template>
  <nav class="top-navigation">
    <div class="nav-left">
      <button 
        class="sidebar-toggle" 
        @click="$emit('toggle-sidebar')"
        :aria-label="t('toggleSidebar')"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="3" y1="12" x2="21" y2="12"/>
          <line x1="3" y1="6" x2="21" y2="6"/>
          <line x1="3" y1="18" x2="21" y2="18"/>
        </svg>
      </button>
      
      <div class="breadcrumb">
        <span class="page-title">{{ currentPageTitle }}</span>
      </div>
    </div>
    
    <div class="nav-right">
      <div class="nav-items">
        <!-- Language Switcher -->
        <button class="nav-item language-switcher" @click="toggleLanguage">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="2" y1="12" x2="22" y2="12"/>
            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
          </svg>
          <span>{{ currentLanguage === 'en' ? 'EN' : '中文' }}</span>
        </button>

        <!-- Admin Info -->
        <div class="admin-info">
          <div class="admin-badge">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
            <span>{{ t('admin') }}</span>
          </div>
          
          <!-- Logout Button -->
          <button class="logout-btn" @click="handleLogout" :title="t('signOut')">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  </nav>
</template>

<script>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'

export default {
  name: 'TopNavigation',
  emits: ['toggle-sidebar', 'language-changed'],
  setup(props, { emit }) {
    const router = useRouter()
    const route = useRoute()
    
    const currentLanguage = ref('en')
    
    // Translations dictionary - expanded for all UI elements
    const translations = {
      en: {
        // Navigation
        toggleSidebar: 'Toggle Sidebar',
        admin: 'ADMIN',
        signOut: 'Sign Out',
        
        // Page titles
        dashboard: 'Dashboard',
        digitRecognition: 'Digit Recognition',
        modelManagement: 'AI Models',
        analytics: 'Analytics',
        feedbackSystem: 'Feedback System',
        adminPanel: 'Admin Panel',
        
        // Dashboard specific
        totalPredictions: 'Total Predictions',
        overallAccuracy: 'Overall Accuracy',
        activeModels: 'Active Models',
        quickActions: 'Quick Actions',
        recentActivity: 'Recent Activity',
        viewAll: 'View All',
        newModelDeployment: 'New model deployment',
        modelTrainingCompleted: 'Model training completed',
        digitPredictionCompleted: 'Digit prediction completed',
        
        // Digit Recognition specific
        drawDigit: 'Draw a digit (0-9) and let AI predict what it is',
        connectedToBackend: '✓ Connected to AI Backend',
        demoMode: '⚠ Using Demo Mode (Flask backend not available)',
        clearCanvas: 'Clear Canvas',
        predictDigit: 'Predict Digit',
        analyzing: 'Analyzing...',
        quickTest: 'Quick Test',
        predictionResult: 'Prediction Result',
        confidence: 'Confidence',
        processedIn: 'Processed in',
        source: 'Source',
        confidenceDistribution: 'Confidence Distribution',
        feedbackQuestion: 'Was this prediction correct?',
        correct: '✓ Correct',
        incorrect: '✗ Incorrect',
        provideFeedback: 'Provide feedback after prediction',
        thanksForFeedback: 'Thank you for your feedback!',
        recentPredictions: 'Recent Predictions',
        noPredictionsYet: 'No predictions yet',
        debugPreview: 'Debug Preview (28x28 sent to AI)',
        showDebug: 'Show Debug Preview',
        hideDebug: 'Hide Debug',
        
        // Common actions
        loading: 'Loading data...',
        saving: 'Saving...',
        deleting: 'Deleting...',
        confirm: 'Confirm',
        cancel: 'Cancel',
        save: 'Save',
        delete: 'Delete',
        edit: 'Edit',
        create: 'Create',
        update: 'Update',
        search: 'Search',
        filter: 'Filter',
        sort: 'Sort',
        
        // Status messages
        success: 'Success',
        error: 'Error',
        warning: 'Warning',
        info: 'Information',
        
        // Time units
        justNow: 'Just now',
        minutesAgo: 'minutes ago',
        hoursAgo: 'hours ago',
        daysAgo: 'days ago'
      },
      zh: {
        // Navigation
        toggleSidebar: '切换侧边栏',
        admin: '管理员',
        signOut: '退出登录',
        
        // Page titles
        dashboard: '仪表板',
        digitRecognition: '数字识别',
        modelManagement: 'AI模型',
        analytics: '数据分析',
        feedbackSystem: '反馈系统',
        adminPanel: '管理员面板',
        
        // Dashboard specific
        totalPredictions: '总预测数',
        overallAccuracy: '整体准确率',
        activeModels: '活跃模型',
        quickActions: '快速操作',
        recentActivity: '最近活动',
        viewAll: '查看全部',
        newModelDeployment: '新模型部署',
        modelTrainingCompleted: '模型训练完成',
        digitPredictionCompleted: '数字预测完成',
        
        // Digit Recognition specific
        drawDigit: '绘制数字 (0-9)，让AI预测是什么',
        connectedToBackend: '✓ 已连接AI后端',
        demoMode: '⚠ 使用演示模式 (Flask后端不可用)',
        clearCanvas: '清除画布',
        predictDigit: '预测数字',
        analyzing: '分析中...',
        quickTest: '快速测试',
        predictionResult: '预测结果',
        confidence: '置信度',
        processedIn: '处理时间',
        source: '来源',
        confidenceDistribution: '置信度分布',
        feedbackQuestion: '这个预测正确吗？',
        correct: '✓ 正确',
        incorrect: '✗ 不正确',
        provideFeedback: '预测后提供反馈',
        thanksForFeedback: '感谢您的反馈！',
        recentPredictions: '最近预测',
        noPredictionsYet: '暂无预测',
        debugPreview: '调试预览 (发送给AI的28x28图像)',
        showDebug: '显示调试预览',
        hideDebug: '隐藏调试',
        
        // Common actions
        loading: '加载数据...',
        saving: '保存中...',
        deleting: '删除中...',
        confirm: '确认',
        cancel: '取消',
        save: '保存',
        delete: '删除',
        edit: '编辑',
        create: '创建',
        update: '更新',
        search: '搜索',
        filter: '筛选',
        sort: '排序',
        
        // Status messages
        success: '成功',
        error: '错误',
        warning: '警告',
        info: '信息',
        
        // Time units
        justNow: '刚刚',
        minutesAgo: '分钟前',
        hoursAgo: '小时前',
        daysAgo: '天前'
      }
    }
    
    // Translation function
    const t = (key) => {
      return translations[currentLanguage.value][key] || key
    }
    
    // Get page title based on current route
    const currentPageTitle = computed(() => {
      const routeTitles = {
        'DashboardHome': t('dashboard'),
        'DigitRecognition': t('digitRecognition'),
        'ModelManagement': t('modelManagement'),
        'Analytics': t('analytics'),
        'FeedbackSystem': t('feedbackSystem'),
        'AdminPanel': t('adminPanel')
      }
      return routeTitles[route.name] || 'DigiScribe'
    })
    
    // Language toggle function
    const toggleLanguage = () => {
      currentLanguage.value = currentLanguage.value === 'en' ? 'zh' : 'en'
      localStorage.setItem('preferredLanguage', currentLanguage.value)
      
      // Emit event to parent components
      emit('language-changed', currentLanguage.value)
      
      // Dispatch a custom event that can be listened to globally
      window.dispatchEvent(new CustomEvent('language-change', { 
        detail: { language: currentLanguage.value } 
      }))
    }
    
    // Logout function
    const handleLogout = () => {
      console.log('Admin logging out...')
      localStorage.removeItem('authToken')
      localStorage.removeItem('userRole')
      router.push('/')
    }
    
    // Load saved language preference
    onMounted(() => {
      const savedLanguage = localStorage.getItem('preferredLanguage')
      if (savedLanguage) {
        currentLanguage.value = savedLanguage
      }
    })
    
    // Watch for language changes and update document title
    watch(currentLanguage, (newLang) => {
      document.title = `${t('dashboard')} - DigiScribe`
    })
    
    // Provide translation function to child components
    const provideTranslations = () => {
      return { t, currentLanguage }
    }
    
    return {
      currentLanguage,
      currentPageTitle,
      t,
      toggleLanguage,
      handleLogout,
      provideTranslations
    }
  }
}
</script>

<style scoped>
.top-navigation {
  height: 70px;
  background: white;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  position: sticky;
  top: 0;
  z-index: 100;
}

.nav-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.sidebar-toggle {
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px;
  border-radius: 6px;
  color: #64748b;
  transition: all 0.2s ease;
}

.sidebar-toggle:hover {
  background: #f1f5f9;
  color: #334155;
}

.breadcrumb {
  display: flex;
  align-items: center;
}

.page-title {
  font-size: 18px;
  font-weight: 600;
  color: #1e293b;
}

.nav-right {
  display: flex;
  align-items: center;
}

.nav-items {
  display: flex;
  align-items: center;
  gap: 16px;
}

/* Language Switcher */
.language-switcher {
  display: flex;
  align-items: center;
  gap: 6px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px 12px;
  border-radius: 6px;
  color: #64748b;
  transition: all 0.2s ease;
  font-size: 14px;
  font-weight: 500;
}

.language-switcher:hover {
  background: #f1f5f9;
  color: #334155;
}

/* Admin Info */
.admin-info {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 6px 12px;
  background: #f8fafc;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
}

.admin-badge {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 8px;
  background: linear-gradient(135deg, #059669, #047857);
  border-radius: 4px;
  color: white;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.5px;
}

.admin-badge svg {
  stroke: white;
}

.logout-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  cursor: pointer;
  padding: 6px;
  border-radius: 4px;
  color: #64748b;
  transition: all 0.2s ease;
}

.logout-btn:hover {
  background: #fef2f2;
  color: #ef4444;
}

/* Responsive */
@media (max-width: 768px) {
  .top-navigation {
    padding: 0 16px;
  }
  
  .nav-items {
    gap: 12px;
  }
  
  .admin-info {
    gap: 8px;
    padding: 4px 8px;
  }
  
  .admin-badge span {
    font-size: 11px;
  }
}

@media (max-width: 480px) {
  .language-switcher span {
    display: none;
  }
  
  .admin-badge span {
    display: none;
  }
  
  .page-title {
    font-size: 16px;
  }
}
</style>
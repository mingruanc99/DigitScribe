<template>
  <nav class="top-navigation">
    <div class="nav-left">
      <button class="sidebar-toggle" @click="$emit('toggle-sidebar')">
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
        <!-- Translation Button -->
        <div class="language-selector">
          <button class="nav-item" @click="toggleLanguage">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="2" y1="12" x2="22" y2="12"/>
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
            </svg>
            <span class="language-text">{{ currentLanguage === 'en' ? 'EN' : '中文' }}</span>
          </button>
        </div>
        
        <!-- User Menu -->
        <div class="user-menu">
          <button class="user-trigger" @click="showUserMenu = !showUserMenu">
            <div class="user-avatar">
              {{ userInitials }}
            </div>
            <span class="user-name">{{ userName }}</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="6 9 12 15 18 9"/>
            </svg>
          </button>
          
          <div v-if="showUserMenu" class="user-dropdown" @click.stop>
            <div class="user-info">
              <div class="user-avatar large">
                {{ userInitials }}
              </div>
              <div class="user-details">
                <div class="user-name">{{ userName }}</div>
                <div class="user-email">{{ userEmail }}</div>
                <div class="user-role">{{ userRole }}</div>
              </div>
            </div>
            <div class="dropdown-divider"></div>
            
            <!-- FIXED: Use route names instead of hardcoded paths -->
            <router-link :to="{ name: 'UserProfile' }" class="dropdown-item" @click="showUserMenu = false">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
              {{ t('profile') }}
            </router-link>
            
            <router-link :to="{ name: 'UserSettings' }" class="dropdown-item" @click="showUserMenu = false">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="3"/>
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
              </svg>
              {{ t('settings') }}
            </router-link>
            
            <div class="dropdown-divider"></div>
            <a href="#" class="dropdown-item text-danger" @click="handleLogout">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                <polyline points="16 17 21 12 16 7"/>
                <line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
                {{ t('signOut') }}
            </a>
          </div>
        </div>
      </div>
    </div>
  </nav>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'

export default {
  name: 'TopNavigation',
  emits: ['toggle-sidebar'],
  setup() {
    const router = useRouter()
    const route = useRoute()
    const showUserMenu = ref(false)
    const currentLanguage = ref('en') // 'en' or 'zh'
    
    // Translation dictionary
    const translations = {
      en: {
        profile: 'Profile',
        settings: 'Settings',
        signOut: 'Sign Out',
        dashboard: 'Dashboard',
        models: 'Models',
        admin: 'Admin Panel',
        userProfile: 'User Profile',
        userSettings: 'User Settings'
      },
      zh: {
        profile: '个人资料',
        settings: '设置',
        signOut: '退出登录',
        dashboard: '仪表板',
        models: '模型管理',
        admin: '管理员面板',
        userProfile: '用户资料',
        userSettings: '用户设置'
      }
    }
    
    // Mock user data - replace with actual user data from your auth system
    const userData = ref({
      name: '张伟',
      email: 'zhang.wei@example.com',
      role: 'Administrator'
    })
    
    // Translation function
    const t = (key) => {
      return translations[currentLanguage.value][key] || key
    }
    
    // Toggle between English and Chinese
    const toggleLanguage = () => {
      currentLanguage.value = currentLanguage.value === 'en' ? 'zh' : 'en'
      // Save to localStorage
      localStorage.setItem('preferredLanguage', currentLanguage.value)
      
      // Update user data based on language
      if (currentLanguage.value === 'en') {
        userData.value.name = 'John Doe'
        userData.value.role = 'Administrator'
      } else {
        userData.value.name = '张伟'
        userData.value.role = '管理员'
      }
    }
    
    const userInitials = computed(() => {
      return userData.value.name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
    })
    
    const userName = computed(() => userData.value.name)
    const userEmail = computed(() => userData.value.email)
    const userRole = computed(() => userData.value.role)
    
    const currentPageTitle = computed(() => {
      // Dynamic page titles based on route
      const routeTitles = {
        '/': t('dashboard'),
        '/models': t('models'),
        '/admin': t('admin'),
        '/user/profile': t('userProfile'),
        '/user/settings': t('userSettings')
      }
      return routeTitles[route.path] || 'DigiScribe'
    })
    
    const handleLogout = () => {
      // Handle logout logic
      console.log('Logging out...')
      // Clear user session, tokens, etc.
      localStorage.removeItem('authToken')
      router.push('/login')
    }
    
    // Initialize language from localStorage
    onMounted(() => {
      const savedLanguage = localStorage.getItem('preferredLanguage')
      if (savedLanguage) {
        currentLanguage.value = savedLanguage
      }
    })
    
    return {
      showUserMenu,
      userInitials,
      userName,
      userEmail,
      userRole,
      currentPageTitle,
      currentLanguage,
      t,
      toggleLanguage,
      handleLogout
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
  gap: 8px;
}

.nav-item {
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
}

.nav-item:hover {
  background: #f1f5f9;
  color: #334155;
}

.language-text {
  font-weight: 500;
}

.user-menu {
  position: relative;
  margin-left: 8px;
}

.user-trigger {
  display: flex;
  align-items: center;
  gap: 8px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 6px;
  transition: all 0.2s ease;
}

.user-trigger:hover {
  background: #f1f5f9;
}

.user-avatar {
  width: 32px;
  height: 32px;
  background: linear-gradient(135deg, #059669, #047857);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  font-size: 12px;
}

.user-avatar.large {
  width: 48px;
  height: 48px;
  font-size: 16px;
}

.user-name {
  font-weight: 500;
  color: #334155;
  font-size: 14px;
}

.user-dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 8px;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1);
  min-width: 280px;
  z-index: 1000;
}

.user-info {
  padding: 16px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-details {
  flex: 1;
}

.user-details .user-name {
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 2px;
  font-size: 14px;
}

.user-email {
  font-size: 12px;
  color: #64748b;
  margin-bottom: 2px;
}

.user-role {
  font-size: 11px;
  color: #059669;
  background: #f0fdf4;
  padding: 2px 6px;
  border-radius: 4px;
  display: inline-block;
}

.dropdown-divider {
  height: 1px;
  background: #e2e8f0;
  margin: 8px 0;
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  color: #64748b;
  text-decoration: none;
  transition: all 0.2s ease;
  font-size: 14px;
  cursor: pointer;
}

.dropdown-item:hover {
  background: #f8fafc;
  color: #1e293b;
}

.dropdown-item.text-danger {
  color: #ef4444;
}

.dropdown-item.text-danger:hover {
  background: #fef2f2;
  color: #dc2626;
}

/* Close dropdown when clicking outside */
.user-dropdown::before {
  content: '';
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: -1;
}
</style>
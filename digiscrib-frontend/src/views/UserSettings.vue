<template>
  <div class="user-settings">
    <div class="settings-header">
      <h1>{{ t('userSettings') }}</h1>
      <p>{{ t('manageYourPreferences') }}</p>
    </div>

    <div class="settings-content">
      <div class="settings-card">
        <div class="card-header">
          <h3>{{ t('languagePreferences') }}</h3>
        </div>
        
        <div class="settings-group">
          <div class="setting-item">
            <label>{{ t('interfaceLanguage') }}</label>
            <select v-model="currentLanguage" @change="updateLanguage" class="form-input">
              <option value="en">English</option>
              <option value="zh">中文 (Chinese)</option>
            </select>
          </div>
        </div>
      </div>

      <div class="settings-card">
        <div class="card-header">
          <h3>{{ t('notificationSettings') }}</h3>
        </div>
        
        <div class="settings-group">
          <div class="setting-item">
            <label class="checkbox-container">
              <input type="checkbox" v-model="settings.emailNotifications">
              <span class="checkmark"></span>
              {{ t('emailNotifications') }}
            </label>
          </div>
          <div class="setting-item">
            <label class="checkbox-container">
              <input type="checkbox" v-model="settings.modelTrainingAlerts">
              <span class="checkmark"></span>
              {{ t('modelTrainingAlerts') }}
            </label>
          </div>
          <div class="setting-item">
            <label class="checkbox-container">
              <input type="checkbox" v-model="settings.systemUpdates">
              <span class="checkmark"></span>
              {{ t('systemUpdates') }}
            </label>
          </div>
        </div>
      </div>

      <div class="settings-card">
        <div class="card-header">
          <h3>{{ t('privacySecurity') }}</h3>
        </div>
        
        <div class="settings-group">
          <div class="setting-item">
            <label>{{ t('dataRetention') }}</label>
            <select v-model="settings.dataRetention" class="form-input">
              <option value="30">{{ t('days30') }}</option>
              <option value="90">{{ t('days90') }}</option>
              <option value="365">{{ t('days365') }}</option>
              <option value="forever">{{ t('forever') }}</option>
            </select>
          </div>
          <div class="setting-item">
            <button class="btn-outline" @click="changePassword">
              {{ t('changePassword') }}
            </button>
          </div>
        </div>
      </div>

      <div class="settings-actions">
        <button class="btn-outline" @click="resetSettings">
          {{ t('resetToDefaults') }}
        </button>
        <button class="btn-primary" @click="saveSettings">
          {{ t('saveChanges') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'

export default {
  name: 'UserSettings',
  setup() {
    const currentLanguage = ref('en')
    const settings = ref({
      emailNotifications: true,
      modelTrainingAlerts: true,
      systemUpdates: false,
      dataRetention: '90'
    })

    // Translation system
    const translations = {
      en: {
        userSettings: 'User Settings',
        manageYourPreferences: 'Manage your application preferences and settings',
        languagePreferences: 'Language Preferences',
        interfaceLanguage: 'Interface Language',
        notificationSettings: 'Notification Settings',
        emailNotifications: 'Email Notifications',
        modelTrainingAlerts: 'Model Training Alerts',
        systemUpdates: 'System Updates',
        privacySecurity: 'Privacy & Security',
        dataRetention: 'Data Retention Period',
        days30: '30 days',
        days90: '90 days',
        days365: '365 days',
        forever: 'Forever',
        changePassword: 'Change Password',
        resetToDefaults: 'Reset to Defaults',
        saveChanges: 'Save Changes'
      },
      zh: {
        userSettings: '用户设置',
        manageYourPreferences: '管理您的应用程序偏好和设置',
        languagePreferences: '语言偏好',
        interfaceLanguage: '界面语言',
        notificationSettings: '通知设置',
        emailNotifications: '邮件通知',
        modelTrainingAlerts: '模型训练提醒',
        systemUpdates: '系统更新',
        privacySecurity: '隐私与安全',
        dataRetention: '数据保留期限',
        days30: '30天',
        days90: '90天',
        days365: '365天',
        forever: '永久',
        changePassword: '修改密码',
        resetToDefaults: '恢复默认设置',
        saveChanges: '保存更改'
      }
    }

    const t = (key) => {
      return translations[currentLanguage.value][key] || key
    }

    const updateLanguage = () => {
      localStorage.setItem('preferredLanguage', currentLanguage.value)
      // You might want to reload the page or use a global state manager
      // to update the language across the entire app
      window.location.reload()
    }

    const changePassword = () => {
      // Implement password change logic
      alert('Password change functionality would be implemented here')
    }

    const resetSettings = () => {
      settings.value = {
        emailNotifications: true,
        modelTrainingAlerts: true,
        systemUpdates: false,
        dataRetention: '90'
      }
    }

    const saveSettings = () => {
      // Save settings to backend or localStorage
      localStorage.setItem('userSettings', JSON.stringify(settings.value))
      alert('Settings saved successfully!')
    }

    // Load saved settings
    onMounted(() => {
      const savedLanguage = localStorage.getItem('preferredLanguage')
      if (savedLanguage) {
        currentLanguage.value = savedLanguage
      }

      const savedSettings = localStorage.getItem('userSettings')
      if (savedSettings) {
        settings.value = { ...settings.value, ...JSON.parse(savedSettings) }
      }
    })

    return {
      currentLanguage,
      settings,
      t,
      updateLanguage,
      changePassword,
      resetSettings,
      saveSettings
    }
  }
}
</script>

<style scoped>
.user-settings {
  padding: 24px;
  max-width: 800px;
  margin: 0 auto;
}

.settings-header {
  margin-bottom: 32px;
}

.settings-header h1 {
  font-size: 28px;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 8px;
}

.settings-header p {
  color: #64748b;
  font-size: 16px;
}

.settings-content {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.settings-card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1);
  border: 1px solid #e2e8f0;
}

.card-header {
  margin-bottom: 20px;
}

.card-header h3 {
  font-size: 18px;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
}

.settings-group {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.setting-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.setting-item label {
  font-size: 14px;
  font-weight: 500;
  color: #374151;
}

.form-input {
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  max-width: 300px;
}

.form-input:focus {
  outline: none;
  border-color: #059669;
  box-shadow: 0 0 0 3px rgba(5, 150, 105, 0.1);
}

.checkbox-container {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-size: 14px;
}

.checkbox-container input {
  display: none;
}

.checkmark {
  width: 16px;
  height: 16px;
  border: 2px solid #d1d5db;
  border-radius: 3px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.checkbox-container input:checked + .checkmark {
  background: #059669;
  border-color: #059669;
}

.checkbox-container input:checked + .checkmark::after {
  content: '';
  width: 4px;
  height: 8px;
  border: solid white;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
  margin-top: -1px;
}

.btn-outline, .btn-primary {
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
}

.btn-outline {
  background: white;
  color: #475569;
  border: 1px solid #d1d5db;
}

.btn-outline:hover {
  border-color: #059669;
  color: #059669;
}

.btn-primary {
  background: #059669;
  color: white;
}

.btn-primary:hover {
  background: #047857;
}

.settings-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  padding-top: 24px;
  border-top: 1px solid #e2e8f0;
}

@media (max-width: 768px) {
  .user-settings {
    padding: 16px;
  }
  
  .settings-actions {
    flex-direction: column;
  }
}
</style>
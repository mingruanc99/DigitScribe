<template>
  <div class="auth-container">
    <div class="auth-card">
      <!-- Language Switcher -->
      <div class="language-switcher">
        <button 
          @click="switchLanguage('en')" 
          :class="['lang-btn', { active: currentLang === 'en' }]"
        >
          EN
        </button>
        <button 
          @click="switchLanguage('zh')" 
          :class="['lang-btn', { active: currentLang === 'zh' }]"
        >
          中文
        </button>
      </div>

      <!-- Left Side - Branding -->
      <div class="brand-section">
        <div class="logo">
          <div class="logo-icon">
            <img src="/main.png" alt="DigiScribe" class="main-logo-image">
          </div>
          <div class="brand-text">
            <h1 class="app-name">{{ t('appName') }}</h1>
            <p class="app-tagline">{{ t('appTagline') }}</p>
          </div>
        </div>

        <div class="brand-content">
          <h2 class="brand-title">{{ t('welcome') }}</h2>
          <p class="brand-subtitle" v-html="t('secureAccess')"></p>
        </div>

        <div class="feature-list">
          <div class="feature-item">
            <div class="feature-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                <polyline points="22 4 12 14.01 9 11.01"/>
              </svg>
            </div>
            <span>{{ t('feature1') }}</span>
          </div>
          <div class="feature-item">
            <div class="feature-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="20" x2="18" y2="10"/>
                <line x1="12" y1="20" x2="12" y2="4"/>
                <line x1="6" y1="20" x2="6" y2="14"/>
              </svg>
            </div>
            <span>{{ t('feature2') }}</span>
          </div>
          <div class="feature-item">
            <div class="feature-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <circle cx="12" cy="5" r="2"/>
                <path d="M12 7v4"/>
              </svg>
            </div>
            <span>{{ t('feature3') }}</span>
          </div>
        </div>
      </div>

      <!-- Right Side - Login Form -->
      <div class="form-section">
        <div class="form-container">
          <div class="form-header">
            <h3>{{ t('adminSignIn') }}</h3>
            <p>{{ t('enterCredentials') }}</p>
          </div>

          <form @submit.prevent="handleLogin" class="auth-form">
            <div class="form-group">
              <label for="username">{{ t('adminUsername') }}</label>
              <div class="input-container">
                <div class="input-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                    <circle cx="12" cy="7" r="4"/>
                  </svg>
                </div>
                <input
                  id="username"
                  v-model="form.username"
                  type="text"
                  :placeholder="t('enterUsername')"
                  required
                  class="form-input"
                >
              </div>
            </div>

            <div class="form-group">
              <div class="label-container">
                <label for="password">{{ t('password') }}</label>
                <a href="#" class="forgot-link">{{ t('forgotPassword') }}</a>
              </div>
              <div class="input-container">
                <div class="input-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                </div>
                <input
                  id="password"
                  v-model="form.password"
                  :type="showPassword ? 'text' : 'password'"
                  :placeholder="t('enterPassword')"
                  required
                  class="form-input"
                >
                <button
                  type="button"
                  class="password-toggle"
                  @click="showPassword = !showPassword"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path v-if="!showPassword" d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                    <circle v-if="!showPassword" cx="12" cy="12" r="3"/>
                    <path v-if="showPassword" d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                    <line v-if="showPassword" x1="1" y1="1" x2="23" y2="23"/>
                  </svg>
                </button>
              </div>
            </div>

            <div v-if="errorMessage" class="error-message">
              {{ errorMessage }}
            </div>

            <div class="form-options">
              <label class="checkbox-container">
                <input type="checkbox" v-model="form.rememberMe">
                <span class="checkmark"></span>
                {{ t('rememberMe') }}
              </label>
            </div>

            <button type="submit" class="submit-btn" :disabled="loading">
              <span v-if="loading" class="loading-spinner"></span>
              {{ loading ? t('signingIn') : t('signIn') }}
            </button>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { i18n } from '@/utils/i18n'

export default {
  name: 'AdminLogin',
  setup() {
    const router = useRouter()
    const loading = ref(false)
    const showPassword = ref(false)
    const errorMessage = ref('')
    const languageVersion = ref(0) // Force re-render when language changes
    
    const form = ref({
      username: '',
      password: '',
      rememberMe: false
    })

    // Language functionality
    const currentLang = computed(() => i18n.getLanguage())
    
    const t = (key) => {
      // Use languageVersion to make the translation reactive
      languageVersion.value;
      return i18n.t(key)
    }

    const switchLanguage = (lang) => {
      i18n.setLanguage(lang)
    }

    // Listen for language changes
    const handleLanguageChange = () => {
      languageVersion.value++ // Force re-computation of all translations
    }

    // Set up listener when component mounts
    onMounted(() => {
      i18n.addListener(handleLanguageChange)
    })

    // Clean up listener when component unmounts
    onUnmounted(() => {
      i18n.removeListener(handleLanguageChange)
    })

    const handleLogin = async () => {
      // Validation with translated messages
      if (!form.value.username || form.value.username.trim() === '') {
        errorMessage.value = t('enterUsernameError')
        return
      }

      if (!form.value.password) {
        errorMessage.value = t('enterPasswordError')
        return
      }

      loading.value = true
      errorMessage.value = ''

      try {
        const loginData = {
          username: form.value.username,
          password: form.value.password
        };
        
        console.log('Sending admin login data:', loginData);
        
        const response = await fetch('http://localhost:8081/api/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(loginData)
        });
        
        console.log('Response status:', response.status);
        
        const data = await response.json();
        console.log('Login response data:', data);
        
        if (response.ok) {
          localStorage.setItem('authToken', data.token);
          localStorage.setItem('isAdmin', 'true');
          localStorage.setItem('preferredLanguage', currentLang.value);
          router.push('/admin/dashboard');
        } else {
          errorMessage.value = data.message || t('loginFailed');
        }
      } catch (error) {
        errorMessage.value = `${t('loginError')}: ${error.message}`;
        console.error('Admin login error details:', error);
      } finally {
        loading.value = false
      }
    }

    return {
      form,
      loading,
      showPassword,
      errorMessage,
      currentLang,
      t,
      switchLanguage,
      handleLogin
    }
  }
}
</script>

<style scoped>
/* Your existing CSS styles remain the same */
.auth-container {
  width: 100%;
  max-width: 1000px;
  min-height: 600px;
  position: relative;
}

.auth-card {
  background: var(--surface);
  border-radius: 16px;
  box-shadow: var(--shadow-lg);
  display: grid;
  grid-template-columns: 1fr 1fr;
  min-height: 600px;
  overflow: hidden;
  position: relative;
}

/* Language Switcher */
.language-switcher {
  position: absolute;
  top: 20px;
  right: 20px;
  display: flex;
  gap: 8px;
  z-index: 100;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border-radius: 8px;
  padding: 4px;
  box-shadow: var(--shadow);
}

.lang-btn {
  padding: 6px 8px;
  border: none;
  border-radius: 6px;
  background: transparent;
  color: #059669;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.lang-btn:hover {
  background: #059669;
  color:  #fafafa;
}

.lang-btn.active {
  background:  #059669;
  color: #ffffff;
}

/* Brand Section */
.brand-section {
  background:#059669;
  color: rgb(255, 255, 255);
  padding: 48px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.logo {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 40px;
}

.logo-icon {
  width: 48px;
  height: 48px;
  background: rgba(111, 57, 57, 0.1);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(10px);
}

.logo-icon svg {
  color: white;
}

.main-logo-image {
  width: 180px;
  height: 180px;
  max-width: 200px;
  margin-bottom: 20px;
  left: 80%;
}

.brand-text {
  line-height: 1.3;
}

.app-name {
  font-size: 24px;
  font-weight: 700;
  margin-bottom: 2px;
}

.app-tagline {
  font-size: 14px;
  opacity: 0.9;
  font-weight: 500;
}

.brand-content {
  margin-bottom: 40px;
}

.brand-title {
  font-size: 28px;
  font-weight: 700;
  margin-bottom: 8px;
}

.brand-subtitle {
  opacity: 0.9;
  font-size: 16px;
  line-height: 1.5;
  text-align: center;
}

.feature-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 14px;
  opacity: 0.9;
}

.feature-icon {
  width: 32px;
  height: 32px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(10px);
}

.feature-icon svg {
  color: white;
}

/* Form Section */
.form-section {
  padding: 48px;
  display: flex;
  align-items: center;
}

.form-container {
  width: 100%;
  max-width: 320px;
  margin: 0 auto;
}

.form-header {
  text-align: center;
  margin-bottom: 32px;
}

.form-header h3 {
  font-size: 24px;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 8px;
}

.form-header p {
  color: var(--text-secondary);
  font-size: 14px;
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

label {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-primary);
}

.label-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.forgot-link {
  font-size: 12px;
  color: #059669;
  text-decoration: none;
  font-weight: 500;
}

.forgot-link:hover {
  text-decoration: underline;
}

.input-container {
  position: relative;
  display: flex;
  align-items: center;
}

.input-icon {
  position: absolute;
  left: 12px;
  z-index: 1;
  color: var(--text-secondary);
}

.input-icon svg {
  color: var(--text-secondary);
}

.form-input {
  width: 100%;
  padding: 12px 12px 12px 40px;
  border: 1px solid var(--border);
  border-radius: 8px;
  font-size: 14px;
  transition: all 0.2s ease;
  background: var(--surface);
  color: var(--text-primary);
}

.form-input:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 3px var(--primary-light);
}

.form-input::placeholder {
  color: var(--text-secondary);
}

.password-toggle {
  position: absolute;
  right: 12px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  color: var(--text-secondary);
}

.password-toggle:hover {
  color: var(--text-primary);
}

.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.checkbox-container {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: var(--text-secondary);
  cursor: pointer;
}

.checkbox-container input {
  display: none;
}

.checkmark {
  width: 16px;
  height: 16px;
  border: 2px solid var(--border);
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.checkbox-container input:checked + .checkmark {
  background: var(--primary);
  border-color: var(--primary);
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

.submit-btn {
  width: 100%;
  padding: 14px;
  background: #059669;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.submit-btn:hover:not(:disabled) {
  background: var(--primary-dark);
  transform: translateY(-1px);
  box-shadow: var(--shadow);
}

.submit-btn:disabled {
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
}

.error-message {
  background: #fef2f2;
  border: 1px solid #fecaca;
  color: #dc2626;
  padding: 12px;
  border-radius: 8px;
  font-size: 14px;
  text-align: center;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Responsive */
@media (max-width: 768px) {
  .auth-card {
    grid-template-columns: 1fr;
    margin: 20px;
  }
  
  .brand-section {
    display: none;
  }
  
  .form-section {
    padding: 32px 24px;
  }
  
  .language-switcher {
    top: 10px;
    right: 10px;
  }
}
</style>
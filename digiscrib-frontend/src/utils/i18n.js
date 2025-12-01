// Language configuration
export const translations = {
  en: {
    // Branding
    appName: "DigiScribe",
    appTagline: "AI Digit Recognition",
    welcome: "Welcome to DigiScribe",
    secureAccess: "Secure <b>Admin</b> Access Only",
    
    // Features
    feature1: "Dataset - Powered Recognition Tool",
    feature2: "Manage System Modules",
    feature3: "Created by Santos de Pina, BIT-2025",
    
    // Form
    adminSignIn: "Admin Sign In",
    enterCredentials: "Enter your admin credentials to access the system",
    adminUsername: "Admin Username",
    enterUsername: "Enter admin username",
    password: "Password",
    enterPassword: "Enter admin password",
    forgotPassword: "Forgot password?",
    rememberMe: "Remember me",
    signIn: "Sign In as Admin",
    signingIn: "Signing In...",
    
    // Validation
    enterUsernameError: "Please enter admin username",
    enterPasswordError: "Please enter password",
    loginFailed: "Admin login failed",
    loginError: "Login error"
  },
  zh: {
    // Branding
    appName: "数字书写",
    appTagline: "AI 数字识别",
    welcome: "欢迎使用数字书写",
    secureAccess: "仅限<b>管理员</b>安全访问",
    
    // Features
    feature1: "数据集驱动的识别工具",
    feature2: "管理系统模块",
    feature3: "由 Santos de Pina 创建, BIT-2025",
    
    // Form
    adminSignIn: "管理员登录",
    enterCredentials: "输入管理员凭据访问系统",
    adminUsername: "管理员用户名",
    enterUsername: "输入管理员用户名",
    password: "密码",
    enterPassword: "输入管理员密码",
    forgotPassword: "忘记密码?",
    rememberMe: "记住我",
    signIn: "管理员登录",
    signingIn: "登录中...",
    
    // Validation
    enterUsernameError: "请输入管理员用户名",
    enterPasswordError: "请输入密码",
    loginFailed: "管理员登录失败",
    loginError: "登录错误"
  }
};

// Reactive language manager
class I18n {
  constructor() {
    this.currentLang = localStorage.getItem('preferredLanguage') || 'en';
    this.listeners = new Set();
  }
  
  setLanguage(lang) {
    if (translations[lang]) {
      this.currentLang = lang;
      localStorage.setItem('preferredLanguage', lang);
      this.notifyListeners();
    }
  }
  
  getLanguage() {
    return this.currentLang;
  }
  
  t(key) {
    return translations[this.currentLang]?.[key] || translations.en[key] || key;
  }
  
  // Add listener for language changes
  addListener(listener) {
    this.listeners.add(listener);
  }
  
  // Remove listener
  removeListener(listener) {
    this.listeners.delete(listener);
  }
  
  // Notify all listeners about language change
  notifyListeners() {
    this.listeners.forEach(listener => listener(this.currentLang));
  }
}

// Create singleton instance
export const i18n = new I18n();
// Internationalization Translations
// English and Chinese language support

export const translations = {
  en: {
    // Home/Index Page
    appTitle: 'Written.ai',
    appSubtitle: 'AI-Powered Handwriting Recognition',
    writeHere: 'Write Here',
    useFinger: 'Use your finger or stylus to write naturally',
    clear: 'Clear',
    recognize: 'Recognize',
    processing: 'Processing...',
    error: 'Error',
    canvasNotReady: 'Canvas not ready',
    writeSomething: 'Please write something first',
    recognitionFailed: 'Recognition failed. Please check your server connection and try again.',
    recognitionError: 'Recognition Error',

    // How to use
    howToUse: 'How to use:',
    step1: '1. Write text in the box above',
    step2: '2. Tap "Recognize" to process',
    step3: '3. View results on the next screen',

    // Result Page
    recognitionResult: 'Recognition Result',
    processed: 'Your handwritten text has been processed',
    recognizedText: 'Recognized Text',
    confidence: 'Confidence',
    processingTime: 'Processing Time',
    resultId: 'Result ID',
    characterCount: 'Character Count',
    saveToCollection: 'Save to Collection',
    copyText: 'Copy Text',
    share: 'Share',
    tryAnother: 'Try Another',
    loading: 'Loading result...',
    success: 'Success',
    resultSaved: 'Result saved to collection!',
    saveFailed: 'Failed to save result',
    copied: 'Copied',
    textCopied: 'Text copied to clipboard',

    // Settings Page
    settings: 'Settings',
    preferences: 'Preferences',
    darkMode: 'Dark Mode',
    darkModeDesc: 'Use dark theme throughout the app',
    appLanguage: 'Application Language',
    englishUS: 'English (US)',
    chinese: '中文 (Chinese)',
    outputFormat: 'Output Format',
    plainText: 'Plain Text',
    privacySecurity: 'Privacy & Security',
    analytics: 'Analytics',
    analyticsDesc: 'Help improve the app',
    about: 'About',
    aboutTeam: 'About Team',
    aboutTeamDesc: 'Meet the developers',
    appVersion: 'App Version',
    version: 'Version 1.0.0',

    // Collections
    collections: 'Collections',
    myCollections: 'My Collections',
    createCollection: 'Create Collection',

    // User
    userProfile: 'User Profile',
    accountSettings: 'Account Settings',
    signIn: 'Sign In',
    signOut: 'Sign Out',

    // Bottom Tabs
    home: 'Home',
    collection: 'Collection',
    user: 'User',
    more: 'More',
  },
  zh: {
    // Home/Index Page
    appTitle: 'Written.ai',
    appSubtitle: 'AI智能手写识别',
    writeHere: '在这里书写',
    useFinger: '使用手指或手写笔自然书写',
    clear: '清除',
    recognize: '识别',
    processing: '处理中...',
    error: '错误',
    canvasNotReady: '画布未准备好',
    writeSomething: '请先书写一些内容',
    recognitionFailed: '识别失败。请检查服务器连接并重试。',
    recognitionError: '识别错误',

    // How to use
    howToUse: '使用说明：',
    step1: '1. 在上方的框中书写文字',
    step2: '2. 点击"识别"进行处理',
    step3: '3. 在下一个屏幕查看结果',

    // Result Page
    recognitionResult: '识别结果',
    processed: '您的手写文本已处理完成',
    recognizedText: '识别的文本',
    confidence: '置信度',
    processingTime: '处理时间',
    resultId: '结果ID',
    characterCount: '字符数',
    saveToCollection: '保存到收藏',
    copyText: '复制文本',
    share: '分享',
    tryAnother: '试试另一个',
    loading: '加载结果中...',
    success: '成功',
    resultSaved: '结果已保存到收藏!',
    saveFailed: '保存结果失败',
    copied: '已复制',
    textCopied: '文本已复制到剪贴板',

    // Settings Page
    settings: '设置',
    preferences: '偏好设置',
    darkMode: '深色模式',
    darkModeDesc: '在整个应用中使用深色主题',
    appLanguage: '应用语言',
    englishUS: 'English (US)',
    chinese: '中文 (Chinese)',
    outputFormat: '输出格式',
    plainText: '纯文本',
    privacySecurity: '隐私与安全',
    analytics: '分析',
    analyticsDesc: '帮助改进应用',
    about: '关于',
    aboutTeam: '关于团队',
    aboutTeamDesc: '认识开发者',
    appVersion: '应用版本',
    version: '版本 1.0.0',

    // Collections
    collections: '收藏',
    myCollections: '我的收藏',
    createCollection: '创建收藏',

    // User
    userProfile: '用户资料',
    accountSettings: '账户设置',
    signIn: '登录',
    signOut: '退出',

    // Bottom Tabs
    home: '首页',
    collection: '收藏',
    user: '用户',
    more: '更多',
  }
};

export const getCurrentLanguage = () => {
  return 'en'; // Default to English
};

export default translations;

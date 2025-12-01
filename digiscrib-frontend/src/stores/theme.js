import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

export const useThemeStore = defineStore('theme', () => {
  const isDarkMode = ref(localStorage.getItem('darkMode') === 'true' || false)
  
  // Watch for changes and update localStorage and DOM
  watch(isDarkMode, (newValue) => {
    localStorage.setItem('darkMode', newValue)
    
    if (newValue) {
      document.documentElement.classList.add('dark-theme')
    } else {
      document.documentElement.classList.remove('dark-theme')
    }
  }, { immediate: true })
  
  const toggleDarkMode = () => {
    isDarkMode.value = !isDarkMode.value
  }
  
  return {
    isDarkMode,
    toggleDarkMode
  }
})
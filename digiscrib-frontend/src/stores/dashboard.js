import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useDashboardStore = defineStore('dashboard', () => {
  // State - load from localStorage if available
  const totalPredictions = ref(Number(localStorage.getItem('totalPredictions')) || 15420)
  const activeModelName = ref(localStorage.getItem('activeModelName') || 'MNIST-CNN-v2')
  const recentActivities = ref(JSON.parse(localStorage.getItem('recentActivities')) || [])
  
  // Getters/computed properties
  const dashboardStats = computed(() => ({
    totalPredictions: totalPredictions.value,
    accuracy: 98.3,
    activeModels: activeModelName.value ? 1 : 0,
    activeModelName: activeModelName.value,
    predictionChange: ((totalPredictions.value - 15420) / 15420 * 100).toFixed(1),
    accuracyChange: 2.3
  }))
  
  // Actions
  const incrementPredictions = () => {
    totalPredictions.value += 1
    localStorage.setItem('totalPredictions', totalPredictions.value)
    
    // Add prediction activity
    addActivity({
      type: 'prediction',
      message: 'Digit prediction completed',
      timestamp: new Date().toISOString()
    })
  }
  
  const setActiveModel = (modelName) => {
    activeModelName.value = modelName
    localStorage.setItem('activeModelName', modelName)
    
    // Add deployment activity
    addActivity({
      type: 'deployment',
      message: `New model deployment: ${modelName}`,
      timestamp: new Date().toISOString()
    })
  }
  
  const addActivity = (activity) => {
    recentActivities.value.unshift({
      id: Date.now(),
      ...activity
    })
    
    // Keep only last 10 activities
    if (recentActivities.value.length > 10) {
      recentActivities.value = recentActivities.value.slice(0, 10)
    }
    
    localStorage.setItem('recentActivities', JSON.stringify(recentActivities.value))
  }
  
  const addPredictionActivity = (predictionResult, confidence) => {
    addActivity({
      type: 'prediction',
      message: `Digit ${predictionResult} predicted with ${(confidence * 100).toFixed(1)}% confidence`,
      timestamp: new Date().toISOString()
    })
  }
  
  const loadMockData = () => {
    // Only load mock data if no activities exist
    if (recentActivities.value.length === 0) {
      recentActivities.value = [
        {
          id: 1,
          type: 'deployment',
          message: 'New model deployment: MNIST-CNN-v2',
          timestamp: new Date(Date.now() - 3600000).toISOString()
        },
        {
          id: 2,
          type: 'training',
          message: 'Model training completed: 98.3% accuracy',
          timestamp: new Date(Date.now() - 7200000).toISOString()
        },
        {
          id: 3,
          type: 'prediction',
          message: 'Digit prediction completed: Number 7 (96% confidence)',
          timestamp: new Date(Date.now() - 10800000).toISOString()
        }
      ]
      localStorage.setItem('recentActivities', JSON.stringify(recentActivities.value))
    }
  }
  
  // Initialize with mock data if empty
  loadMockData()
  
  return {
    // State
    totalPredictions,
    activeModelName,
    recentActivities,
    
    // Getters
    dashboardStats,
    
    // Actions
    incrementPredictions,
    setActiveModel,
    addActivity,
    addPredictionActivity,
    loadMockData
  }
})
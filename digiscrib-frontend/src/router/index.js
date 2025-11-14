import { createRouter, createWebHistory } from 'vue-router'
import Login from '../views/Login.vue'
import Register from '../views/Register.vue'
import Dashboard from '../views/Dashboard.vue'
import DigitRecognition from '../views/DigitRecognition.vue'
import ModelManagement from '../views/ModelManagement.vue'
import Analytics from '../views/Analytics.vue'
import FeedbackSystem from '../views/FeedbackSystem.vue'
import AdminPanel from '../views/AdminPanel.vue'
import DashboardHome from '../views/DashboardHome.vue'
import UserProfile from '../views/UserProfile.vue'
import UserSettings from '../views/UserSettings.vue'

const routes = [
  {
    path: '/',
    name: 'Login',
    component: Login
  },
  {
    path: '/register',
    name: 'Register',
    component: Register
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: Dashboard,
    children: [
      {
        path: '',
        name: 'DashboardHome',
        component: DashboardHome
      },
      {
        path: 'recognition',
        name: 'DigitRecognition',
        component: DigitRecognition
      },
      {
        path: 'models',
        name: 'ModelManagement',
        component: ModelManagement
      },
      {
        path: 'analytics',
        name: 'Analytics',
        component: Analytics
      },
      {
        path: 'feedback',
        name: 'FeedbackSystem',
        component: FeedbackSystem
      },
      {
        path: 'admin',
        name: 'AdminPanel',
        component: AdminPanel
      },
      // User routes should be under dashboard
      {
        path: 'profile',
        name: 'UserProfile',
        component: UserProfile
      },
      {
        path: 'settings',
        name: 'UserSettings',
        component: UserSettings
      }
    ]
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/dashboard'
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
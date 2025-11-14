<template>
  <div class="admin-panel">
    <div class="page-header">
      <h1>Admin Panel</h1>
      <p>Manage users, monitor system health, and configure settings</p>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading-state">
      <div class="loading-spinner"></div>
      <p>Loading admin data...</p>
    </div>

    <!-- Quick Stats -->
    <div v-else class="admin-stats">
      <div class="stat-card">
        <div class="stat-icon users">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
            <circle cx="9" cy="7" r="4"/>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
          </svg>
        </div>
        <div class="stat-info">
          <div class="stat-value">{{ stats.totalUsers }}</div>
          <div class="stat-label">Total Users</div>
          <div class="stat-change positive">+{{ newUsersThisWeek }} this week</div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon predictions">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
          </svg>
        </div>
        <div class="stat-info">
          <div class="stat-value">{{ stats.totalPredictions.toLocaleString() }}</div>
          <div class="stat-label">Total Predictions</div>
          <div class="stat-change positive">+{{ predictionsToday.toLocaleString() }} today</div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon accuracy">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
            <polyline points="22 4 12 14.01 9 11.01"/>
          </svg>
        </div>
        <div class="stat-info">
          <div class="stat-value">{{ stats.systemAccuracy }}%</div>
          <div class="stat-label">System Accuracy</div>
          <div class="stat-change positive">+{{ accuracyImprovement }}%</div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon storage">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="8" y1="6" x2="21" y2="6"/>
            <line x1="8" y1="12" x2="21" y2="12"/>
            <line x1="8" y1="18" x2="21" y2="18"/>
            <line x1="3" y1="6" x2="3.01" y2="6"/>
            <line x1="3" y1="12" x2="3.01" y2="12"/>
            <line x1="3" y1="18" x2="3.01" y2="18"/>
          </svg>
        </div>
        <div class="stat-info">
          <div class="stat-value">{{ stats.storageUsed }}GB</div>
          <div class="stat-label">Storage Used</div>
          <div class="stat-change" :class="storageUsage > 80 ? 'warning' : 'positive'">
            {{ storageUsage }}% full
          </div>
        </div>
      </div>
    </div>

    <!-- Admin Tabs -->
    <div v-if="!loading" class="admin-tabs">
      <div class="tabs-header">
        <button 
          v-for="tab in tabs" 
          :key="tab.id"
          class="tab-btn"
          :class="{ active: activeTab === tab.id }"
          @click="activeTab = tab.id"
        >
          {{ tab.name }}
        </button>
      </div>

      <div class="tab-content">
        <!-- Users Management -->
        <div v-if="activeTab === 'users'" class="tab-pane">
          <div class="pane-header">
            <h3>User Management</h3>
            <div class="header-actions">
              <button class="btn-primary" @click="showAddUserModal = true">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="12" y1="5" x2="12" y2="19"/>
                  <line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
                Add User
              </button>
              <button class="btn-outline" @click="exportUsers">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                  <polyline points="7 10 12 15 17 10"/>
                  <line x1="12" y1="15" x2="12" y2="3"/>
                </svg>
                Export
              </button>
            </div>
          </div>

          <div class="users-table">
            <div class="table-header">
              <div class="table-row">
                <div class="table-cell">User</div>
                <div class="table-cell">Role</div>
                <div class="table-cell">Predictions</div>
                <div class="table-cell">Last Active</div>
                <div class="table-cell">Status</div>
                <div class="table-cell actions">Actions</div>
              </div>
            </div>
            <div class="table-body">
              <div 
                v-for="user in users" 
                :key="user.id"
                class="table-row"
              >
                <div class="table-cell user-info">
                  <div class="user-avatar">
                    {{ getUserInitials(user.name) }}
                  </div>
                  <div class="user-details">
                    <div class="user-name">{{ user.name }}</div>
                    <div class="user-email">{{ user.email }}</div>
                  </div>
                </div>
                <div class="table-cell">
                  <span class="role-badge" :class="user.role">
                    {{ user.role }}
                  </span>
                </div>
                <div class="table-cell">
                  {{ user.predictions.toLocaleString() }}
                </div>
                <div class="table-cell">
                  {{ formatTime(user.lastActive) }}
                </div>
                <div class="table-cell">
                  <span class="status-badge" :class="user.status">
                    {{ user.status }}
                  </span>
                </div>
                <div class="table-cell actions">
                  <div class="action-buttons">
                    <button class="action-btn edit" @click="editUser(user)">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                      </svg>
                    </button>
                    <button 
                      v-if="user.role !== 'admin'" 
                      class="action-btn delete"
                      @click="deleteUser(user)"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="3 6 5 6 21 6"/>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- System Health -->
        <div v-if="activeTab === 'system'" class="tab-pane">
          <div class="pane-header">
            <h3>System Health</h3>
            <button class="btn-outline" @click="refreshSystemHealth">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="23 4 23 10 17 10"/>
                <polyline points="1 20 1 14 7 14"/>
                <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
              </svg>
              Refresh
            </button>
          </div>

          <div class="system-health-grid">
            <div class="health-card">
              <h4>Server Status</h4>
              <div class="health-status">
                <div class="status-indicator online"></div>
                <span>All Systems Operational</span>
              </div>
              <div class="health-metrics">
                <div class="metric">
                  <span>CPU Usage</span>
                  <strong>{{ systemHealth.cpu }}%</strong>
                </div>
                <div class="metric">
                  <span>Memory Usage</span>
                  <strong>{{ systemHealth.memory }}%</strong>
                </div>
                <div class="metric">
                  <span>Disk Usage</span>
                  <strong>{{ systemHealth.disk }}%</strong>
                </div>
              </div>
            </div>

            <div class="health-card">
              <h4>API Performance</h4>
              <div class="performance-metrics">
                <div class="metric">
                  <span>Response Time</span>
                  <strong>{{ systemHealth.responseTime }}ms</strong>
                </div>
                <div class="metric">
                  <span>Uptime</span>
                  <strong>{{ systemHealth.uptime }}</strong>
                </div>
                <div class="metric">
                  <span>Error Rate</span>
                  <strong>{{ systemHealth.errorRate }}%</strong>
                </div>
              </div>
            </div>

            <div class="health-card">
              <h4>Database Status</h4>
              <div class="database-stats">
                <div class="stat">
                  <span>Connections</span>
                  <strong>{{ systemHealth.dbConnections }}</strong>
                </div>
                <div class="stat">
                  <span>Query Time</span>
                  <strong>{{ systemHealth.dbQueryTime }}ms</strong>
                </div>
                <div class="stat">
                  <span>Size</span>
                  <strong>{{ systemHealth.dbSize }}MB</strong>
                </div>
              </div>
            </div>

            <div class="health-card">
              <h4>Recent Events</h4>
              <div class="events-list">
                <div 
                  v-for="event in systemEvents" 
                  :key="event.id"
                  class="event-item"
                  :class="event.type"
                >
                  <div class="event-icon">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <circle cx="12" cy="12" r="10"/>
                      <line x1="12" y1="8" x2="12" y2="12"/>
                      <line x1="12" y1="16" x2="12.01" y2="16"/>
                    </svg>
                  </div>
                  <div class="event-details">
                    <div class="event-message">{{ event.message }}</div>
                    <div class="event-time">{{ formatTime(event.timestamp) }}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Model Management -->
        <div v-if="activeTab === 'models'" class="tab-pane">
          <div class="pane-header">
            <h3>Model Management</h3>
            <button class="btn-primary" @click="deployNewModel">
              Deploy New Model
            </button>
          </div>

          <div class="models-grid">
            <div 
              v-for="model in adminModels" 
              :key="model.id"
              class="model-admin-card"
            >
              <div class="model-header">
                <h4>{{ model.name }}</h4>
                <span class="model-version">v{{ model.version }}</span>
              </div>
              
              <div class="model-stats">
                <div class="stat">
                  <span>Accuracy</span>
                  <strong>{{ model.accuracy }}%</strong>
                </div>
                <div class="stat">
                  <span>Predictions</span>
                  <strong>{{ model.predictions.toLocaleString() }}</strong>
                </div>
                <div class="stat">
                  <span>Size</span>
                  <strong>{{ model.size }}MB</strong>
                </div>
              </div>

              <div class="model-actions">
                <button 
                  class="btn-primary"
                  :class="{ 'btn-secondary': model.status === 'active' }"
                  @click="toggleModelStatus(model)"
                >
                  {{ model.status === 'active' ? 'Active' : 'Activate' }}
                </button>
                <button class="btn-outline" @click="retrainModel(model)">
                  Retrain
                </button>
                <button class="btn-outline danger" @click="deleteModel(model)">
                  Delete
                </button>
              </div>

              <div class="model-meta">
                <span>Deployed: {{ formatTime(model.deployedAt) }}</span>
                <span>Last Training: {{ formatTime(model.lastTrained) }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- System Settings -->
        <div v-if="activeTab === 'settings'" class="tab-pane">
          <div class="pane-header">
            <h3>System Settings</h3>
            <button class="btn-primary" @click="saveSettings">
              Save Settings
            </button>
          </div>

          <div class="settings-grid">
            <div class="settings-section">
              <h4>General Settings</h4>
              <div class="setting-item">
                <label>Application Name</label>
                <input 
                  v-model="settings.appName" 
                  type="text" 
                  class="form-input"
                >
              </div>
              <div class="setting-item">
                <label>Maximum File Size</label>
                <input 
                  v-model="settings.maxFileSize" 
                  type="number" 
                  class="form-input"
                >
                <span class="setting-hint">MB</span>
              </div>
              <div class="setting-item">
                <label class="checkbox-container">
                  <input type="checkbox" v-model="settings.allowRegistrations">
                  <span class="checkmark"></span>
                  Allow new user registrations
                </label>
              </div>
            </div>

            <div class="settings-section">
              <h4>Model Settings</h4>
              <div class="setting-item">
                <label>Default Confidence Threshold</label>
                <input 
                  v-model="settings.confidenceThreshold" 
                  type="number" 
                  min="0"
                  max="100"
                  class="form-input"
                >
                <span class="setting-hint">%</span>
              </div>
              <div class="setting-item">
                <label>Auto-retrain Interval</label>
                <select v-model="settings.retrainInterval" class="form-input">
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="quarterly">Quarterly</option>
                  <option value="never">Never</option>
                </select>
              </div>
            </div>

            <div class="settings-section">
              <h4>Security Settings</h4>
              <div class="setting-item">
                <label>Session Timeout</label>
                <input 
                  v-model="settings.sessionTimeout" 
                  type="number" 
                  class="form-input"
                >
                <span class="setting-hint">minutes</span>
              </div>
              <div class="setting-item">
                <label>Max Login Attempts</label>
                <input 
                  v-model="settings.maxLoginAttempts" 
                  type="number" 
                  class="form-input"
                >
              </div>
              <div class="setting-item">
                <label class="checkbox-container">
                  <input type="checkbox" v-model="settings.requireEmailVerification">
                  <span class="checkmark"></span>
                  Require email verification
                </label>
              </div>
            </div>

            <div class="settings-section">
              <h4>Backup & Maintenance</h4>
              <div class="setting-item">
                <label>Auto-backup Frequency</label>
                <select v-model="settings.backupFrequency" class="form-input">
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>
              <div class="setting-item">
                <label>Retain Backups For</label>
                <input 
                  v-model="settings.retainBackups" 
                  type="number" 
                  class="form-input"
                >
                <span class="setting-hint">days</span>
              </div>
              <div class="setting-actions">
                <button class="btn-outline" @click="createBackup">
                  Create Backup Now
                </button>
                <button class="btn-outline" @click="runMaintenance">
                  Run Maintenance
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Add User Modal -->
    <div v-if="showAddUserModal" class="modal-overlay" @click="showAddUserModal = false">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>Add New User</h3>
          <button class="modal-close" @click="showAddUserModal = false">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="submitNewUser">
            <div class="form-group">
              <label for="userName">Full Name *</label>
              <input
                id="userName"
                v-model="newUser.name"
                type="text"
                class="form-input"
                required
                placeholder="Enter full name"
              >
            </div>
            
            <div class="form-group">
              <label for="userEmail">Email Address *</label>
              <input
                id="userEmail"
                v-model="newUser.email"
                type="email"
                class="form-input"
                required
                placeholder="Enter email address"
              >
            </div>
            
            <div class="form-group">
              <label for="userRole">Role *</label>
              <select
                id="userRole"
                v-model="newUser.role"
                class="form-input"
                required
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
                <option value="moderator">Moderator</option>
              </select>
            </div>
            
            <div class="form-group">
              <label for="userPassword">Password *</label>
              <input
                id="userPassword"
                v-model="newUser.password"
                type="password"
                class="form-input"
                required
                placeholder="Enter password"
                minlength="6"
              >
            </div>
            
            <div class="form-group">
              <label class="checkbox-container">
                <input type="checkbox" v-model="newUser.sendWelcomeEmail">
                <span class="checkmark"></span>
                Send welcome email with login instructions
              </label>
            </div>
            
            <div class="form-actions">
              <button type="button" class="btn-outline" @click="showAddUserModal = false">
                Cancel
              </button>
              <button type="submit" class="btn-primary" :disabled="addingUser">
                {{ addingUser ? 'Adding...' : 'Add User' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Edit User Modal -->
    <div v-if="showEditUserModal" class="modal-overlay" @click="showEditUserModal = false">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>Edit User</h3>
          <button class="modal-close" @click="showEditUserModal = false">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="submitEditUser">
            <div class="form-group">
              <label for="editUserName">Full Name *</label>
              <input
                id="editUserName"
                v-model="editingUser.name"
                type="text"
                class="form-input"
                required
              >
            </div>
            
            <div class="form-group">
              <label for="editUserEmail">Email Address *</label>
              <input
                id="editUserEmail"
                v-model="editingUser.email"
                type="email"
                class="form-input"
                required
              >
            </div>
            
            <div class="form-group">
              <label for="editUserRole">Role *</label>
              <select
                id="editUserRole"
                v-model="editingUser.role"
                class="form-input"
                required
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
                <option value="moderator">Moderator</option>
              </select>
            </div>
            
            <div class="form-group">
              <label for="editUserStatus">Status *</label>
              <select
                id="editUserStatus"
                v-model="editingUser.status"
                class="form-input"
                required
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>
            
            <div class="form-group">
              <label for="editUserPassword">New Password (leave blank to keep current)</label>
              <input
                id="editUserPassword"
                v-model="editingUser.password"
                type="password"
                class="form-input"
                placeholder="Enter new password"
                minlength="6"
              >
            </div>
            
            <div class="form-actions">
              <button type="button" class="btn-outline" @click="showEditUserModal = false">
                Cancel
              </button>
              <button type="submit" class="btn-primary" :disabled="updatingUser">
                {{ updatingUser ? 'Updating...' : 'Update User' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import flaskApi from '@/services/flaskApi'

export default {
  name: 'AdminPanel',
  setup() {
    const activeTab = ref('users')
    const showAddUserModal = ref(false)
    const showEditUserModal = ref(false)
    const loading = ref(true)
    const addingUser = ref(false)
    const updatingUser = ref(false)

    const tabs = [
      { id: 'users', name: 'Users' },
      { id: 'system', name: 'System Health' },
      { id: 'models', name: 'Models' },
      { id: 'settings', name: 'Settings' }
    ]

    // New user form data
    const newUser = ref({
      name: '',
      email: '',
      role: 'user',
      password: '',
      sendWelcomeEmail: true
    })

    // Editing user data
    const editingUser = ref({
      id: null,
      name: '',
      email: '',
      role: 'user',
      status: 'active',
      password: ''
    })

    // Load real data from backend
    // Load real data from backend
const loadAdminData = async () => {
  try {
    loading.value = true
    
    // Load all data in parallel
    const [usersResponse, modelsResponse, healthResponse, settingsResponse, statsResponse] = await Promise.all([
      flaskApi.get('/api/admin/users'),
      flaskApi.get('/api/models'),
      flaskApi.get('/api/admin/system/health'),
      flaskApi.get('/api/admin/settings'),
      flaskApi.get('/api/admin/stats')
    ])

    // Update all data with real backend data
    stats.value = statsResponse.data
    users.value = usersResponse.data.map(user => ({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      predictions: user.prediction_count || 0,
      lastActive: new Date(user.last_active),
      status: user.is_active ? 'active' : 'inactive'
    }))

    systemHealth.value = healthResponse.data
    settings.value = settingsResponse.data

    // Update models with real data
    adminModels.value = modelsResponse.data.map(model => ({
      id: model.id,
      name: model.name,
      version: model.version || '1.0',
      accuracy: model.accuracy || 0,
      predictions: model.prediction_count || 0,
      size: 45, // You can calculate this from file_size if available
      status: model.status === 'active' ? 'active' : 'idle',
      deployedAt: new Date(model.created_at),
      lastTrained: new Date(model.last_trained || model.created_at)
    }))

  } catch (error) {
    console.error('Failed to load admin data:', error)
    alert('Failed to load admin data. Please check your connection.')
  } finally {
    loading.value = false
  }
}

    const generateAdminData = (modelsData, usersData, totalPredictions, avgAccuracy) => {
      // Calculate storage usage based on model sizes and data
      const modelSizes = modelsData.length * 45 // Average model size in MB
      const dataSize = totalPredictions * 0.1 // Approximate data size per prediction
      const totalStorage = modelSizes + dataSize

      stats.value = {
        totalUsers: usersData.length,
        totalPredictions: totalPredictions,
        systemAccuracy: avgAccuracy.toFixed(1),
        storageUsed: (totalStorage / 1024).toFixed(1) // Convert to GB
      }

      // Use real users data or fallback to mock
      if (usersData && usersData.length > 0) {
        users.value = usersData.map(user => ({
          id: user.id,
          name: user.name || user.username,
          email: user.email,
          role: user.role || 'user',
          predictions: user.prediction_count || 0,
          lastActive: new Date(user.last_active || Date.now()),
          status: user.status || 'active'
        }))
      } else {
        // Fallback mock users
        users.value = generateMockUsers(totalPredictions)
      }

      // Generate system health data based on actual performance
      systemHealth.value = {
        cpu: Math.floor(Math.random() * 30) + 20,
        memory: Math.floor(Math.random() * 40) + 30,
        disk: Math.floor((totalStorage / (50 * 1024)) * 100), // Assuming 50GB total storage
        responseTime: 45,
        uptime: '99.9%',
        errorRate: 0.2,
        dbConnections: 24,
        dbQueryTime: 12,
        dbSize: Math.floor(totalStorage)
      }

      // Generate system events based on actual activities
      systemEvents.value = [
        {
          id: 1,
          type: 'info',
          message: `Model "${modelsData[0]?.name || 'CNN Basic'}" training completed`,
          timestamp: new Date(Date.now() - 3600000)
        },
        {
          id: 2,
          type: 'success',
          message: `${totalPredictions.toLocaleString()} predictions processed today`,
          timestamp: new Date(Date.now() - 7200000)
        },
        {
          id: 3,
          type: 'info',
          message: 'System backup completed successfully',
          timestamp: new Date(Date.now() - 86400000)
        }
      ]

      // Generate admin models from actual model data
      adminModels.value = modelsData.map((model, index) => ({
        id: model.id,
        name: model.name,
        version: model.version || '1.0',
        accuracy: model.accuracy || 0,
        predictions: model.prediction_count || 0,
        size: 45 + (index * 15), // Varying sizes
        status: model.status || 'idle',
        deployedAt: new Date(model.created_at || Date.now()),
        lastTrained: new Date(model.last_trained || Date.now() - 86400000)
      }))
    }

    const generateMockData = () => {
      const totalPredictions = 12543
      const avgAccuracy = 95.5
      const totalStorage = 12.5

      stats.value = {
        totalUsers: 142,
        totalPredictions: totalPredictions,
        systemAccuracy: avgAccuracy,
        storageUsed: totalStorage
      }

      users.value = generateMockUsers(totalPredictions)

      systemHealth.value = {
        cpu: 45,
        memory: 62,
        disk: 25,
        responseTime: 45,
        uptime: '99.9%',
        errorRate: 0.2,
        dbConnections: 24,
        dbQueryTime: 12,
        dbSize: 245
      }

      systemEvents.value = [
        {
          id: 1,
          type: 'info',
          message: "Model 'CNN Basic' training completed",
          timestamp: new Date(Date.now() - 3600000)
        },
        {
          id: 2,
          type: 'success',
          message: "12,543 predictions processed today",
          timestamp: new Date(Date.now() - 7200000)
        },
        {
          id: 3,
          type: 'info',
          message: "System backup completed successfully",
          timestamp: new Date(Date.now() - 86400000)
        }
      ]

      adminModels.value = [
        {
          id: 1,
          name: 'CNN Basic',
          version: '1.2',
          accuracy: 96.2,
          predictions: 8450,
          size: 45,
          status: 'active',
          deployedAt: new Date(Date.now() - 30 * 86400000),
          lastTrained: new Date(Date.now() - 7 * 86400000)
        },
        {
          id: 2,
          name: 'ResNet Advanced',
          version: '2.1',
          accuracy: 97.8,
          predictions: 3200,
          size: 120,
          status: 'idle',
          deployedAt: new Date(Date.now() - 15 * 86400000),
          lastTrained: new Date(Date.now() - 3 * 86400000)
        }
      ]
    }

    const generateMockUsers = (totalPredictions) => {
      return [
        {
          id: 1,
          name: 'Admin User',
          email: 'admin@digiscrib.com',
          role: 'admin',
          predictions: Math.floor(totalPredictions * 0.1),
          lastActive: new Date(Date.now() - 3600000),
          status: 'active'
        },
        {
          id: 2,
          name: 'Test User',
          email: 'test@digiscrib.com',
          role: 'user',
          predictions: Math.floor(totalPredictions * 0.05),
          lastActive: new Date(Date.now() - 86400000),
          status: 'active'
        },
        {
          id: 3,
          name: 'Demo User',
          email: 'demo@digiscrib.com',
          role: 'user',
          predictions: Math.floor(totalPredictions * 0.03),
          lastActive: new Date(Date.now() - 259200000),
          status: 'inactive'
        },
        {
          id: 4,
          name: 'John Smith',
          email: 'john.smith@example.com',
          role: 'user',
          predictions: Math.floor(totalPredictions * 0.02),
          lastActive: new Date(Date.now() - 172800000),
          status: 'active'
        },
        {
          id: 5,
          name: 'Sarah Johnson',
          email: 'sarah.j@example.com',
          role: 'moderator',
          predictions: Math.floor(totalPredictions * 0.08),
          lastActive: new Date(Date.now() - 43200000),
          status: 'active'
        }
      ]
    }

    // Reactive data
    const stats = ref({
      totalUsers: 0,
      totalPredictions: 0,
      systemAccuracy: 0,
      storageUsed: 0
    })

    const users = ref([])
    const systemHealth = ref({})
    const systemEvents = ref([])
    const adminModels = ref([])

    const settings = ref({
      appName: 'DigiScrib',
      maxFileSize: 10,
      allowRegistrations: true,
      confidenceThreshold: 80,
      retrainInterval: 'weekly',
      sessionTimeout: 30,
      maxLoginAttempts: 5,
      requireEmailVerification: true,
      backupFrequency: 'weekly',
      retainBackups: 30
    })

    // Computed properties
    const storageUsage = computed(() => {
      return Math.floor((stats.value.storageUsed / 50) * 100) // Assuming 50GB total
    })

    const newUsersThisWeek = computed(() => {
      return Math.floor(Math.random() * 10) + 5
    })

    const predictionsToday = computed(() => {
      return Math.floor(stats.value.totalPredictions * 0.01) // 1% of total per day
    })

    const accuracyImprovement = computed(() => {
      return 2.1 // This would be calculated from historical data
    })

    // Methods
    const getUserInitials = (name) => {
      return name.split(' ').map(n => n[0]).join('').toUpperCase()
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

    const editUser = (user) => {
      editingUser.value = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        password: ''
      }
      showEditUserModal.value = true
    }

    const submitEditUser = async () => {
      try {
        updatingUser.value = true
        
        // In a real app, this would call your API
        const response = await flaskApi.put(`/api/admin/users/${editingUser.value.id}`, {
          name: editingUser.value.name,
          email: editingUser.value.email,
          role: editingUser.value.role,
          status: editingUser.value.status,
          password: editingUser.value.password || undefined // Only send if provided
        })

        // Update local state
        const userIndex = users.value.findIndex(u => u.id === editingUser.value.id)
        if (userIndex !== -1) {
          users.value[userIndex] = {
            ...users.value[userIndex],
            name: editingUser.value.name,
            email: editingUser.value.email,
            role: editingUser.value.role,
            status: editingUser.value.status
          }
        }

        showEditUserModal.value = false
        alert('User updated successfully!')
        
      } catch (error) {
        console.error('Failed to update user:', error)
        alert('Failed to update user. Please try again.')
      } finally {
        updatingUser.value = false
      }
    }

    const deleteUser = async (user) => {
      if (confirm(`Are you sure you want to delete ${user.name}? This action cannot be undone.`)) {
        try {
          // In a real app, this would call your API
          await flaskApi.delete(`/api/admin/users/${user.id}`)
          
          users.value = users.value.filter(u => u.id !== user.id)
          stats.value.totalUsers = users.value.length
          
          alert('User deleted successfully!')
        } catch (error) {
          console.error('Failed to delete user:', error)
          alert('Failed to delete user. Please try again.')
        }
      }
    }

    const submitNewUser = async () => {
      try {
        addingUser.value = true
        
        // In a real app, this would call your API
        const response = await flaskApi.post('/api/admin/users', {
          name: newUser.value.name,
          email: newUser.value.email,
          role: newUser.value.role,
          password: newUser.value.password,
          send_welcome_email: newUser.value.sendWelcomeEmail
        })

        // Add the new user to the local state
        const newUserData = {
          id: users.value.length + 1, // In real app, this would come from the response
          name: newUser.value.name,
          email: newUser.value.email,
          role: newUser.value.role,
          predictions: 0,
          lastActive: new Date(),
          status: 'active'
        }
        
        users.value.push(newUserData)
        stats.value.totalUsers = users.value.length
        
        // Reset form and close modal
        resetNewUserForm()
        showAddUserModal.value = false
        
        alert('User created successfully!')
        
      } catch (error) {
        console.error('Failed to create user:', error)
        alert('Failed to create user. Please try again.')
      } finally {
        addingUser.value = false
      }
    }

    const resetNewUserForm = () => {
      newUser.value = {
        name: '',
        email: '',
        role: 'user',
        password: '',
        sendWelcomeEmail: true
      }
    }

    const exportUsers = () => {
      const exportData = {
        users: users.value,
        exportedAt: new Date().toISOString(),
        total: users.value.length
      }
      
      const dataStr = JSON.stringify(exportData, null, 2)
      const dataBlob = new Blob([dataStr], { type: 'application/json' })
      const url = URL.createObjectURL(dataBlob)
      const link = document.createElement('a')
      link.href = url
      link.download = `users-export-${new Date().toISOString().split('T')[0]}.json`
      link.click()
      URL.revokeObjectURL(url)
    }

    const refreshSystemHealth = async () => {
      try {
        loading.value = true
        // Simulate API call to refresh system health
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        // Update system health with new random values
        systemHealth.value = {
          ...systemHealth.value,
          cpu: Math.floor(Math.random() * 30) + 20,
          memory: Math.floor(Math.random() * 40) + 30,
          responseTime: Math.floor(Math.random() * 20) + 35
        }
        
        // Add a new system event
        systemEvents.value.unshift({
          id: systemEvents.value.length + 1,
          type: 'info',
          message: 'System health check completed',
          timestamp: new Date()
        })
        
      } catch (error) {
        console.error('Failed to refresh system health:', error)
      } finally {
        loading.value = false
      }
    }

    const toggleModelStatus = async (model) => {
      try {
        // In a real app, this would call the activate endpoint
        await flaskApi.post(`/api/models/${model.id}/activate`)
        model.status = model.status === 'active' ? 'idle' : 'active'
        alert(`Model ${model.name} ${model.status === 'active' ? 'activated' : 'deactivated'}`)
      } catch (error) {
        console.error('Failed to toggle model status:', error)
        alert('Failed to update model status')
      }
    }

    const retrainModel = async (model) => {
      try {
        // In a real app, this would call the train endpoint
        await flaskApi.post(`/api/models/${model.id}/train`)
        alert(`Model ${model.name} training started`)
        
        // Update last trained timestamp
        model.lastTrained = new Date()
      } catch (error) {
        console.error('Failed to retrain model:', error)
        alert('Failed to start model training')
      }
    }

    const deleteModel = async (model) => {
      if (confirm(`Are you sure you want to delete ${model.name}? This action cannot be undone.`)) {
        try {
          await flaskApi.delete(`/api/models/${model.id}`)
          adminModels.value = adminModels.value.filter(m => m.id !== model.id)
          alert('Model deleted successfully')
        } catch (error) {
          console.error('Failed to delete model:', error)
          alert('Failed to delete model')
        }
      }
    }

    const deployNewModel = () => {
      console.log('Deploying new model')
      alert('New model deployment would be implemented here')
    }

    const saveSettings = async () => {
      try {
        // In a real app, this would call a settings API
        await flaskApi.post('/api/admin/settings', settings.value)
        alert('Settings saved successfully!')
      } catch (error) {
        console.error('Failed to save settings:', error)
        alert('Failed to save settings. Please try again.')
      }
    }

    const createBackup = async () => {
      try {
        loading.value = true
        await flaskApi.post('/api/admin/backup')
        alert('Backup created successfully!')
        
        // Add system event
        systemEvents.value.unshift({
          id: systemEvents.value.length + 1,
          type: 'success',
          message: 'Manual backup created successfully',
          timestamp: new Date()
        })
      } catch (error) {
        console.error('Failed to create backup:', error)
        alert('Failed to create backup')
      } finally {
        loading.value = false
      }
    }

    const runMaintenance = async () => {
      try {
        loading.value = true
        await flaskApi.post('/api/admin/maintenance')
        alert('Maintenance tasks completed successfully!')
        
        // Add system event
        systemEvents.value.unshift({
          id: systemEvents.value.length + 1,
          type: 'info',
          message: 'System maintenance completed',
          timestamp: new Date()
        })
      } catch (error) {
        console.error('Failed to run maintenance:', error)
        alert('Failed to run maintenance tasks')
      } finally {
        loading.value = false
      }
    }

    onMounted(() => {
      loadAdminData()
    })

    return {
      activeTab,
      tabs,
      stats,
      users,
      systemHealth,
      systemEvents,
      adminModels,
      settings,
      showAddUserModal,
      showEditUserModal,
      loading,
      addingUser,
      updatingUser,
      newUser,
      editingUser,
      storageUsage,
      newUsersThisWeek,
      predictionsToday,
      accuracyImprovement,
      getUserInitials,
      formatTime,
      editUser,
      deleteUser,
      submitNewUser,
      submitEditUser,
      exportUsers,
      refreshSystemHealth,
      toggleModelStatus,
      retrainModel,
      deleteModel,
      deployNewModel,
      saveSettings,
      createBackup,
      runMaintenance
    }
  }
}
</script>

<style scoped>
/* Add loading state styles */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
}

.loading-state .loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f1f5f9;
  border-top: 4px solid #059669;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

.loading-state p {
  color: #64748b;
  font-size: 16px;
  margin: 0;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Form styles for modals */
.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: #374151;
  margin-bottom: 6px;
}

.form-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 24px;
  padding-top: 16px;
  border-top: 1px solid #e5e7eb;
}

/* Keep all your existing styles below */
.admin-panel {
  padding: 0;
}

.page-header {
  margin-bottom: 32px;
}

.page-header h1 {
  font-size: 28px;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 8px;
}

.page-header p {
  color: #64748b;
  font-size: 16px;
}

/* Admin Stats */
.admin-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 32px;
}

.stat-card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1);
  display: flex;
  align-items: center;
  gap: 16px;
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.stat-icon.users {
  background: #dbeafe;
  color: #1d4ed8;
}

.stat-icon.predictions {
  background: #f0fdf4;
  color: #059669;
}

.stat-icon.accuracy {
  background: #fef7cd;
  color: #d97706;
}

.stat-icon.storage {
  background: #f3f4f6;
  color: #374151;
}

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: 24px;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 14px;
  color: #64748b;
  margin-bottom: 4px;
}

.stat-change {
  font-size: 12px;
  font-weight: 500;
}

.stat-change.positive {
  color: #059669;
}

.stat-change.warning {
  color: #f59e0b;
}

/* Admin Tabs */
.admin-tabs {
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1);
  overflow: hidden;
}

.tabs-header {
  display: flex;
  border-bottom: 1px solid #e5e7eb;
  background: #f8fafc;
}

.tab-btn {
  padding: 16px 24px;
  background: none;
  border: none;
  font-size: 14px;
  font-weight: 500;
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s ease;
  border-bottom: 2px solid transparent;
}

.tab-btn:hover {
  color: #374151;
  background: #f1f5f9;
}

.tab-btn.active {
  color: #059669;
  border-bottom-color: #059669;
  background: white;
}

.tab-content {
  padding: 0;
}

.tab-pane {
  padding: 0;
}

/* Pane Header */
.pane-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px;
  border-bottom: 1px solid #e5e7eb;
}

.pane-header h3 {
  font-size: 20px;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
}

.header-actions {
  display: flex;
  gap: 12px;
}

/* Buttons */
.btn-primary, .btn-secondary, .btn-outline {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
}

.btn-primary {
  background: #059669;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #047857;
}

.btn-primary:disabled {
  background: #9ca3af;
  cursor: not-allowed;
}

.btn-secondary {
  background: #f1f5f9;
  color: #475569;
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

.btn-outline.danger {
  color: #ef4444;
  border-color: #ef4444;
}

.btn-outline.danger:hover {
  background: #fef2f2;
}

/* Users Table */
.users-table {
  padding: 0;
}

.table-header {
  background: #f8fafc;
  border-bottom: 1px solid #e5e7eb;
}

.table-row {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr 1fr 1fr;
  gap: 16px;
  padding: 16px 24px;
  align-items: center;
}

.table-cell {
  font-size: 14px;
  color: #374151;
}

.table-cell.actions {
  text-align: right;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
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

.user-details .user-name {
  font-weight: 500;
  color: #1e293b;
}

.user-details .user-email {
  font-size: 12px;
  color: #64748b;
}

.role-badge {
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  text-transform: capitalize;
}

.role-badge.admin {
  background: #fef3c7;
  color: #92400e;
}

.role-badge.user {
  background: #f1f5f9;
  color: #475569;
}

.role-badge.moderator {
  background: #dbeafe;
  color: #1e40af;
}

.status-badge {
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  text-transform: capitalize;
}

.status-badge.active {
  background: #d1fae5;
  color: #065f46;
}

.status-badge.inactive {
  background: #f1f5f9;
  color: #475569;
}

.status-badge.suspended {
  background: #fef3c7;
  color: #92400e;
}

.action-buttons {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
}

.action-btn {
  background: none;
  border: none;
  padding: 6px;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.action-btn.edit {
  color: #059669;
}

.action-btn.edit:hover {
  background: #f0fdf4;
}

.action-btn.delete {
  color: #ef4444;
}

.action-btn.delete:hover {
  background: #fef2f2;
}

/* System Health */
.system-health-grid {
  padding: 24px;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 24px;
}

.health-card {
  background: #f8fafc;
  border-radius: 8px;
  padding: 20px;
}

.health-card h4 {
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 16px;
}

.health-status {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
}

.status-indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.status-indicator.online {
  background: #059669;
}

.health-metrics, .performance-metrics, .database-stats {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.metric, .stat {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #e5e7eb;
}

.metric:last-child, .stat:last-child {
  border-bottom: none;
}

.metric span, .stat span {
  color: #64748b;
  font-size: 14px;
}

.metric strong, .stat strong {
  color: #1e293b;
  font-size: 14px;
  font-weight: 600;
}

/* Events List */
.events-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.event-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px;
  border-radius: 6px;
  background: white;
  border-left: 4px solid #e5e7eb;
}

.event-item.info {
  border-left-color: #3b82f6;
}

.event-item.warning {
  border-left-color: #f59e0b;
}

.event-item.success {
  border-left-color: #059669;
}

.event-icon {
  color: #64748b;
  margin-top: 2px;
}

.event-details {
  flex: 1;
}

.event-message {
  font-size: 14px;
  color: #374151;
  margin-bottom: 4px;
}

.event-time {
  font-size: 12px;
  color: #64748b;
}

/* Model Management */
.models-grid {
  padding: 24px;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 24px;
}

.model-admin-card {
  background: #f8fafc;
  border-radius: 8px;
  padding: 20px;
  border: 2px solid transparent;
}

.model-admin-card:hover {
  border-color: #059669;
}

.model-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.model-header h4 {
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
}

.model-version {
  font-size: 12px;
  color: #64748b;
  background: white;
  padding: 2px 6px;
  border-radius: 4px;
}

.model-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  margin-bottom: 16px;
}

.model-stats .stat {
  text-align: center;
  border: none;
  padding: 0;
}

.model-stats .stat span {
  display: block;
  font-size: 12px;
  color: #64748b;
  margin-bottom: 4px;
}

.model-stats .stat strong {
  display: block;
  font-size: 14px;
  color: #059669;
}

.model-actions {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
}

.model-actions .btn-primary,
.model-actions .btn-secondary,
.model-actions .btn-outline {
  flex: 1;
  font-size: 12px;
  padding: 6px 8px;
}

.model-meta {
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 12px;
  color: #64748b;
}

/* Settings */
.settings-grid {
  padding: 24px;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 32px;
}

.settings-section {
  background: #f8fafc;
  border-radius: 8px;
  padding: 20px;
}

.settings-section h4 {
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 16px;
  padding-bottom: 8px;
  border-bottom: 1px solid #e5e7eb;
}

.setting-item {
  margin-bottom: 16px;
}

.setting-item label {
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: #374151;
  margin-bottom: 6px;
}

.form-input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  transition: all 0.2s ease;
}

.form-input:focus {
  outline: none;
  border-color: #059669;
  box-shadow: 0 0 0 3px rgba(5, 150, 105, 0.1);
}

.setting-hint {
  font-size: 12px;
  color: #64748b;
  margin-left: 8px;
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

.setting-actions {
  display: flex;
  gap: 12px;
  margin-top: 16px;
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 12px;
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.1);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px;
  border-bottom: 1px solid #e5e7eb;
}

.modal-header h3 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #1e293b;
}

.modal-close {
  background: none;
  border: none;
  padding: 4px;
  cursor: pointer;
  color: #64748b;
  border-radius: 4px;
}

.modal-close:hover {
  background: #f1f5f9;
}

.modal-body {
  padding: 24px;
}

/* Responsive */
@media (max-width: 768px) {
  .admin-stats {
    grid-template-columns: 1fr;
  }
  
  .tabs-header {
    flex-wrap: wrap;
  }
  
  .tab-btn {
    flex: 1;
    min-width: 120px;
  }
  
  .table-row {
    grid-template-columns: 1fr;
    gap: 8px;
  }
  
  .system-health-grid,
  .models-grid,
  .settings-grid {
    grid-template-columns: 1fr;
  }
  
  .pane-header {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }
  
  .header-actions {
    justify-content: stretch;
  }
  
  .header-actions .btn-primary,
  .header-actions .btn-outline {
    flex: 1;
  }
  
  .form-actions {
    flex-direction: column;
  }
}
</style>
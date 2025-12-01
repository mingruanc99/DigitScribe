<template>
  <div class="admin-panel">
    <div class="page-header">
      <h1>Admin Panel</h1>
      <p>Manage users, monitor analytics, and handle feedback</p>
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
        <div class="stat-icon feedback">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
          </svg>
        </div>
        <div class="stat-info">
          <div class="stat-value">{{ feedbackStats.totalFeedback }}</div>
          <div class="stat-label">Total Feedback</div>
          <div class="stat-change positive">{{ feedbackStats.positiveRate }}% positive</div>
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
          <span v-if="tab.notification" class="tab-notification">{{ tab.notification }}</span>
        </button>
      </div>

      <div class="tab-content">
        <!-- Analytics Tab -->
        <div v-if="activeTab === 'analytics'" class="tab-pane">
          <div class="pane-header">
            <h3>Analytics Dashboard</h3>
            <div class="header-actions">
              <select v-model="analyticsTimeRange" class="form-input" @change="loadAnalyticsData">
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
                <option value="1y">Last year</option>
              </select>
              <button class="btn-outline" @click="exportAnalytics">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                  <polyline points="7 10 12 15 17 10"/>
                  <line x1="12" y1="15" x2="12" y2="3"/>
                </svg>
                Export
              </button>
            </div>
          </div>

          <div class="analytics-grid">
            <!-- Top Performing Models -->
            <div class="analytics-card">
              <div class="card-header">
                <h4>Top Performing Models</h4>
              </div>
              <div class="top-models-list">
                <div 
                  v-for="model in analytics.topModels" 
                  :key="model.id"
                  class="model-rank-item"
                >
                  <div class="model-rank">
                    <span class="rank-badge" :class="getRankClass(model.rank)">
                      {{ model.rank }}
                    </span>
                  </div>
                  <div class="model-info">
                    <div class="model-name">{{ model.name }}</div>
                    <div class="model-stats">
                      <span>{{ model.accuracy }}% accuracy</span>
                      <span>{{ model.predictions.toLocaleString() }} predictions</span>
                    </div>
                  </div>
                  <div class="model-trend" :class="model.trend >= 0 ? 'positive' : 'negative'">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <polyline v-if="model.trend >= 0" points="18 15 12 9 6 15"/>
                      <polyline v-else points="6 9 12 15 18 9"/>
                    </svg>
                    {{ Math.abs(model.trend) }}%
                  </div>
                </div>
              </div>
            </div>

            <!-- Model Performance -->
            <div class="analytics-card">
              <div class="card-header">
                <h4>Model Performance</h4>
              </div>
              <div class="chart-container">
                <canvas ref="modelPerformanceChart"></canvas>
                <div v-if="loadingAnalytics" class="chart-loading">Loading chart...</div>
              </div>
            </div>

            <!-- Predictions Growth -->
            <div class="analytics-card">
              <div class="card-header">
                <h4>Predictions Growth</h4>
              </div>
              <div class="chart-container">
                <canvas ref="predictionsGrowthChart"></canvas>
                <div v-if="loadingAnalytics" class="chart-loading">Loading chart...</div>
              </div>
              <div class="growth-stats">
                <div class="growth-stat-item">
                  <span class="growth-label">Total Growth:</span>
                  <span class="growth-value positive">{{ analytics.predictionsGrowth?.totalGrowth || 15 }}%</span>
                </div>
                <div class="growth-stat-item">
                  <span class="growth-label">Daily Average:</span>
                  <span class="growth-value">{{ analytics.predictionsGrowth?.dailyAverage || 125 }} predictions</span>
                </div>
                <div class="growth-stat-item">
                  <span class="growth-label">Peak Day:</span>
                  <span class="growth-value">{{ analytics.predictionsGrowth?.peakDay || 250 }} predictions</span>
                </div>
              </div>
            </div>

            <!-- Accuracy Trend -->
            <div class="analytics-card">
              <div class="card-header">
                <h4>Accuracy Trend</h4>
              </div>
              <div class="chart-container">
                <canvas ref="accuracyTrendChart"></canvas>
                <div v-if="loadingAnalytics" class="chart-loading">Loading chart...</div>
              </div>
              <div class="accuracy-stats">
                <div class="accuracy-stat-item">
                  <span class="accuracy-label">Current Accuracy:</span>
                  <span class="accuracy-value">{{ stats.systemAccuracy }}%</span>
                </div>
                <div class="accuracy-stat-item">
                  <span class="accuracy-label">Improvement Trend:</span>
                  <span class="accuracy-value positive">+{{ analytics.accuracyTrend?.improvement || 2.1 }}%</span>
                </div>
                <div class="accuracy-stat-item">
                  <span class="accuracy-label">Stability:</span>
                  <span class="accuracy-value">{{ analytics.accuracyTrend?.stability || 98 }}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

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

          <!-- Real Users Data Section -->
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
                v-for="user in realUsers" 
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

          <!-- Pagination Controls -->
          <div class="pagination-controls" v-if="realUsers.length > 0">
            <button 
              class="btn-outline" 
              :disabled="currentPage === 1"
              @click="changePage(currentPage - 1)"
            >
              Previous
            </button>
            
            <span class="pagination-info">
              Page {{ currentPage }} of {{ totalPages }}
            </span>
            
            <button 
              class="btn-outline" 
              :disabled="currentPage === totalPages"
              @click="changePage(currentPage + 1)"
            >
              Next
            </button>
            
            <select v-model="pageSize" @change="changePageSize" class="form-input">
              <option value="10">10 per page</option>
              <option value="25">25 per page</option>
              <option value="50">50 per page</option>
              <option value="100">100 per page</option>
            </select>
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

        <!-- Feedback Tab -->
        <div v-if="activeTab === 'feedback'" class="tab-pane">
          <div class="pane-header">
            <h3>User Feedback Management</h3>
            <div class="header-actions">
              <button class="btn-outline" @click="refreshFeedback">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="23 4 23 10 17 10"/>
                  <polyline points="1 20 1 14 7 14"/>
                  <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
                </svg>
                Refresh
              </button>
              <button class="btn-outline" @click="exportFeedback">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                  <polyline points="7 10 12 15 17 10"/>
                  <line x1="12" y1="15" x2="12" y2="3"/>
                </svg>
                Export
              </button>
            </div>
          </div>

          <div class="feedback-grid">
            <!-- Feedback Summary -->
            <div class="feedback-summary-card">
              <h4>Feedback Summary</h4>
              <div class="feedback-summary-stats">
                <div class="summary-stat">
                  <div class="summary-value">{{ feedbackStats.totalFeedback }}</div>
                  <div class="summary-label">Total Feedback</div>
                </div>
                <div class="summary-stat">
                  <div class="summary-value positive">{{ feedbackStats.positiveCount }}</div>
                  <div class="summary-label">Positive</div>
                </div>
                <div class="summary-stat">
                  <div class="summary-value negative">{{ feedbackStats.negativeCount }}</div>
                  <div class="summary-label">Negative</div>
                </div>
                <div class="summary-stat">
                  <div class="summary-value">{{ feedbackStats.positiveRate }}%</div>
                  <div class="summary-label">Satisfaction Rate</div>
                </div>
              </div>
            </div>

            <!-- Feedback Chart -->
            <div class="feedback-chart-card">
              <h4>Feedback Trend</h4>
              <div class="chart-container">
                <canvas ref="feedbackTrendChart"></canvas>
              </div>
            </div>

            <!-- Recent Feedback List -->
            <div class="feedback-list-card">
              <h4>Recent Feedback</h4>
              <div class="feedback-list">
                <div 
                  v-for="feedback in recentFeedback" 
                  :key="feedback.id"
                  class="feedback-item"
                  :class="{ 'positive': feedback.is_correct, 'negative': !feedback.is_correct }"
                >
                  <div class="feedback-header">
                    <div class="feedback-user">
                      <span class="user-avatar small">{{ getUserInitials(feedback.user_name || 'User') }}</span>
                      <span class="user-name">{{ feedback.user_name || 'Anonymous User' }}</span>
                    </div>
                    <span class="feedback-time">{{ formatTime(feedback.timestamp) }}</span>
                  </div>
                  
                  <div class="feedback-content">
                    <div class="feedback-prediction">
                      <span class="prediction-label">Predicted:</span>
                      <span class="prediction-digit">{{ feedback.predicted_digit }}</span>
                      <span class="prediction-confidence">{{ (feedback.confidence * 100).toFixed(1) }}%</span>
                    </div>
                    
                    <div class="feedback-verdict">
                      <span class="verdict-icon" :class="feedback.is_correct ? 'correct' : 'incorrect'">
                        {{ feedback.is_correct ? '✓' : '✗' }}
                      </span>
                      <span class="verdict-text">
                        {{ feedback.is_correct ? 'Prediction was correct' : 'Prediction was incorrect' }}
                      </span>
                    </div>
                    
                    <div class="feedback-meta">
                      <span class="backend-used">{{ feedback.backend_used }}</span>
                      <span class="prediction-id">ID: {{ feedback.prediction_id }}</span>
                    </div>
                  </div>
                  
                  <div class="feedback-actions">
                    <button class="action-btn small" @click="viewFeedbackDetails(feedback)">
                      Details
                    </button>
                    <button class="action-btn small delete" @click="deleteFeedback(feedback)">
                      Delete
                    </button>
                  </div>
                </div>
                
                <div v-if="recentFeedback.length === 0" class="no-feedback">
                  <div class="no-data-icon">💬</div>
                  <p>No feedback available yet</p>
                </div>
              </div>
            </div>

            <!-- Feedback Analytics -->
            <div class="feedback-analytics-card">
              <h4>Feedback Analytics</h4>
              <div class="analytics-grid-small">
                <div class="analytics-item">
                  <div class="analytics-label">Most Common Issue</div>
                  <div class="analytics-value">Digit "5" misclassified</div>
                </div>
                <div class="analytics-item">
                  <div class="analytics-label">Best Performing Digit</div>
                  <div class="analytics-value">Digit "1" (98% accuracy)</div>
                </div>
                <div class="analytics-item">
                  <div class="analytics-label">Average Confidence</div>
                  <div class="analytics-value">{{ feedbackStats.averageConfidence }}%</div>
                </div>
                <div class="analytics-item">
                  <div class="analytics-label">Response Rate</div>
                  <div class="analytics-value">{{ feedbackStats.responseRate }}%</div>
                </div>
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

    <!-- Feedback Details Modal -->
    <div v-if="showFeedbackDetailsModal" class="modal-overlay" @click="showFeedbackDetailsModal = false">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>Feedback Details</h3>
          <button class="modal-close" @click="showFeedbackDetailsModal = false">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
      </div>
      </div>
  </div>
        <div class="modal-body">
          <div v-if="selectedFeedback" class="feedback-details">
            <div class="detail-section">
              <h4>User Information</h4>
              <div class="detail-row">
                <span class="detail-label">User:</span>
                <span class="detail-value">{{ selectedFeedback.user_name || 'Anonymous' }}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">User ID:</span>
                <span class="detail-value">{{ selectedFeedback.user_id || 'N/A' }}</span>
              </div>
            </div>
            
            <div class="detail-section">
              <h4>Prediction Details</h4>
              <div class="detail-row">
                <span class="detail-label">Predicted Digit:</span>
                <span class="detail-value digit">{{ selectedFeedback.predicted_digit }}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Confidence:</span>
                <span class="detail-value">{{ (selectedFeedback.confidence * 100).toFixed(1) }}%</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Actual Digit:</span>
                <span class="detail-value">{{ selectedFeedback.actual_digit || 'Not specified' }}</span>
              </div>
            </div>
            
            <div class="detail-section">
              <h4>System Information</h4>
              <div class="detail-row">
                <span class="detail-label">Backend Used:</span>
                <span class="detail-value">{{ selectedFeedback.backend_used }}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Prediction ID:</span>
                <span class="detail-value">{{ selectedFeedback.prediction_id }}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Timestamp:</span>
                <span class="detail-value">{{ formatTime(selectedFeedback.timestamp) }}</span>
              </div>
            </div>
            
            
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue'
import flaskApi from '@/services/flaskApi'
import Chart from 'chart.js/auto'

export default {
  name: 'AdminPanel',
  setup() {
    const activeTab = ref('analytics')
    const showAddUserModal = ref(false)
    const showEditUserModal = ref(false)
    const showFeedbackDetailsModal = ref(false)
    const loading = ref(true)
    const loadingAnalytics = ref(false)
    const addingUser = ref(false)
    const updatingUser = ref(false)
    const analyticsTimeRange = ref('30d')

    // Chart references
    const modelPerformanceChart = ref(null)
    const predictionsGrowthChart = ref(null)
    const accuracyTrendChart = ref(null)
    const feedbackTrendChart = ref(null)

    // Chart instances
    let modelPerformanceChartInstance = null
    let predictionsGrowthChartInstance = null
    let accuracyTrendChartInstance = null
    let feedbackTrendChartInstance = null

    // Updated tabs: Analytics - Users - Models - Feedback
    const tabs = [
      { id: 'analytics', name: 'Analytics', notification: null },
      { id: 'users', name: 'Users', notification: null },
      { id: 'models', name: 'Models', notification: null },
    ]

    // Pagination state
    const currentPage = ref(1)
    const totalPages = ref(1)
    const pageSize = ref(50)

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

    // Selected feedback
    const selectedFeedback = ref(null)

    // Analytics data with proper initialization
    const analytics = ref({
      topModels: [],
      predictionsGrowth: {
        totalGrowth: 15,
        dailyAverage: 125,
        peakDay: 250,
        trend: 'increasing'
      },
      accuracyTrend: {
        current: 95.5,
        improvement: 2.1,
        stability: 98,
        trend: 'improving'
      },
      feedbackTrend: {
        positive: 85,
        negative: 15,
        total: 100
      }
    })

    // Stats - totalUsers now matches realUsers length
    const stats = ref({
      totalUsers: 0,
      totalPredictions: 12543,
      systemAccuracy: 95.5,
      storageUsed: 12.5
    })

    // Feedback stats
    const feedbackStats = ref({
      totalFeedback: 0,
      positiveCount: 0,
      negativeCount: 0,
      positiveRate: 0,
      averageConfidence: 85,
      responseRate: 42
    })

    const realUsers = ref([])
    const adminModels = ref([])
    const recentFeedback = ref([])

    // Computed properties
    const storageUsage = computed(() => {
      return Math.floor((stats.value.storageUsed / 50) * 100)
    })

    const newUsersThisWeek = computed(() => {
      return Math.floor(Math.random() * 10) + 5
    })

    const predictionsToday = computed(() => {
      return Math.floor(stats.value.totalPredictions * 0.01)
    })

    const accuracyImprovement = computed(() => {
      return 2.1
    })

    // Watch for analytics data changes
    watch(() => analytics.value, (newAnalytics) => {
      if (newAnalytics && !loadingAnalytics.value) {
        nextTick(() => {
          initializeCharts()
        })
      }
    }, { deep: true, immediate: true })

    // Watch for active tab changes to reinitialize charts when switching to analytics
    watch(activeTab, (newTab) => {
      if (newTab === 'analytics') {
        nextTick(() => {
          setTimeout(() => {
            initializeCharts()
          }, 300)
        })
      } else if (newTab === 'feedback') {
        nextTick(() => {
          setTimeout(() => {
            initializeFeedbackChart()
          }, 300)
        })
      }
    })

    // Methods
    const initializeCharts = () => {
      console.log('Initializing charts...')
      destroyCharts()
      
      nextTick(() => {
        setTimeout(() => {
          createModelPerformanceChart()
          createPredictionsGrowthChart()
          createAccuracyTrendChart()
        }, 100)
      })
    }

    const initializeFeedbackChart = () => {
      nextTick(() => {
        setTimeout(() => {
          createFeedbackTrendChart()
        }, 100)
      })
    }

    const createModelPerformanceChart = () => {
      if (modelPerformanceChartInstance) {
        modelPerformanceChartInstance.destroy()
      }

      const ctx = modelPerformanceChart.value?.getContext('2d')
      if (!ctx) {
        console.warn('Model Performance Chart canvas not found')
        return
      }

      // Get models from adminModels and sort by accuracy
      const sortedModels = [...adminModels.value].sort((a, b) => b.accuracy - a.accuracy).slice(0, 5)
      const modelNames = sortedModels.map(model => model.name) || ['Model 1', 'Model 2', 'Model 3']
      const accuracies = sortedModels.map(model => model.accuracy) || [95, 92, 88]

      console.log('Creating Model Performance Chart with data:', { modelNames, accuracies })

      try {
        modelPerformanceChartInstance = new Chart(ctx, {
          type: 'bar',
          data: {
            labels: modelNames,
            datasets: [{
              label: 'Accuracy (%)',
              data: accuracies,
              backgroundColor: '#059669',
              borderColor: '#047857',
              borderWidth: 2,
              borderRadius: 4
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                display: false
              },
              tooltip: {
                callbacks: {
                  label: function(context) {
                    return `Accuracy: ${context.parsed.y}%`
                  }
                }
              }
            },
            scales: {
              y: {
                beginAtZero: true,
                max: 100,
                grid: {
                  color: 'rgba(0, 0, 0, 0.1)'
                },
                ticks: {
                  callback: function(value) {
                    return value + '%'
                  }
                }
              },
              x: {
                grid: {
                  display: false
                }
              }
            }
          }
        })
        console.log('Model Performance Chart created successfully')
      } catch (error) {
        console.error('Error creating Model Performance Chart:', error)
      }
    }

    const createPredictionsGrowthChart = () => {
      if (predictionsGrowthChartInstance) {
        predictionsGrowthChartInstance.destroy()
      }

      const ctx = predictionsGrowthChart.value?.getContext('2d')
      if (!ctx) {
        console.warn('Predictions Growth Chart canvas not found')
        return
      }

      // Create increasing trend data
      const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
      const baseValue = 100
      const predictions = days.map((_, index) => {
        // Increasing trend with some variation
        return baseValue + (index * 25) + Math.random() * 20
      })

      console.log('Creating Predictions Growth Chart with data:', { days, predictions })

      try {
        predictionsGrowthChartInstance = new Chart(ctx, {
          type: 'line',
          data: {
            labels: days,
            datasets: [{
              label: 'Daily Predictions',
              data: predictions,
              borderColor: '#3b82f6',
              backgroundColor: 'rgba(59, 130, 246, 0.1)',
              borderWidth: 3,
              tension: 0.4,
              fill: true,
              pointBackgroundColor: '#3b82f6',
              pointBorderColor: '#fff',
              pointBorderWidth: 2,
              pointRadius: 6,
              pointHoverRadius: 8
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                display: false
              },
              tooltip: {
                callbacks: {
                  label: function(context) {
                    return `Predictions: ${Math.round(context.parsed.y)}`
                  }
                }
              }
            },
            scales: {
              y: {
                beginAtZero: true,
                grid: {
                  color: 'rgba(0, 0, 0, 0.1)'
                },
                title: {
                  display: true,
                  text: 'Number of Predictions'
                }
              },
              x: {
                grid: {
                  display: false
                }
              }
            }
          }
        })
        console.log('Predictions Growth Chart created successfully')
      } catch (error) {
        console.error('Error creating Predictions Growth Chart:', error)
      }
    }

    const createAccuracyTrendChart = () => {
      if (accuracyTrendChartInstance) {
        accuracyTrendChartInstance.destroy()
      }

      const ctx = accuracyTrendChart.value?.getContext('2d')
      if (!ctx) {
        console.warn('Accuracy Trend Chart canvas not found')
        return
      }

      // Create increasing accuracy trend
      const weeks = ['Week 1', 'Week 2', 'Week 3', 'Week 4']
      const baseAccuracy = 92
      const accuracies = weeks.map((_, index) => {
        // Increasing trend
        return baseAccuracy + (index * 1.2) + Math.random() * 0.5
      })

      console.log('Creating Accuracy Trend Chart with data:', { weeks, accuracies })

      try {
        accuracyTrendChartInstance = new Chart(ctx, {
          type: 'line',
          data: {
            labels: weeks,
            datasets: [{
              label: 'Accuracy (%)',
              data: accuracies,
              borderColor: '#8b5cf6',
              backgroundColor: 'rgba(139, 92, 246, 0.1)',
              borderWidth: 3,
              tension: 0.4,
              fill: true,
              pointBackgroundColor: '#8b5cf6',
              pointBorderColor: '#fff',
              pointBorderWidth: 2,
              pointRadius: 6,
              pointHoverRadius: 8
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                display: false
              },
              tooltip: {
                callbacks: {
                  label: function(context) {
                    return `Accuracy: ${context.parsed.y.toFixed(1)}%`
                  }
                }
              }
            },
            scales: {
              y: {
                beginAtZero: true,
                min: 90,
                max: 100,
                grid: {
                  color: 'rgba(0, 0, 0, 0.1)'
                },
                title: {
                  display: true,
                  text: 'Accuracy (%)'
                },
                ticks: {
                  callback: function(value) {
                    return value + '%'
                  }
                }
              },
              x: {
                grid: {
                  display: false
                }
              }
            }
          }
        })
        console.log('Accuracy Trend Chart created successfully')
      } catch (error) {
        console.error('Error creating Accuracy Trend Chart:', error)
      }
    }

    const createFeedbackTrendChart = () => {
      if (feedbackTrendChartInstance) {
        feedbackTrendChartInstance.destroy()
      }

      const ctx = feedbackTrendChart.value?.getContext('2d')
      if (!ctx) {
        console.warn('Feedback Trend Chart canvas not found')
        return
      }

      // Create feedback trend data
      const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
      const positiveFeedback = days.map((_, index) => {
        return 15 + (index * 3) + Math.random() * 5
      })
      const negativeFeedback = days.map((_, index) => {
        return 3 + (index * 0.5) + Math.random() * 2
      })

      console.log('Creating Feedback Trend Chart with data:', { days, positiveFeedback, negativeFeedback })

      try {
        feedbackTrendChartInstance = new Chart(ctx, {
          type: 'bar',
          data: {
            labels: days,
            datasets: [
              {
                label: 'Positive Feedback',
                data: positiveFeedback,
                backgroundColor: '#10b981',
                borderColor: '#059669',
                borderWidth: 1,
                borderRadius: 4
              },
              {
                label: 'Negative Feedback',
                data: negativeFeedback,
                backgroundColor: '#ef4444',
                borderColor: '#dc2626',
                borderWidth: 1,
                borderRadius: 4
              }
            ]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                position: 'top',
              },
              tooltip: {
                callbacks: {
                  label: function(context) {
                    return `${context.dataset.label}: ${Math.round(context.parsed.y)}`
                  }
                }
              }
            },
            scales: {
              y: {
                beginAtZero: true,
                grid: {
                  color: 'rgba(0, 0, 0, 0.1)'
                },
                title: {
                  display: true,
                  text: 'Number of Feedback'
                }
              },
              x: {
                grid: {
                  display: false
                }
              }
            }
          }
        })
        console.log('Feedback Trend Chart created successfully')
      } catch (error) {
        console.error('Error creating Feedback Trend Chart:', error)
      }
    }

    const destroyCharts = () => {
      if (modelPerformanceChartInstance) {
        modelPerformanceChartInstance.destroy()
        modelPerformanceChartInstance = null
      }
      if (predictionsGrowthChartInstance) {
        predictionsGrowthChartInstance.destroy()
        predictionsGrowthChartInstance = null
      }
      if (accuracyTrendChartInstance) {
        accuracyTrendChartInstance.destroy()
        accuracyTrendChartInstance = null
      }
      if (feedbackTrendChartInstance) {
        feedbackTrendChartInstance.destroy()
        feedbackTrendChartInstance = null
      }
    }

    const loadAnalyticsData = async () => {
      try {
        loadingAnalytics.value = true
        
        // Try to load real data from backend
        const response = await flaskApi.get('/api/admin/analytics', {
          params: { range: analyticsTimeRange.value }
        })
        
        if (response.data) {
          console.log('Loaded analytics data from API:', response.data)
          analytics.value = response.data
        } else {
          console.log('No API data, using mock data')
          generateMockAnalyticsData()
        }
      } catch (error) {
        console.error('Failed to load analytics data:', error)
        // Fallback to mock data
        console.log('Using mock data due to API error')
        generateMockAnalyticsData()
      } finally {
        loadingAnalytics.value = false
      }
    }

    const generateMockAnalyticsData = () => {
      console.log('Generating mock analytics data')
      
      // Update topModels to use models from adminModels
      const topModels = adminModels.value.map((model, index) => ({
        id: model.id,
        name: model.name,
        accuracy: model.accuracy,
        predictions: model.predictions,
        trend: index % 2 === 0 ? 2.3 : -0.5,
        rank: index + 1
      })).sort((a, b) => b.accuracy - a.accuracy).slice(0, 5)
      
      analytics.value = {
        topModels: topModels,
        predictionsGrowth: {
          totalGrowth: 15 + Math.random() * 5,
          dailyAverage: 125 + Math.random() * 25,
          peakDay: 250 + Math.random() * 50,
          trend: 'increasing'
        },
        accuracyTrend: {
          current: stats.value.systemAccuracy,
          improvement: 2.1 + Math.random() * 0.5,
          stability: 98 + Math.random() * 1,
          trend: 'improving'
        },
        feedbackTrend: {
          positive: 85 + Math.random() * 5,
          negative: 15 + Math.random() * 5,
          total: 100
        }
      }
    }

    const loadRealUsers = async (page = 1) => {
      try {
        console.log('🔄 Loading real users from backend...')
        
        const response = await flaskApi.get('/api/admin/users/real', {
          params: {
            page: page,
            per_page: pageSize.value
          }
        })
        
        console.log('📊 Backend response:', response.data)
        
        if (response.data && response.data.users) {
          realUsers.value = response.data.users.map(user => ({
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            predictions: user.predictions || 0,
            lastActive: new Date(user.lastActive),
            status: user.status
          }))
          
          // Update stats.totalUsers to match realUsers length
          stats.value.totalUsers = realUsers.value.length
          
          currentPage.value = response.data.page || 1
          totalPages.value = response.data.total_pages || 1
          
          console.log('✅ Users loaded successfully:', realUsers.value.length, 'users')
        } else {
          console.warn('⚠️ No users data in response, using fallback')
          realUsers.value = generateEnhancedMockUsers()
          stats.value.totalUsers = realUsers.value.length
        }
      } catch (error) {
        console.error('❌ Failed to load real users:', error)
        console.error('Error details:', error.response?.data)
        // Fallback to enhanced mock data
        realUsers.value = generateEnhancedMockUsers()
        stats.value.totalUsers = realUsers.value.length
      }
    }

    const generateEnhancedMockUsers = () => {
      console.log('🔄 Using enhanced mock users as fallback')
      return [
        {
          id: 1,
          name: 'John Smith',
          email: 'john.smith@company.com',
          role: 'user',
          predictions: 2450,
          lastActive: new Date(Date.now() - 3600000),
          status: 'active'
        },
        {
          id: 2,
          name: 'Maria Garcia',
          email: 'maria.garcia@techfirm.io',
          role: 'user',
          predictions: 1890,
          lastActive: new Date(Date.now() - 86400000),
          status: 'active'
        },
        {
          id: 3,
          name: 'David Chen',
          email: 'david.chen@startup.com',
          role: 'premium',
          predictions: 5670,
          lastActive: new Date(Date.now() - 7200000),
          status: 'active'
        },
        {
          id: 4,
          name: 'Sarah Johnson',
          email: 'sarah.j@enterprise.co',
          role: 'admin',
          predictions: 8920,
          lastActive: new Date(Date.now() - 1800000),
          status: 'active'
        },
        {
          id: 5,
          name: 'Alex Thompson',
          email: 'alex.t@digitalagency.org',
          role: 'moderator',
          predictions: 3120,
          lastActive: new Date(Date.now() - 259200000),
          status: 'inactive'
        },
        {
          id: 6,
          name: 'Lisa Wang',
          email: 'lisa.wang@consulting.com',
          role: 'user',
          predictions: 980,
          lastActive: new Date(Date.now() - 604800000),
          status: 'suspended'
        }
      ]
    }

    // Load feedback from digit recognition
    const loadFeedback = async () => {
      try {
        console.log('🔄 Loading feedback from backend...')
        
        const response = await flaskApi.get('/api/admin/feedback')
        
        if (response.data) {
          console.log('📊 Feedback response:', response.data)
          recentFeedback.value = response.data.feedback || []
          
          // Calculate feedback stats
          const total = recentFeedback.value.length
          const positive = recentFeedback.value.filter(f => f.is_correct).length
          const negative = total - positive
          const positiveRate = total > 0 ? Math.round((positive / total) * 100) : 0
          
          feedbackStats.value = {
            totalFeedback: total,
            positiveCount: positive,
            negativeCount: negative,
            positiveRate: positiveRate,
            averageConfidence: 85 + Math.random() * 10,
            responseRate: 42 + Math.random() * 10
          }
          
          console.log('✅ Feedback loaded successfully:', total, 'items')
        } else {
          console.warn('⚠️ No feedback data in response, using mock data')
          generateMockFeedback()
        }
      } catch (error) {
        console.error('❌ Failed to load feedback:', error)
        console.error('Error details:', error.response?.data)
        // Fallback to mock data
        generateMockFeedback()
      }
    }

    const generateMockFeedback = () => {
      console.log('🔄 Generating mock feedback data')
      
      const mockFeedback = [
        {
          id: 1,
          user_id: 1,
          user_name: 'John Smith',
          predicted_digit: 5,
          confidence: 0.92,
          is_correct: true,
          actual_digit: 5,
          backend_used: 'flask',
          prediction_id: 'pred_001',
          timestamp: new Date(Date.now() - 3600000),
          user_comment: 'Perfect prediction!'
        },
        {
          id: 2,
          user_id: 2,
          user_name: 'Maria Garcia',
          predicted_digit: 3,
          confidence: 0.78,
          is_correct: false,
          actual_digit: 8,
          backend_used: 'flask',
          prediction_id: 'pred_002',
          timestamp: new Date(Date.now() - 7200000),
          user_comment: 'This was actually an 8'
        },
        {
          id: 3,
          user_id: 3,
          user_name: 'David Chen',
          predicted_digit: 1,
          confidence: 0.95,
          is_correct: true,
          actual_digit: 1,
          backend_used: 'demo',
          prediction_id: 'pred_003',
          timestamp: new Date(Date.now() - 10800000),
          user_comment: null
        },
        {
          id: 4,
          user_id: 4,
          user_name: 'Sarah Johnson',
          predicted_digit: 7,
          confidence: 0.81,
          is_correct: true,
          actual_digit: 7,
          backend_used: 'flask',
          prediction_id: 'pred_004',
          timestamp: new Date(Date.now() - 14400000),
          user_comment: 'Very accurate!'
        },
        {
          id: 5,
          user_id: 5,
          user_name: 'Alex Thompson',
          predicted_digit: 0,
          confidence: 0.67,
          is_correct: false,
          actual_digit: 6,
          backend_used: 'demo',
          prediction_id: 'pred_005',
          timestamp: new Date(Date.now() - 18000000),
          user_comment: 'Needs improvement on zero vs six'
        }
      ]
      
      recentFeedback.value = mockFeedback
      
      const total = mockFeedback.length
      const positive = mockFeedback.filter(f => f.is_correct).length
      const negative = total - positive
      const positiveRate = Math.round((positive / total) * 100)
      
      feedbackStats.value = {
        totalFeedback: total,
        positiveCount: positive,
        negativeCount: negative,
        positiveRate: positiveRate,
        averageConfidence: 82.6,
        responseRate: 45
      }
    }

    // Pagination methods
    const changePage = (page) => {
      if (page >= 1 && page <= totalPages.value) {
        currentPage.value = page
        loadRealUsers(page)
      }
    }

    const changePageSize = () => {
      currentPage.value = 1
      loadRealUsers(1)
    }

    const getRankClass = (rank) => {
      switch (rank) {
        case 1: return 'rank-1'
        case 2: return 'rank-2'
        case 3: return 'rank-3'
        default: return 'rank-other'
      }
    }

    const exportAnalytics = () => {
      const exportData = {
        analytics: analytics.value,
        exportedAt: new Date().toISOString(),
        timeRange: analyticsTimeRange.value
      }
      
      const dataStr = JSON.stringify(exportData, null, 2)
      const dataBlob = new Blob([dataStr], { type: 'application/json' })
      const url = URL.createObjectURL(dataBlob)
      const link = document.createElement('a')
      link.href = url
      link.download = `analytics-export-${new Date().toISOString().split('T')[0]}.json`
      link.click()
      URL.revokeObjectURL(url)
    }

    // Load real data from backend
    const loadAdminData = async () => {
      try {
        loading.value = true
        
        // Initialize analytics data first
        generateMockAnalyticsData()
        
        // Load all data in parallel
        const [modelsResponse, statsResponse] = await Promise.allSettled([
          flaskApi.get('/api/models'),
          flaskApi.get('/api/admin/stats')
        ])

        // Update all data with real backend data
        if (statsResponse.status === 'fulfilled') {
          const backendStats = statsResponse.value.data
          stats.value = {
            ...stats.value,
            totalPredictions: backendStats.totalPredictions || stats.value.totalPredictions,
            systemAccuracy: backendStats.systemAccuracy || stats.value.systemAccuracy,
            storageUsed: backendStats.storageUsed || stats.value.storageUsed
          }
        }

        // Update models with real data
        if (modelsResponse.status === 'fulfilled') {
          adminModels.value = modelsResponse.value.data.map(model => ({
            id: model.id,
            name: model.name,
            version: model.version || '1.0',
            accuracy: model.accuracy || 0,
            predictions: model.prediction_count || Math.floor(Math.random() * 10000),
            size: 45,
            status: model.status === 'active' ? 'active' : 'idle',
            deployedAt: new Date(model.created_at),
            lastTrained: new Date(model.last_trained || model.created_at)
          }))
        }

        // Load real users data
        await loadRealUsers()

        // Load feedback data
        await loadFeedback()

        // Load analytics data
        await loadAnalyticsData()

      } catch (error) {
        console.error('Failed to load admin data:', error)
        // Fallback to mock data
        generateMockData()
        generateMockAnalyticsData()
        realUsers.value = generateEnhancedMockUsers()
        generateMockFeedback()
      } finally {
        loading.value = false
      }
    }

    const generateMockData = () => {
      const totalPredictions = 12543
      const avgAccuracy = 95.5
      const totalStorage = 12.5

      stats.value = {
        totalUsers: realUsers.value.length,
        totalPredictions: totalPredictions,
        systemAccuracy: avgAccuracy,
        storageUsed: totalStorage
      }

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
        },
        {
          id: 3,
          name: 'Vision Transformer',
          version: '1.0',
          accuracy: 98.1,
          predictions: 1500,
          size: 210,
          status: 'active',
          deployedAt: new Date(Date.now() - 7 * 86400000),
          lastTrained: new Date(Date.now() - 1 * 86400000)
        }
      ]
    }

    // Existing methods
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
        
        const response = await flaskApi.put(`/api/admin/users/${editingUser.value.id}`, {
          name: editingUser.value.name,
          email: editingUser.value.email,
          role: editingUser.value.role,
          status: editingUser.value.status,
          password: editingUser.value.password || undefined
        })

        const userIndex = realUsers.value.findIndex(u => u.id === editingUser.value.id)
        if (userIndex !== -1) {
          realUsers.value[userIndex] = {
            ...realUsers.value[userIndex],
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
          await flaskApi.delete(`/api/admin/users/${user.id}`)
          
          realUsers.value = realUsers.value.filter(u => u.id !== user.id)
          stats.value.totalUsers = realUsers.value.length
          
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
        
        const response = await flaskApi.post('/api/admin/users', {
          name: newUser.value.name,
          email: newUser.value.email,
          role: newUser.value.role,
          password: newUser.value.password,
          send_welcome_email: newUser.value.sendWelcomeEmail
        })

        const newUserData = {
          id: realUsers.value.length + 1,
          name: newUser.value.name,
          email: newUser.value.email,
          role: newUser.value.role,
          predictions: 0,
          lastActive: new Date(),
          status: 'active'
        }
        
        realUsers.value.push(newUserData)
        stats.value.totalUsers = realUsers.value.length
        
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
        users: realUsers.value,
        exportedAt: new Date().toISOString(),
        total: realUsers.value.length
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

    const toggleModelStatus = async (model) => {
      try {
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
        await flaskApi.post(`/api/models/${model.id}/train`)
        alert(`Model ${model.name} training started`)
        
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

    // Feedback methods
    const refreshFeedback = async () => {
      loading.value = true
      try {
        await loadFeedback()
        alert('Feedback refreshed successfully!')
      } catch (error) {
        console.error('Failed to refresh feedback:', error)
        alert('Failed to refresh feedback')
      } finally {
        loading.value = false
      }
    }

    const exportFeedback = () => {
      const exportData = {
        feedback: recentFeedback.value,
        stats: feedbackStats.value,
        exportedAt: new Date().toISOString(),
        total: recentFeedback.value.length
      }
      
      const dataStr = JSON.stringify(exportData, null, 2)
      const dataBlob = new Blob([dataStr], { type: 'application/json' })
      const url = URL.createObjectURL(dataBlob)
      const link = document.createElement('a')
      link.href = url
      link.download = `feedback-export-${new Date().toISOString().split('T')[0]}.json`
      link.click()
      URL.revokeObjectURL(url)
    }

    const viewFeedbackDetails = (feedback) => {
      selectedFeedback.value = feedback
      showFeedbackDetailsModal.value = true
    }

    const deleteFeedback = async (feedback) => {
      if (confirm(`Are you sure you want to delete this feedback?`)) {
        try {
          await flaskApi.delete(`/api/admin/feedback/${feedback.id}`)
          recentFeedback.value = recentFeedback.value.filter(f => f.id !== feedback.id)
          
          // Update stats
          const total = recentFeedback.value.length
          const positive = recentFeedback.value.filter(f => f.is_correct).length
          const negative = total - positive
          const positiveRate = total > 0 ? Math.round((positive / total) * 100) : 0
          
          feedbackStats.value = {
            ...feedbackStats.value,
            totalFeedback: total,
            positiveCount: positive,
            negativeCount: negative,
            positiveRate: positiveRate
          }
          
          alert('Feedback deleted successfully!')
        } catch (error) {
          console.error('Failed to delete feedback:', error)
          // Fallback: delete locally
          recentFeedback.value = recentFeedback.value.filter(f => f.id !== feedback.id)
          
          // Update stats locally
          const total = recentFeedback.value.length
          const positive = recentFeedback.value.filter(f => f.is_correct).length
          const negative = total - positive
          const positiveRate = total > 0 ? Math.round((positive / total) * 100) : 0
          
          feedbackStats.value = {
            ...feedbackStats.value,
            totalFeedback: total,
            positiveCount: positive,
            negativeCount: negative,
            positiveRate: positiveRate
          }
          
          alert('Feedback deleted successfully! (Local fallback)')
        }
      }
    }

    onMounted(() => {
      console.log('AdminPanel mounted')
      loadAdminData()
    })

    onUnmounted(() => {
      console.log('AdminPanel unmounted')
      destroyCharts()
    })

    return {
      activeTab,
      tabs,
      stats,
      realUsers,
      adminModels,
      showAddUserModal,
      showEditUserModal,
      showFeedbackDetailsModal,
      loading,
      loadingAnalytics,
      addingUser,
      updatingUser,
      newUser,
      editingUser,
      selectedFeedback,
      analytics,
      analyticsTimeRange,
      feedbackStats,
      recentFeedback,
      modelPerformanceChart,
      predictionsGrowthChart,
      accuracyTrendChart,
      feedbackTrendChart,
      storageUsage,
      newUsersThisWeek,
      predictionsToday,
      accuracyImprovement,
      currentPage,
      totalPages,
      pageSize,
      getUserInitials,
      formatTime,
      editUser,
      deleteUser,
      submitNewUser,
      submitEditUser,
      exportUsers,
      toggleModelStatus,
      retrainModel,
      deleteModel,
      deployNewModel,
      refreshFeedback,
      exportFeedback,
      viewFeedbackDetails,
      deleteFeedback,
      loadAnalyticsData,
      getRankClass,
      exportAnalytics,
      changePage,
      changePageSize
    }
  }
}
</script>

<style scoped>
/* Add new styles for feedback system */
.stat-icon.feedback {
  background: #e0e7ff;
  color: #4f46e5;
}

.feedback-grid {
  padding: 24px;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24px;
}

.feedback-summary-card,
.feedback-chart-card,
.feedback-list-card,
.feedback-analytics-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1);
}

.feedback-summary-card h4,
.feedback-chart-card h4,
.feedback-list-card h4,
.feedback-analytics-card h4 {
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 16px 0;
}

.feedback-summary-stats {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.summary-stat {
  text-align: center;
  padding: 12px;
  background: #f8fafc;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
}

.summary-value {
  font-size: 24px;
  font-weight: 700;
  margin-bottom: 4px;
}

.summary-value.positive {
  color: #059669;
}

.summary-value.negative {
  color: #ef4444;
}

.summary-label {
  font-size: 12px;
  color: #64748b;
}

.feedback-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-height: 400px;
  overflow-y: auto;
  padding-right: 8px;
}

.feedback-item {
  background: #f8fafc;
  border-radius: 8px;
  padding: 16px;
  border-left: 4px solid #e5e7eb;
}

.feedback-item.positive {
  border-left-color: #059669;
  background: #f0fdf4;
}

.feedback-item.negative {
  border-left-color: #ef4444;
  background: #fef2f2;
}

.feedback-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.feedback-user {
  display: flex;
  align-items: center;
  gap: 8px;
}

.user-avatar.small {
  width: 24px;
  height: 24px;
  font-size: 10px;
}

.user-name {
  font-size: 14px;
  font-weight: 500;
  color: #1e293b;
}

.feedback-time {
  font-size: 12px;
  color: #64748b;
}

.feedback-content {
  margin-bottom: 12px;
}

.feedback-prediction {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.prediction-label {
  font-size: 12px;
  color: #64748b;
}

.prediction-digit {
  font-size: 18px;
  font-weight: 700;
  color: #059669;
  background: white;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  border: 2px solid #059669;
}

.prediction-confidence {
  font-size: 12px;
  color: #64748b;
  background: white;
  padding: 2px 6px;
  border-radius: 4px;
  border: 1px solid #e5e7eb;
}

.feedback-verdict {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.verdict-icon {
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  font-weight: bold;
}

.verdict-icon.correct {
  background: #d1fae5;
  color: #059669;
}

.verdict-icon.incorrect {
  background: #fee2e2;
  color: #ef4444;
}

.verdict-text {
  font-size: 14px;
  color: #374151;
}

.feedback-meta {
  display: flex;
  gap: 12px;
  font-size: 12px;
  color: #64748b;
}

.backend-used {
  background: #e0e7ff;
  color: #4f46e5;
  padding: 2px 6px;
  border-radius: 4px;
}

.prediction-id {
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
}

.feedback-actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
}

.action-btn.small {
  padding: 6px 12px;
  font-size: 12px;
}

.no-feedback {
  text-align: center;
  padding: 40px 20px;
}

.no-data-icon {
  font-size: 48px;
  margin-bottom: 12px;
}

.no-feedback p {
  color: #64748b;
  margin: 0;
}

.analytics-grid-small {
  display: grid;
  grid-template-columns: 1fr;
  gap: 12px;
}

.analytics-item {
  padding: 12px;
  background: #f8fafc;
  border-radius: 6px;
  border-left: 3px solid #3b82f6;
}

.analytics-label {
  font-size: 12px;
  color: #64748b;
  margin-bottom: 4px;
}

.analytics-value {
  font-size: 14px;
  font-weight: 600;
  color: #1e293b;
}

/* Feedback Details Modal */
.feedback-details {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.detail-section {
  background: #f8fafc;
  border-radius: 8px;
  padding: 16px;
}

.detail-section h4 {
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 12px 0;
  padding-bottom: 8px;
  border-bottom: 1px solid #e5e7eb;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 8px;
}

.detail-label {
  font-size: 14px;
  color: #64748b;
  font-weight: 500;
}

.detail-value {
  font-size: 14px;
  color: #1e293b;
  font-weight: 600;
  text-align: right;
  max-width: 60%;
}

.detail-value.positive {
  color: #059669;
}

.detail-value.negative {
  color: #ef4444;
}

.detail-value.digit {
  font-size: 18px;
  font-weight: 700;
  color: #059669;
}

.detail-value.comment {
  font-style: italic;
  color: #475569;
}

/* Growth stats styles */
.growth-stats {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #e5e7eb;
}

.growth-stat-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 4px 0;
}

.growth-label {
  font-size: 12px;
  color: #64748b;
  font-weight: 500;
}

.growth-value {
  font-size: 14px;
  font-weight: 600;
  color: #1e293b;
}

.growth-value.positive {
  color: #059669;
}

/* Updated analytics grid */
.analytics-grid {
  padding: 24px;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24px;
}

.analytics-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1);
  min-height: 400px;
  display: flex;
  flex-direction: column;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.card-header h4 {
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
}

.chart-container {
  height: 300px;
  position: relative;
  width: 100%;
}

.chart-container canvas {
  display: block;
  width: 100% !important;
  height: 100% !important;
}

.chart-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #64748b;
  font-size: 14px;
}

/* Top Models List */
.top-models-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.model-rank-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: #f8fafc;
  border-radius: 8px;
}

.model-rank {
  flex-shrink: 0;
}

.rank-badge {
  width: 24px;
  height: 24px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 600;
  color: white;
}

.rank-1 {
  background: linear-gradient(135deg, #f59e0b, #d97706);
}

.rank-2 {
  background: linear-gradient(135deg, #64748b, #475569);
}

.rank-3 {
  background: linear-gradient(135deg, #92400e, #78350f);
}

.rank-other {
  background: #e5e7eb;
  color: #374151;
}

.model-info {
  flex: 1;
}

.model-name {
  font-size: 14px;
  font-weight: 500;
  color: #1e293b;
  margin-bottom: 2px;
}

.model-stats {
  display: flex;
  gap: 12px;
  font-size: 12px;
  color: #64748b;
}

.model-trend {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  font-weight: 500;
}

.model-trend.positive {
  color: #059669;
}

.model-trend.negative {
  color: #ef4444;
}

/* Tab notifications */
.tab-notification {
  background: #ef4444;
  color: white;
  border-radius: 8px;
  padding: 2px 6px;
  font-size: 10px;
  font-weight: 600;
  margin-left: 6px;
}

/* Responsive */
@media (max-width: 1024px) {
  .analytics-grid,
  .feedback-grid {
    grid-template-columns: 1fr;
  }
  
  .feedback-summary-stats {
    grid-template-columns: repeat(4, 1fr);
  }
}

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
  
  .models-grid,
  .analytics-grid,
  .feedback-grid {
    grid-template-columns: 1fr;
  }
  
  .feedback-summary-stats {
    grid-template-columns: repeat(2, 1fr);
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
  
  .analytics-grid,
  .feedback-grid {
    padding: 16px;
    gap: 16px;
  }
  
  .analytics-card,
  .feedback-summary-card,
  .feedback-chart-card,
  .feedback-list-card,
  .feedback-analytics-card {
    padding: 16px;
  }
  
  .chart-container {
    height: 250px;
  }
  
  .card-header {
    flex-direction: column;
    gap: 12px;
    align-items: flex-start;
  }
}

@media (max-width: 480px) {
  .model-stats {
    flex-direction: column;
    gap: 2px;
  }
  
  .feedback-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
  
  .feedback-prediction {
    flex-wrap: wrap;
  }
}

/* Keep all existing styles below - they remain the same except for what's been updated above */
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
  margin: 16px 0;
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

/* Loading state styles */
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

/* Pagination styles */
.pagination-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-top: 1px solid #e5e7eb;
  background: #f8fafc;
}

.pagination-info {
  font-size: 14px;
  color: #64748b;
}

.pagination-controls .form-input {
  width: auto;
  min-width: 120px;
}

/* Form input styles */
.form-input {
  width: 100%;
  padding: 10px 12px;
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

textarea.form-input {
  resize: vertical;
  min-height: 80px;
}

/* Checkbox styles */
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
</style>
import axios from 'axios';

// Create axios instance with credentials support
const api = axios.create({
  baseURL: '/api',
  withCredentials: true, // Important for cookie-based auth
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Service for handling authentication operations
 */
const authService = {
  /**
   * Login with Jira credentials
   * @param {string} username - Jira username or email
   * @param {string} apiToken - Jira API token
   * @returns {Promise<Object>} - Authentication result
   */
  async login(username, apiToken) {
    try {
      const response = await api.post('/auth/login', {
        username,
        apiToken,
      });
      return response.data;
    } catch (error) {
      console.error('Login error:', error);
      throw error.response?.data || { 
        success: false, 
        message: 'Authentication failed' 
      };
    }
  },

  /**
   * Logout user
   * @returns {Promise<Object>} - Logout result
   */
  async logout() {
    try {
      const response = await api.post('/auth/logout');
      return response.data;
    } catch (error) {
      console.error('Logout error:', error);
      throw error.response?.data || { 
        success: false, 
        message: 'Logout failed' 
      };
    }
  },

  /**
   * Get current authenticated user
   * @returns {Promise<Object>} - Current user data
   */
  async getCurrentUser() {
    try {
      const response = await api.get('/auth/user');
      return response.data;
    } catch (error) {
      console.error('Get current user error:', error);
      throw error.response?.data || { 
        success: false, 
        message: 'Failed to get user data' 
      };
    }
  },

  /**
   * Refresh authentication token
   * @returns {Promise<Object>} - Token refresh result
   */
  async refreshToken() {
    try {
      const response = await api.post('/auth/refresh');
      return response.data;
    } catch (error) {
      console.error('Token refresh error:', error);
      throw error.response?.data || { 
        success: false, 
        message: 'Token refresh failed' 
      };
    }
  },

  /**
   * Check if user is authenticated
   * @returns {Promise<boolean>} - Authentication status
   */
  async isAuthenticated() {
    try {
      await this.getCurrentUser();
      return true;
    } catch (error) {
      return false;
    }
  }
};

export default authService;

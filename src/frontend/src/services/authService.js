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
 * Service for handling authentication operations with OAuth 2.0
 */
const authService = {
  /**
   * Get the login URL for OAuth 2.0 flow
   * @returns {string} - Login URL
   */
  getLoginUrl() {
    return '/api/auth/login';
  },

  /**
   * Initiate OAuth login by redirecting to Jira
   */
  initiateLogin() {
    // Redirect to the OAuth login endpoint
    window.location.href = this.getLoginUrl();
  },

  /**
   * Logout user
   */
  logout() {
    // Redirect to the logout endpoint
    window.location.href = '/api/auth/logout';
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

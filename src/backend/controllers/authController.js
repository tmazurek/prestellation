const jiraAuthService = require('../services/jiraAuthService');

/**
 * Controller for handling authentication requests
 */
const authController = {
  /**
   * Login with Jira credentials
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Object} - Authentication response
   */
  async login(req, res) {
    try {
      const { username, apiToken } = req.body;
      
      // Validate request body
      if (!username || !apiToken) {
        return res.status(400).json({
          success: false,
          message: 'Username and API token are required'
        });
      }
      
      // Authenticate with Jira
      const authResult = await jiraAuthService.authenticate(username, apiToken);
      
      if (authResult.success) {
        // Set token in HTTP-only cookie for security
        res.cookie('auth_token', authResult.token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          maxAge: 24 * 60 * 60 * 1000, // 24 hours
          sameSite: 'strict'
        });
        
        return res.status(200).json({
          success: true,
          message: 'Authentication successful',
          user: authResult.user
        });
      } else {
        return res.status(401).json({
          success: false,
          message: authResult.message || 'Authentication failed'
        });
      }
    } catch (error) {
      console.error('Login error:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  },
  
  /**
   * Logout user by clearing auth cookie
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Object} - Logout response
   */
  logout(req, res) {
    try {
      // Clear auth cookie
      res.clearCookie('auth_token');
      
      return res.status(200).json({
        success: true,
        message: 'Logout successful'
      });
    } catch (error) {
      console.error('Logout error:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  },
  
  /**
   * Refresh authentication token
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Object} - Token refresh response
   */
  refreshToken(req, res) {
    try {
      const token = req.cookies.auth_token;
      
      if (!token) {
        return res.status(401).json({
          success: false,
          message: 'No authentication token provided'
        });
      }
      
      // Refresh the token
      const refreshResult = jiraAuthService.refreshToken(token);
      
      if (refreshResult.success) {
        // Set new token in HTTP-only cookie
        res.cookie('auth_token', refreshResult.token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          maxAge: 24 * 60 * 60 * 1000, // 24 hours
          sameSite: 'strict'
        });
        
        return res.status(200).json({
          success: true,
          message: 'Token refreshed successfully'
        });
      } else {
        // Clear invalid token
        res.clearCookie('auth_token');
        
        return res.status(401).json({
          success: false,
          message: refreshResult.message || 'Token refresh failed'
        });
      }
    } catch (error) {
      console.error('Token refresh error:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  },
  
  /**
   * Get current authenticated user
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Object} - Current user response
   */
  getCurrentUser(req, res) {
    try {
      // User data is attached to request by auth middleware
      if (req.user) {
        return res.status(200).json({
          success: true,
          user: req.user
        });
      } else {
        return res.status(401).json({
          success: false,
          message: 'Not authenticated'
        });
      }
    } catch (error) {
      console.error('Get current user error:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  }
};

module.exports = authController;

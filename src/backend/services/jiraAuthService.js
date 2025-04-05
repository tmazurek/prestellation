const axios = require('axios');
const jwt = require('jsonwebtoken');

/**
 * Service for handling Jira authentication
 */
class JiraAuthService {
  constructor() {
    this.jiraApiUrl = process.env.JIRA_API_URL;
    this.jwtSecret = process.env.JWT_SECRET || 'prestellation-jwt-secret';
    this.tokenExpiration = process.env.TOKEN_EXPIRATION || '24h';
  }

  /**
   * Authenticate user with Jira credentials
   * @param {string} username - Jira username or email
   * @param {string} apiToken - Jira API token
   * @returns {Promise<Object>} - Authentication result with token
   */
  async authenticate(username, apiToken) {
    try {
      // Validate credentials by making a request to Jira API
      const authResult = await this.validateJiraCredentials(username, apiToken);
      
      if (authResult.isValid) {
        // Generate JWT token
        const token = this.generateToken({
          username,
          displayName: authResult.displayName,
          accountId: authResult.accountId
        });
        
        return {
          success: true,
          token,
          user: {
            username,
            displayName: authResult.displayName,
            accountId: authResult.accountId
          }
        };
      } else {
        return {
          success: false,
          message: 'Invalid Jira credentials'
        };
      }
    } catch (error) {
      console.error('Jira authentication error:', error.message);
      return {
        success: false,
        message: 'Authentication failed',
        error: error.message
      };
    }
  }

  /**
   * Validate Jira credentials by making a request to Jira API
   * @param {string} username - Jira username or email
   * @param {string} apiToken - Jira API token
   * @returns {Promise<Object>} - Validation result
   */
  async validateJiraCredentials(username, apiToken) {
    try {
      // Create base64 encoded credentials
      const auth = Buffer.from(`${username}:${apiToken}`).toString('base64');
      
      // Make a request to Jira API to get current user
      const response = await axios.get(`${this.jiraApiUrl}/rest/api/3/myself`, {
        headers: {
          'Authorization': `Basic ${auth}`,
          'Accept': 'application/json'
        }
      });
      
      // If request is successful, credentials are valid
      return {
        isValid: true,
        displayName: response.data.displayName,
        accountId: response.data.accountId
      };
    } catch (error) {
      console.error('Jira credential validation error:', error.message);
      return {
        isValid: false,
        error: error.message
      };
    }
  }

  /**
   * Generate JWT token
   * @param {Object} userData - User data to include in token
   * @returns {string} - JWT token
   */
  generateToken(userData) {
    return jwt.sign(userData, this.jwtSecret, {
      expiresIn: this.tokenExpiration
    });
  }

  /**
   * Verify JWT token
   * @param {string} token - JWT token to verify
   * @returns {Object} - Decoded token payload or error
   */
  verifyToken(token) {
    try {
      const decoded = jwt.verify(token, this.jwtSecret);
      return {
        valid: true,
        decoded
      };
    } catch (error) {
      return {
        valid: false,
        error: error.message
      };
    }
  }

  /**
   * Refresh JWT token
   * @param {string} token - Current JWT token
   * @returns {Object} - New token or error
   */
  refreshToken(token) {
    try {
      // Verify the current token
      const { valid, decoded, error } = this.verifyToken(token);
      
      if (!valid) {
        return {
          success: false,
          message: 'Invalid token',
          error
        };
      }
      
      // Generate a new token with the same user data
      const newToken = this.generateToken({
        username: decoded.username,
        displayName: decoded.displayName,
        accountId: decoded.accountId
      });
      
      return {
        success: true,
        token: newToken
      };
    } catch (error) {
      return {
        success: false,
        message: 'Token refresh failed',
        error: error.message
      };
    }
  }
}

module.exports = new JiraAuthService();

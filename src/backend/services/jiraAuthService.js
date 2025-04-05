const axios = require('axios');
const jwt = require('jsonwebtoken');
const querystring = require('querystring');

/**
 * Service for handling Jira authentication using OAuth 2.0
 */
class JiraAuthService {
  constructor() {
    this.jiraBaseUrl = process.env.JIRA_BASE_URL || 'https://auth.atlassian.com';
    this.jiraApiUrl = process.env.JIRA_API_URL;
    this.clientId = process.env.JIRA_CLIENT_ID;
    this.clientSecret = process.env.JIRA_CLIENT_SECRET;
    this.redirectUri = process.env.JIRA_REDIRECT_URI || `${process.env.BACKEND_URL}/api/auth/callback`;
    this.jwtSecret = process.env.JWT_SECRET || 'prestellation-jwt-secret';
    this.tokenExpiration = process.env.TOKEN_EXPIRATION || '24h';
    this.scopes = process.env.JIRA_SCOPES || 'read:jira-user read:jira-work offline_access';
  }

  /**
   * Get the OAuth 2.0 authorization URL
   * @returns {string} - Authorization URL
   */
  getAuthorizationUrl() {
    // For demo purposes, we'll use a mock URL that redirects back to our callback
    // with a fake code parameter
    if (process.env.NODE_ENV === 'production') {
      const params = {
        audience: 'api.atlassian.com',
        client_id: this.clientId,
        scope: this.scopes,
        redirect_uri: this.redirectUri,
        response_type: 'code',
        prompt: 'consent'
      };

      return `${this.jiraBaseUrl}/authorize?${querystring.stringify(params)}`;
    } else {
      // Mock URL for development/testing
      return `/api/auth/mock-oauth?redirect_uri=${encodeURIComponent(this.redirectUri)}`;
    }
  }

  /**
   * Exchange authorization code for access token
   * @param {string} code - Authorization code from callback
   * @returns {Promise<Object>} - Token response
   */
  async exchangeCodeForToken(code) {
    try {
      // Check if this is a mock code for development/testing
      if (code.startsWith('mock_auth_code_') && process.env.NODE_ENV !== 'production') {
        console.log('Using mock OAuth token for development');
        // Return mock token data
        return {
          success: true,
          access_token: 'mock_access_token_' + Date.now(),
          refresh_token: 'mock_refresh_token_' + Date.now(),
          expires_in: 3600, // 1 hour
          token_type: 'Bearer'
        };
      }

      // Real OAuth flow for production
      const response = await axios.post(`${this.jiraBaseUrl}/oauth/token`, {
        grant_type: 'authorization_code',
        client_id: this.clientId,
        client_secret: this.clientSecret,
        code,
        redirect_uri: this.redirectUri
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      return {
        success: true,
        ...response.data
      };
    } catch (error) {
      console.error('Token exchange error:', error.message);
      return {
        success: false,
        message: 'Failed to exchange code for token',
        error: error.response?.data || error.message
      };
    }
  }

  /**
   * Refresh OAuth access token
   * @param {string} refreshToken - OAuth refresh token
   * @returns {Promise<Object>} - New token response
   */
  async refreshAccessToken(refreshToken) {
    try {
      // Check if this is a mock token for development/testing
      if (refreshToken.startsWith('mock_refresh_token_') && process.env.NODE_ENV !== 'production') {
        console.log('Using mock token refresh for development');
        // Return mock token data
        return {
          success: true,
          access_token: 'mock_access_token_' + Date.now(),
          refresh_token: 'mock_refresh_token_' + Date.now(),
          expires_in: 3600, // 1 hour
          token_type: 'Bearer'
        };
      }

      // Real OAuth flow for production
      const response = await axios.post(`${this.jiraBaseUrl}/oauth/token`, {
        grant_type: 'refresh_token',
        client_id: this.clientId,
        client_secret: this.clientSecret,
        refresh_token: refreshToken
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      return {
        success: true,
        ...response.data
      };
    } catch (error) {
      console.error('Token refresh error:', error.message);
      return {
        success: false,
        message: 'Failed to refresh token',
        error: error.response?.data || error.message
      };
    }
  }

  /**
   * Get user information from Jira API
   * @param {string} accessToken - OAuth access token
   * @returns {Promise<Object>} - User information
   */
  async getUserInfo(accessToken) {
    try {
      // Check if this is a mock token for development/testing
      if (accessToken.startsWith('mock_access_token_') && process.env.NODE_ENV !== 'production') {
        console.log('Using mock user info for development');
        // Return mock user data
        return {
          success: true,
          user: {
            username: 'demo@example.com',
            displayName: 'Demo User',
            accountId: 'mock-account-id',
            avatarUrl: 'https://avatar-management--avatars.us-west-2.prod.public.atl-paas.net/default-avatar.png'
          }
        };
      }

      // Real API call for production
      const response = await axios.get(`${this.jiraApiUrl}/rest/api/3/myself`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Accept': 'application/json'
        }
      });

      return {
        success: true,
        user: {
          username: response.data.emailAddress,
          displayName: response.data.displayName,
          accountId: response.data.accountId,
          avatarUrl: response.data.avatarUrls?.['48x48']
        }
      };
    } catch (error) {
      console.error('Get user info error:', error.message);
      return {
        success: false,
        message: 'Failed to get user information',
        error: error.response?.data || error.message
      };
    }
  }

  /**
   * Generate JWT token for internal use
   * @param {Object} userData - User data to include in token
   * @param {Object} oauthTokens - OAuth tokens to include
   * @returns {string} - JWT token
   */
  generateToken(userData, oauthTokens) {
    return jwt.sign({
      user: userData,
      oauth: {
        access_token: oauthTokens.access_token,
        refresh_token: oauthTokens.refresh_token,
        expires_at: Date.now() + (oauthTokens.expires_in * 1000)
      }
    }, this.jwtSecret, {
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
   * Check if OAuth token is expired or about to expire
   * @param {number} expiresAt - Timestamp when token expires
   * @returns {boolean} - True if token needs refresh
   */
  needsRefresh(expiresAt) {
    // Refresh if token expires in less than 5 minutes
    const fiveMinutes = 5 * 60 * 1000;
    return Date.now() > (expiresAt - fiveMinutes);
  }

  /**
   * Refresh session token if needed
   * @param {string} token - Current JWT token
   * @returns {Promise<Object>} - New token or error
   */
  async refreshSessionToken(token) {
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

      // Check if OAuth token needs refresh
      if (this.needsRefresh(decoded.oauth.expires_at)) {
        // Refresh the OAuth token
        const refreshResult = await this.refreshAccessToken(decoded.oauth.refresh_token);

        if (!refreshResult.success) {
          return {
            success: false,
            message: 'Failed to refresh OAuth token',
            error: refreshResult.error
          };
        }

        // Generate a new session token with updated OAuth tokens
        const newToken = this.generateToken(decoded.user, {
          access_token: refreshResult.access_token,
          refresh_token: refreshResult.refresh_token || decoded.oauth.refresh_token,
          expires_in: refreshResult.expires_in
        });

        return {
          success: true,
          token: newToken,
          refreshed: true
        };
      }

      // Token doesn't need refresh yet
      return {
        success: true,
        token,
        refreshed: false
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

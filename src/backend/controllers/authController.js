const jiraAuthService = require('../services/jiraAuthService');

/**
 * Controller for handling authentication requests with OAuth 2.0
 */
const authController = {
  /**
   * Initiate OAuth login flow
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  login(req, res) {
    try {
      // Get the authorization URL
      const authUrl = jiraAuthService.getAuthorizationUrl();

      // Redirect the user to Jira's authorization page
      return res.redirect(authUrl);
    } catch (error) {
      console.error('OAuth initiation error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to initiate OAuth flow',
        error: error.message
      });
    }
  },

  /**
   * Handle OAuth callback from Jira
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Object} - Authentication response
   */
  async handleCallback(req, res) {
    try {
      const { code, error } = req.query;

      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

      // Check for errors in the callback
      if (error) {
        return res.redirect(`${frontendUrl}/login?error=${encodeURIComponent(error)}`);
      }

      if (!code) {
        return res.redirect(`${frontendUrl}/login?error=No authorization code received`);
      }

      // Exchange the code for an access token
      const tokenResult = await jiraAuthService.exchangeCodeForToken(code);

      if (!tokenResult.success) {
        return res.redirect(`${frontendUrl}/login?error=${encodeURIComponent(tokenResult.message)}`);
      }

      // Get user information using the access token
      const userResult = await jiraAuthService.getUserInfo(tokenResult.access_token);

      if (!userResult.success) {
        return res.redirect(`${frontendUrl}/login?error=${encodeURIComponent(userResult.message)}`);
      }

      // Generate a session token that includes both user info and OAuth tokens
      const sessionToken = jiraAuthService.generateToken(userResult.user, {
        access_token: tokenResult.access_token,
        refresh_token: tokenResult.refresh_token,
        expires_in: tokenResult.expires_in
      });

      // Set token in HTTP-only cookie for security
      res.cookie('auth_token', sessionToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
        sameSite: 'lax' // Changed to 'lax' to allow redirects from OAuth flow
      });

      // Redirect to the dashboard
      return res.redirect(`${frontendUrl}/`);
    } catch (error) {
      console.error('OAuth callback error:', error);
      return res.redirect(`${frontendUrl}/login?error=${encodeURIComponent('Authentication failed')}`);
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
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

      // Clear auth cookie
      res.clearCookie('auth_token');

      // Redirect to login page
      return res.redirect(`${frontendUrl}/login`);
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
  async refreshToken(req, res) {
    try {
      const token = req.cookies.auth_token;

      if (!token) {
        return res.status(401).json({
          success: false,
          message: 'No authentication token provided'
        });
      }

      // Refresh the token if needed
      const refreshResult = await jiraAuthService.refreshSessionToken(token);

      if (refreshResult.success) {
        // Only set a new cookie if the token was actually refreshed
        if (refreshResult.refreshed) {
          res.cookie('auth_token', refreshResult.token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 24 * 60 * 60 * 1000, // 24 hours
            sameSite: 'lax'
          });
        }

        return res.status(200).json({
          success: true,
          message: refreshResult.refreshed ? 'Token refreshed successfully' : 'Token is still valid'
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

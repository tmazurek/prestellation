const jiraAuthService = require('../services/jiraAuthService');

/**
 * Middleware to verify JWT token and attach user to request
 * Also handles token refresh if needed
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const authenticateToken = async (req, res, next) => {
  try {
    // Get token from cookie
    const token = req.cookies.auth_token;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    // Verify token and refresh if needed
    const refreshResult = await jiraAuthService.refreshSessionToken(token);

    if (!refreshResult.success) {
      // Clear invalid token
      res.clearCookie('auth_token');

      return res.status(401).json({
        success: false,
        message: 'Invalid or expired token'
      });
    }

    // Set new token in cookie if it was refreshed
    if (refreshResult.refreshed) {
      res.cookie('auth_token', refreshResult.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
        sameSite: 'lax'
      });
    }

    // Verify the token (either the original or the refreshed one)
    const verificationResult = jiraAuthService.verifyToken(refreshResult.token);

    if (verificationResult.valid) {
      // Attach user data to request
      req.user = verificationResult.decoded.user;
      req.oauth = verificationResult.decoded.oauth;
      next();
    } else {
      // This should not happen since we just refreshed the token
      res.clearCookie('auth_token');

      return res.status(401).json({
        success: false,
        message: 'Invalid token after refresh'
      });
    }
  } catch (error) {
    console.error('Authentication middleware error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

/**
 * Optional authentication middleware that doesn't block requests
 * Also handles token refresh if needed
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const optionalAuthentication = async (req, res, next) => {
  try {
    // Get token from cookie
    const token = req.cookies.auth_token;

    if (token) {
      // Try to refresh the token if needed
      try {
        const refreshResult = await jiraAuthService.refreshSessionToken(token);

        if (refreshResult.success) {
          // Set new token in cookie if it was refreshed
          if (refreshResult.refreshed) {
            res.cookie('auth_token', refreshResult.token, {
              httpOnly: true,
              secure: process.env.NODE_ENV === 'production',
              maxAge: 24 * 60 * 60 * 1000, // 24 hours
              sameSite: 'lax'
            });
          }

          // Verify the token
          const verificationResult = jiraAuthService.verifyToken(refreshResult.token);

          if (verificationResult.valid) {
            // Attach user data to request
            req.user = verificationResult.decoded.user;
            req.oauth = verificationResult.decoded.oauth;
          }
        } else {
          // Clear invalid token
          res.clearCookie('auth_token');
        }
      } catch (err) {
        // Clear token on error
        res.clearCookie('auth_token');
        console.error('Token refresh error in optional auth:', err);
      }
    }

    // Continue regardless of authentication status
    next();
  } catch (error) {
    console.error('Optional authentication middleware error:', error);
    // Continue without authentication
    next();
  }
};

module.exports = {
  authenticateToken,
  optionalAuthentication
};

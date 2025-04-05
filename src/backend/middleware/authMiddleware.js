const jiraAuthService = require('../services/jiraAuthService');

/**
 * Middleware to verify JWT token and attach user to request
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const authenticateToken = (req, res, next) => {
  try {
    // Get token from cookie
    const token = req.cookies.auth_token;
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }
    
    // Verify token
    const verificationResult = jiraAuthService.verifyToken(token);
    
    if (verificationResult.valid) {
      // Attach user data to request
      req.user = verificationResult.decoded;
      next();
    } else {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired token'
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
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const optionalAuthentication = (req, res, next) => {
  try {
    // Get token from cookie
    const token = req.cookies.auth_token;
    
    if (token) {
      // Verify token
      const verificationResult = jiraAuthService.verifyToken(token);
      
      if (verificationResult.valid) {
        // Attach user data to request
        req.user = verificationResult.decoded;
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

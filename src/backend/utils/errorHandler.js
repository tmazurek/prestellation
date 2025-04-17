/**
 * Utility functions for handling errors
 */

/**
 * Create a standardized API error response
 * @param {Error} error - Error object
 * @param {string} defaultMessage - Default error message
 * @returns {Object} - Standardized error response
 */
function createErrorResponse(error, defaultMessage = 'An unexpected error occurred') {
  // Get status code from error if available
  const statusCode = error.statusCode || error.response?.status || 500;
  
  // Get error message
  let message = error.message || defaultMessage;
  
  // For Axios errors, try to get more specific error message
  if (error.response?.data) {
    if (typeof error.response.data === 'string') {
      message = error.response.data;
    } else if (error.response.data.message) {
      message = error.response.data.message;
    } else if (error.response.data.error) {
      message = error.response.data.error;
    }
  }
  
  // Create error response object
  const errorResponse = {
    success: false,
    error: {
      message,
      code: statusCode
    }
  };
  
  // Add stack trace in development mode
  if (process.env.NODE_ENV === 'development') {
    errorResponse.error.stack = error.stack;
    
    // Add additional details for Axios errors
    if (error.response) {
      errorResponse.error.details = {
        data: error.response.data,
        status: error.response.status,
        headers: error.response.headers
      };
    } else if (error.request) {
      errorResponse.error.details = {
        request: 'Request was made but no response was received'
      };
    }
  }
  
  return {
    statusCode,
    body: errorResponse
  };
}

/**
 * Handle API errors in Express middleware
 * @param {Error} error - Error object
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
function apiErrorHandler(error, req, res, next) {
  console.error('API Error:', error);
  
  const { statusCode, body } = createErrorResponse(error);
  
  res.status(statusCode).json(body);
}

/**
 * Create a try-catch wrapper for async route handlers
 * @param {Function} handler - Async route handler
 * @returns {Function} - Wrapped handler with error handling
 */
function asyncHandler(handler) {
  return async (req, res, next) => {
    try {
      await handler(req, res, next);
    } catch (error) {
      next(error);
    }
  };
}

/**
 * Create a user-friendly error message
 * @param {Error} error - Error object
 * @returns {string} - User-friendly error message
 */
function getUserFriendlyErrorMessage(error) {
  // Network errors
  if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
    return 'Unable to connect to Jira. Please check your network connection and try again.';
  }
  
  // Authentication errors
  if (error.response?.status === 401) {
    return 'Your Jira session has expired. Please log in again.';
  }
  
  // Permission errors
  if (error.response?.status === 403) {
    return 'You do not have permission to access this Jira resource.';
  }
  
  // Not found errors
  if (error.response?.status === 404) {
    return 'The requested Jira resource was not found.';
  }
  
  // Rate limiting
  if (error.response?.status === 429) {
    return 'Too many requests to Jira. Please try again later.';
  }
  
  // Server errors
  if (error.response?.status >= 500) {
    return 'Jira is experiencing issues. Please try again later.';
  }
  
  // Default message
  return error.message || 'An unexpected error occurred. Please try again.';
}

module.exports = {
  createErrorResponse,
  apiErrorHandler,
  asyncHandler,
  getUserFriendlyErrorMessage
};

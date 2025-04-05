const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateToken } = require('../middleware/authMiddleware');

/**
 * @route   GET /api/auth/login
 * @desc    Initiate OAuth 2.0 login flow
 * @access  Public
 */
router.get('/login', authController.login);

/**
 * @route   GET /api/auth/callback
 * @desc    Handle OAuth 2.0 callback from Jira
 * @access  Public
 */
router.get('/callback', authController.handleCallback);

/**
 * @route   GET /api/auth/logout
 * @desc    Logout user
 * @access  Public
 */
router.get('/logout', authController.logout);

/**
 * @route   POST /api/auth/refresh
 * @desc    Refresh authentication token
 * @access  Public (requires valid token in cookie)
 */
router.post('/refresh', authController.refreshToken);

/**
 * @route   GET /api/auth/user
 * @desc    Get current authenticated user
 * @access  Private
 */
router.get('/user', authenticateToken, authController.getCurrentUser);

/**
 * @route   GET /api/auth/mock-oauth
 * @desc    Mock OAuth 2.0 flow for development/testing
 * @access  Public
 */
router.get('/mock-oauth', (req, res) => {
  // Get the redirect URI from the query parameters
  const redirectUri = req.query.redirect_uri;

  if (!redirectUri) {
    return res.status(400).json({ error: 'Missing redirect_uri parameter' });
  }

  // Create a mock authorization code
  const mockCode = 'mock_auth_code_' + Date.now();

  // Redirect back to the callback URL with the mock code
  res.redirect(`${redirectUri}?code=${mockCode}`);
});

module.exports = router;

const request = require('supertest');
const app = require('../server');
const jiraAuthService = require('../services/jiraAuthService');

// Mock the jiraAuthService
jest.mock('../services/jiraAuthService');

describe('Authentication API', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  describe('POST /api/auth/login', () => {
    it('should return 400 if username or apiToken is missing', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({});
      
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Username and API token are required');
    });

    it('should return 401 if authentication fails', async () => {
      // Mock the authenticate method to return failure
      jiraAuthService.authenticate.mockResolvedValue({
        success: false,
        message: 'Invalid Jira credentials'
      });

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'test@example.com',
          apiToken: 'invalid-token'
        });
      
      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Invalid Jira credentials');
      expect(jiraAuthService.authenticate).toHaveBeenCalledWith('test@example.com', 'invalid-token');
    });

    it('should return 200 and set cookie if authentication succeeds', async () => {
      // Mock the authenticate method to return success
      jiraAuthService.authenticate.mockResolvedValue({
        success: true,
        token: 'mock-jwt-token',
        user: {
          username: 'test@example.com',
          displayName: 'Test User',
          accountId: 'user-123'
        }
      });

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'test@example.com',
          apiToken: 'valid-token'
        });
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Authentication successful');
      expect(response.body.user).toEqual({
        username: 'test@example.com',
        displayName: 'Test User',
        accountId: 'user-123'
      });
      
      // Check that the cookie was set
      expect(response.headers['set-cookie']).toBeDefined();
      expect(response.headers['set-cookie'][0]).toContain('auth_token');
      
      expect(jiraAuthService.authenticate).toHaveBeenCalledWith('test@example.com', 'valid-token');
    });
  });

  describe('POST /api/auth/logout', () => {
    it('should clear the auth cookie', async () => {
      const response = await request(app)
        .post('/api/auth/logout');
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Logout successful');
      
      // Check that the cookie was cleared
      expect(response.headers['set-cookie']).toBeDefined();
      expect(response.headers['set-cookie'][0]).toContain('auth_token=;');
    });
  });

  describe('GET /api/auth/user', () => {
    it('should return 401 if no token is provided', async () => {
      const response = await request(app)
        .get('/api/auth/user');
      
      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Authentication required');
    });

    it('should return user data if valid token is provided', async () => {
      // Mock the verifyToken method to return success
      jiraAuthService.verifyToken.mockReturnValue({
        valid: true,
        decoded: {
          username: 'test@example.com',
          displayName: 'Test User',
          accountId: 'user-123'
        }
      });

      const response = await request(app)
        .get('/api/auth/user')
        .set('Cookie', ['auth_token=valid-token']);
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.user).toEqual({
        username: 'test@example.com',
        displayName: 'Test User',
        accountId: 'user-123'
      });
      
      expect(jiraAuthService.verifyToken).toHaveBeenCalledWith('valid-token');
    });

    it('should return 401 if token is invalid', async () => {
      // Mock the verifyToken method to return failure
      jiraAuthService.verifyToken.mockReturnValue({
        valid: false,
        error: 'Invalid token'
      });

      const response = await request(app)
        .get('/api/auth/user')
        .set('Cookie', ['auth_token=invalid-token']);
      
      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Invalid or expired token');
      
      expect(jiraAuthService.verifyToken).toHaveBeenCalledWith('invalid-token');
    });
  });
});

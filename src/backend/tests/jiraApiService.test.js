const axios = require('axios');
const jiraApiService = require('../services/jiraApiService');
const cache = require('memory-cache');

// Mock axios
jest.mock('axios');

describe('JiraApiService', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    // Clear cache
    cache.clear();
  });

  describe('get', () => {
    it('should make a GET request with the correct parameters', async () => {
      // Mock axios.create().get
      const mockGet = jest.fn().mockResolvedValue({
        data: { id: '123', name: 'Test Project' }
      });
      axios.create.mockReturnValue({ get: mockGet });

      // Call the service
      const result = await jiraApiService.get('/project/TEST', {}, 'test-token', false);

      // Check the result
      expect(result).toEqual({ id: '123', name: 'Test Project' });
      
      // Check that axios was called correctly
      expect(mockGet).toHaveBeenCalledWith('/project/TEST', {
        params: {},
        headers: { 'Authorization': 'Bearer test-token' }
      });
    });

    it('should use cache when enabled', async () => {
      // Mock axios.create().get
      const mockGet = jest.fn().mockResolvedValue({
        data: { id: '123', name: 'Test Project' }
      });
      axios.create.mockReturnValue({ get: mockGet });

      // Call the service twice
      const result1 = await jiraApiService.get('/project/TEST', {}, 'test-token', true);
      const result2 = await jiraApiService.get('/project/TEST', {}, 'test-token', true);

      // Check the results
      expect(result1).toEqual({ id: '123', name: 'Test Project' });
      expect(result2).toEqual({ id: '123', name: 'Test Project' });
      
      // Check that axios was called only once
      expect(mockGet).toHaveBeenCalledTimes(1);
    });

    it('should handle errors correctly', async () => {
      // Mock axios.create().get to throw an error
      const mockError = new Error('API Error');
      mockError.response = { status: 500, data: { message: 'Server Error' } };
      
      const mockGet = jest.fn().mockRejectedValue(mockError);
      axios.create.mockReturnValue({ get: mockGet });

      // Call the service and expect it to throw
      await expect(jiraApiService.get('/project/TEST', {}, 'test-token', false))
        .rejects.toThrow('API Error');
    });
  });

  describe('post', () => {
    it('should make a POST request with the correct parameters', async () => {
      // Mock axios.create().post
      const mockPost = jest.fn().mockResolvedValue({
        data: { id: '123', name: 'Test Issue' }
      });
      axios.create.mockReturnValue({ post: mockPost });

      // Call the service
      const result = await jiraApiService.post('/issue', { summary: 'Test' }, 'test-token');

      // Check the result
      expect(result).toEqual({ id: '123', name: 'Test Issue' });
      
      // Check that axios was called correctly
      expect(mockPost).toHaveBeenCalledWith('/issue', { summary: 'Test' }, {
        headers: { 'Authorization': 'Bearer test-token' }
      });
    });
  });

  describe('clearCache', () => {
    it('should clear cache entries matching a pattern', async () => {
      // Mock axios.create().get
      const mockGet = jest.fn()
        .mockResolvedValueOnce({ data: { id: '123', name: 'Test Project 1' } })
        .mockResolvedValueOnce({ data: { id: '456', name: 'Test Project 2' } });
      
      axios.create.mockReturnValue({ get: mockGet });

      // Call the service to populate cache
      await jiraApiService.get('/project/TEST1', {}, 'test-token', true);
      await jiraApiService.get('/project/TEST2', {}, 'test-token', true);

      // Clear cache for TEST1
      jiraApiService.clearCache('TEST1');

      // Call the service again
      await jiraApiService.get('/project/TEST1', {}, 'test-token', true);
      await jiraApiService.get('/project/TEST2', {}, 'test-token', true);

      // Check that axios was called 3 times (2 initial calls + 1 after cache clear)
      expect(mockGet).toHaveBeenCalledTimes(3);
    });

    it('should clear all cache entries', async () => {
      // Mock axios.create().get
      const mockGet = jest.fn()
        .mockResolvedValue({ data: { id: '123', name: 'Test Project' } });
      
      axios.create.mockReturnValue({ get: mockGet });

      // Call the service to populate cache
      await jiraApiService.get('/project/TEST1', {}, 'test-token', true);
      await jiraApiService.get('/project/TEST2', {}, 'test-token', true);

      // Clear all cache
      jiraApiService.clearAllCache();

      // Call the service again
      await jiraApiService.get('/project/TEST1', {}, 'test-token', true);
      await jiraApiService.get('/project/TEST2', {}, 'test-token', true);

      // Check that axios was called 4 times (2 initial calls + 2 after cache clear)
      expect(mockGet).toHaveBeenCalledTimes(4);
    });
  });
});

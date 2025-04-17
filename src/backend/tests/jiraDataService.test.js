const jiraDataService = require('../services/jiraDataService');
const jiraApiService = require('../services/jiraApiService');

// Mock jiraApiService
jest.mock('../services/jiraApiService');

describe('JiraDataService', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  describe('getProjects', () => {
    it('should return a list of projects', async () => {
      // Mock jiraApiService.get
      const mockProjects = [
        { id: '1', key: 'PROJ1', name: 'Project 1' },
        { id: '2', key: 'PROJ2', name: 'Project 2' }
      ];
      
      jiraApiService.get.mockResolvedValue(mockProjects);

      // Call the service
      const result = await jiraDataService.getProjects('test-token');

      // Check the result
      expect(result).toEqual(mockProjects);
      
      // Check that jiraApiService was called correctly
      expect(jiraApiService.get).toHaveBeenCalledWith(
        '/project',
        expect.objectContaining({
          expand: 'description,lead,url',
          status: 'live'
        }),
        'test-token',
        true
      );
    });

    it('should handle errors correctly', async () => {
      // Mock jiraApiService.get to throw an error
      jiraApiService.get.mockRejectedValue(new Error('API Error'));

      // Call the service and expect it to throw
      await expect(jiraDataService.getProjects('test-token'))
        .rejects.toThrow('Failed to fetch Jira projects');
    });
  });

  describe('getProject', () => {
    it('should return a project by key', async () => {
      // Mock jiraApiService.get
      const mockProject = {
        id: '1',
        key: 'PROJ1',
        name: 'Project 1',
        issueTypes: [
          { id: '10000', name: 'Epic' },
          { id: '10001', name: 'Story' }
        ]
      };
      
      jiraApiService.get.mockResolvedValue(mockProject);

      // Call the service
      const result = await jiraDataService.getProject('PROJ1', 'test-token');

      // Check the result
      expect(result).toEqual(mockProject);
      
      // Check that jiraApiService was called correctly
      expect(jiraApiService.get).toHaveBeenCalledWith(
        '/project/PROJ1',
        expect.objectContaining({
          expand: 'description,lead,url,issueTypes,versions'
        }),
        'test-token',
        true
      );
    });
  });

  describe('getEpics', () => {
    it('should return epics for a project', async () => {
      // Mock jiraApiService.get for project
      const mockProject = {
        id: '1',
        key: 'PROJ1',
        name: 'Project 1',
        issueTypes: [
          { id: '10000', name: 'Epic' },
          { id: '10001', name: 'Story' }
        ]
      };
      
      // Mock jiraApiService.post for search
      const mockSearchResults = {
        issues: [
          { id: '1001', key: 'PROJ1-1', fields: { summary: 'Epic 1' } },
          { id: '1002', key: 'PROJ1-2', fields: { summary: 'Epic 2' } }
        ],
        total: 2,
        startAt: 0,
        maxResults: 50
      };
      
      // Set up mocks
      jiraApiService.get.mockResolvedValue(mockProject);
      jiraApiService.post.mockResolvedValue(mockSearchResults);

      // Call the service
      const result = await jiraDataService.getEpics('PROJ1', 'test-token');

      // Check the result
      expect(result).toEqual(mockSearchResults.issues);
      
      // Check that jiraApiService was called correctly
      expect(jiraApiService.get).toHaveBeenCalledWith(
        '/project/PROJ1',
        expect.any(Object),
        'test-token',
        true
      );
      
      expect(jiraApiService.post).toHaveBeenCalledWith(
        '/search',
        expect.objectContaining({
          jql: 'project = "PROJ1" AND issuetype = "10000" ORDER BY created DESC'
        }),
        'test-token',
        true
      );
    });
  });

  describe('searchIssues', () => {
    it('should handle pagination correctly', async () => {
      // Mock jiraApiService.post for first page
      const mockFirstPage = {
        issues: [{ id: '1001', key: 'PROJ1-1' }],
        total: 2,
        startAt: 0,
        maxResults: 1
      };
      
      // Mock jiraApiService.post for second page
      const mockSecondPage = {
        issues: [{ id: '1002', key: 'PROJ1-2' }],
        total: 2,
        startAt: 1,
        maxResults: 1
      };
      
      // Set up mocks to return different results on each call
      jiraApiService.post
        .mockResolvedValueOnce(mockFirstPage)
        .mockResolvedValueOnce(mockSecondPage);

      // Call the service
      const result = await jiraDataService.searchIssues(
        'project = PROJ1',
        'test-token',
        true,
        0,
        1
      );

      // Check the result
      expect(result.issues).toHaveLength(2);
      expect(result.issues[0].id).toBe('1001');
      expect(result.issues[1].id).toBe('1002');
      
      // Check that jiraApiService was called twice for pagination
      expect(jiraApiService.post).toHaveBeenCalledTimes(2);
    });
  });
});

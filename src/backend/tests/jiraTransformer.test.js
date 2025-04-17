const {
  transformProject,
  transformIssue,
  transformEpic,
  transformBug,
  extractSprintInfo,
  determineBugSeverity
} = require('../utils/jiraTransformer');

describe('jiraTransformer', () => {
  describe('transformProject', () => {
    it('should transform a Jira project to standardized format', () => {
      // Mock Jira project
      const jiraProject = {
        id: '10000',
        key: 'PROJ',
        name: 'Test Project',
        description: 'Project description',
        self: 'https://jira.example.com/rest/api/3/project/10000',
        url: 'https://jira.example.com/projects/PROJ',
        lead: {
          accountId: 'user123',
          displayName: 'John Doe',
          emailAddress: 'john@example.com',
          avatarUrls: {
            '48x48': 'https://jira.example.com/avatar/user123'
          }
        },
        issueTypes: [
          {
            id: '10001',
            name: 'Epic',
            description: 'Epic issue type',
            iconUrl: 'https://jira.example.com/icons/epic.svg'
          }
        ],
        versions: [
          {
            id: '10001',
            name: 'v1.0',
            description: 'Version 1.0',
            released: true,
            releaseDate: '2023-01-01'
          }
        ]
      };

      // Transform the project
      const result = transformProject(jiraProject);

      // Check the result
      expect(result).toEqual({
        id: '10000',
        key: 'PROJ',
        name: 'Test Project',
        description: 'Project description',
        url: 'https://jira.example.com/rest/api/3/project/10000',
        webUrl: 'https://jira.example.com/projects/PROJ',
        lead: {
          id: 'user123',
          name: 'John Doe',
          email: 'john@example.com',
          avatarUrl: 'https://jira.example.com/avatar/user123'
        },
        issueTypes: [
          {
            id: '10001',
            name: 'Epic',
            description: 'Epic issue type',
            iconUrl: 'https://jira.example.com/icons/epic.svg'
          }
        ],
        versions: [
          {
            id: '10001',
            name: 'v1.0',
            description: 'Version 1.0',
            released: true,
            releaseDate: '2023-01-01'
          }
        ]
      });
    });

    it('should handle null or undefined project', () => {
      expect(transformProject(null)).toBeNull();
      expect(transformProject(undefined)).toBeNull();
    });
  });

  describe('transformIssue', () => {
    it('should transform a Jira issue to standardized format', () => {
      // Mock Jira issue
      const jiraIssue = {
        id: '10001',
        key: 'PROJ-1',
        fields: {
          summary: 'Test Issue',
          description: 'Issue description',
          status: {
            id: '3',
            name: 'In Progress',
            statusCategory: {
              name: 'In Progress'
            }
          },
          priority: {
            id: '2',
            name: 'High',
            iconUrl: 'https://jira.example.com/icons/priority_high.svg'
          },
          issuetype: {
            id: '10002',
            name: 'Story',
            iconUrl: 'https://jira.example.com/icons/story.svg'
          },
          project: {
            id: '10000',
            key: 'PROJ',
            name: 'Test Project'
          },
          assignee: {
            accountId: 'user123',
            displayName: 'John Doe',
            emailAddress: 'john@example.com',
            avatarUrls: {
              '48x48': 'https://jira.example.com/avatar/user123'
            }
          },
          reporter: {
            accountId: 'user456',
            displayName: 'Jane Smith',
            emailAddress: 'jane@example.com',
            avatarUrls: {
              '48x48': 'https://jira.example.com/avatar/user456'
            }
          },
          created: '2023-01-01T12:00:00.000Z',
          updated: '2023-01-02T12:00:00.000Z',
          duedate: '2023-01-31',
          labels: ['important', 'frontend'],
          components: [
            {
              id: '10001',
              name: 'UI'
            }
          ],
          fixVersions: [
            {
              id: '10001',
              name: 'v1.0'
            }
          ],
          customfield_10014: 'com.atlassian.greenhopper.service.sprint.Sprint@12345[id=123,name=Sprint 1,...]',
          customfield_10015: 'PROJ-100',
          customfield_10016: 'Epic Name'
        }
      };

      // Transform the issue
      const result = transformIssue(jiraIssue);

      // Check the result
      expect(result).toMatchObject({
        id: '10001',
        key: 'PROJ-1',
        summary: 'Test Issue',
        description: 'Issue description',
        status: {
          id: '3',
          name: 'In Progress',
          category: 'In Progress'
        },
        priority: {
          id: '2',
          name: 'High',
          iconUrl: 'https://jira.example.com/icons/priority_high.svg'
        },
        issueType: {
          id: '10002',
          name: 'Story',
          iconUrl: 'https://jira.example.com/icons/story.svg'
        },
        project: {
          id: '10000',
          key: 'PROJ',
          name: 'Test Project'
        },
        assignee: {
          id: 'user123',
          name: 'John Doe',
          email: 'john@example.com',
          avatarUrl: 'https://jira.example.com/avatar/user123'
        },
        reporter: {
          id: 'user456',
          name: 'Jane Smith',
          email: 'jane@example.com',
          avatarUrl: 'https://jira.example.com/avatar/user456'
        },
        created: '2023-01-01T12:00:00.000Z',
        updated: '2023-01-02T12:00:00.000Z',
        dueDate: '2023-01-31',
        labels: ['important', 'frontend'],
        components: [
          {
            id: '10001',
            name: 'UI'
          }
        ],
        fixVersions: [
          {
            id: '10001',
            name: 'v1.0'
          }
        ],
        sprint: {
          id: '123',
          name: 'Sprint 1'
        },
        epicLink: 'PROJ-100',
        epicName: 'Epic Name'
      });
    });
  });

  describe('extractSprintInfo', () => {
    it('should extract sprint info from string format', () => {
      const sprintField = 'com.atlassian.greenhopper.service.sprint.Sprint@12345[id=123,name=Sprint 1,...]';
      const result = extractSprintInfo(sprintField);
      
      expect(result).toEqual({
        id: '123',
        name: 'Sprint 1'
      });
    });

    it('should extract sprint info from object format', () => {
      const sprintField = {
        id: 123,
        name: 'Sprint 1',
        state: 'active',
        startDate: '2023-01-01T00:00:00.000Z',
        endDate: '2023-01-14T00:00:00.000Z'
      };
      
      const result = extractSprintInfo(sprintField);
      
      expect(result).toEqual({
        id: 123,
        name: 'Sprint 1',
        state: 'active',
        startDate: '2023-01-01T00:00:00.000Z',
        endDate: '2023-01-14T00:00:00.000Z'
      });
    });

    it('should handle array of sprints', () => {
      const sprintField = [
        'com.atlassian.greenhopper.service.sprint.Sprint@12345[id=123,name=Sprint 1,...]',
        'com.atlassian.greenhopper.service.sprint.Sprint@67890[id=124,name=Sprint 2,...]'
      ];
      
      const result = extractSprintInfo(sprintField);
      
      expect(result).toEqual({
        id: '124',
        name: 'Sprint 2'
      });
    });
  });

  describe('determineBugSeverity', () => {
    it('should determine severity based on priority', () => {
      // Test different priorities
      const criticalBug = {
        fields: {
          priority: {
            name: 'Highest'
          }
        }
      };
      
      const highBug = {
        fields: {
          priority: {
            name: 'High'
          }
        }
      };
      
      const mediumBug = {
        fields: {
          priority: {
            name: 'Medium'
          }
        }
      };
      
      const lowBug = {
        fields: {
          priority: {
            name: 'Low'
          }
        }
      };
      
      const trivialBug = {
        fields: {
          priority: {
            name: 'Lowest'
          }
        }
      };
      
      // Check results
      expect(determineBugSeverity(criticalBug).level).toBe('Critical');
      expect(determineBugSeverity(highBug).level).toBe('High');
      expect(determineBugSeverity(mediumBug).level).toBe('Medium');
      expect(determineBugSeverity(lowBug).level).toBe('Low');
      expect(determineBugSeverity(trivialBug).level).toBe('Trivial');
    });

    it('should assign numeric values to severity levels', () => {
      const bug = {
        fields: {
          priority: {
            name: 'High'
          }
        }
      };
      
      const result = determineBugSeverity(bug);
      
      expect(result.value).toBe(4);
      expect(result.color).toBe('#FF8C00');
    });
  });
});

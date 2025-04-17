const jiraApiService = require('./jiraApiService');

/**
 * Service for retrieving and processing Jira data
 */
class JiraDataService {
  /**
   * Get all accessible projects
   * @param {string} accessToken - OAuth access token
   * @param {boolean} useCache - Whether to use cache
   * @returns {Promise<Array>} - List of projects
   */
  async getProjects(accessToken, useCache = true) {
    try {
      const projects = await jiraApiService.get('/project', {
        expand: 'description,lead,url',
        status: 'live',
        orderBy: 'name'
      }, accessToken, useCache);
      
      return projects;
    } catch (error) {
      console.error('Error fetching Jira projects:', error.message);
      throw new Error('Failed to fetch Jira projects');
    }
  }

  /**
   * Get a specific project by key
   * @param {string} projectKey - Jira project key
   * @param {string} accessToken - OAuth access token
   * @param {boolean} useCache - Whether to use cache
   * @returns {Promise<Object>} - Project details
   */
  async getProject(projectKey, accessToken, useCache = true) {
    try {
      const project = await jiraApiService.get(`/project/${projectKey}`, {
        expand: 'description,lead,url,issueTypes,versions'
      }, accessToken, useCache);
      
      return project;
    } catch (error) {
      console.error(`Error fetching Jira project ${projectKey}:`, error.message);
      throw new Error(`Failed to fetch Jira project ${projectKey}`);
    }
  }

  /**
   * Get all epics for a project
   * @param {string} projectKey - Jira project key
   * @param {string} accessToken - OAuth access token
   * @param {boolean} useCache - Whether to use cache
   * @returns {Promise<Array>} - List of epics
   */
  async getEpics(projectKey, accessToken, useCache = true) {
    try {
      // Find the epic issue type ID for the project
      const project = await this.getProject(projectKey, accessToken, useCache);
      const epicIssueType = project.issueTypes.find(type => type.name === 'Epic');
      
      if (!epicIssueType) {
        throw new Error(`Epic issue type not found for project ${projectKey}`);
      }
      
      // JQL to find all epics in the project
      const jql = `project = "${projectKey}" AND issuetype = "${epicIssueType.id}" ORDER BY created DESC`;
      
      // Get all epics using search
      const searchResults = await this.searchIssues(jql, accessToken, useCache);
      
      return searchResults.issues;
    } catch (error) {
      console.error(`Error fetching epics for project ${projectKey}:`, error.message);
      throw new Error(`Failed to fetch epics for project ${projectKey}`);
    }
  }

  /**
   * Get all issues for an epic
   * @param {string} epicKey - Jira epic key
   * @param {string} accessToken - OAuth access token
   * @param {boolean} useCache - Whether to use cache
   * @returns {Promise<Array>} - List of issues
   */
  async getIssuesForEpic(epicKey, accessToken, useCache = true) {
    try {
      // JQL to find all issues in the epic
      const jql = `"Epic Link" = "${epicKey}" ORDER BY created DESC`;
      
      // Get all issues using search
      const searchResults = await this.searchIssues(jql, accessToken, useCache);
      
      return searchResults.issues;
    } catch (error) {
      console.error(`Error fetching issues for epic ${epicKey}:`, error.message);
      throw new Error(`Failed to fetch issues for epic ${epicKey}`);
    }
  }

  /**
   * Get all bugs for a project
   * @param {string} projectKey - Jira project key
   * @param {string} accessToken - OAuth access token
   * @param {boolean} useCache - Whether to use cache
   * @returns {Promise<Array>} - List of bugs
   */
  async getBugs(projectKey, accessToken, useCache = true) {
    try {
      // Find the bug issue type ID for the project
      const project = await this.getProject(projectKey, accessToken, useCache);
      const bugIssueType = project.issueTypes.find(type => type.name === 'Bug');
      
      if (!bugIssueType) {
        throw new Error(`Bug issue type not found for project ${projectKey}`);
      }
      
      // JQL to find all bugs in the project
      const jql = `project = "${projectKey}" AND issuetype = "${bugIssueType.id}" ORDER BY created DESC`;
      
      // Get all bugs using search
      const searchResults = await this.searchIssues(jql, accessToken, useCache);
      
      return searchResults.issues;
    } catch (error) {
      console.error(`Error fetching bugs for project ${projectKey}:`, error.message);
      throw new Error(`Failed to fetch bugs for project ${projectKey}`);
    }
  }

  /**
   * Search for issues using JQL
   * @param {string} jql - JQL query
   * @param {string} accessToken - OAuth access token
   * @param {boolean} useCache - Whether to use cache
   * @param {number} startAt - Starting index for pagination
   * @param {number} maxResults - Maximum results to return
   * @returns {Promise<Object>} - Search results
   */
  async searchIssues(jql, accessToken, useCache = true, startAt = 0, maxResults = 50) {
    try {
      const searchResults = await jiraApiService.post('/search', {
        jql,
        startAt,
        maxResults,
        fields: [
          'summary',
          'description',
          'status',
          'priority',
          'assignee',
          'reporter',
          'created',
          'updated',
          'duedate',
          'issuetype',
          'project',
          'parent',
          'customfield_10014', // Sprint field (may vary by Jira instance)
          'customfield_10015', // Epic Link field (may vary by Jira instance)
          'customfield_10016', // Epic Name field (may vary by Jira instance)
          'labels',
          'fixVersions',
          'components'
        ],
        expand: ['changelog']
      }, accessToken, useCache);
      
      // Handle pagination if there are more results
      if (searchResults.startAt + searchResults.maxResults < searchResults.total) {
        const nextStartAt = searchResults.startAt + searchResults.maxResults;
        const nextResults = await this.searchIssues(jql, accessToken, useCache, nextStartAt, maxResults);
        
        // Combine results
        searchResults.issues = [...searchResults.issues, ...nextResults.issues];
      }
      
      return searchResults;
    } catch (error) {
      console.error(`Error searching issues with JQL "${jql}":`, error.message);
      throw new Error('Failed to search Jira issues');
    }
  }

  /**
   * Get a specific issue by key
   * @param {string} issueKey - Jira issue key
   * @param {string} accessToken - OAuth access token
   * @param {boolean} useCache - Whether to use cache
   * @returns {Promise<Object>} - Issue details
   */
  async getIssue(issueKey, accessToken, useCache = true) {
    try {
      const issue = await jiraApiService.get(`/issue/${issueKey}`, {
        expand: 'changelog,transitions,renderedFields'
      }, accessToken, useCache);
      
      return issue;
    } catch (error) {
      console.error(`Error fetching Jira issue ${issueKey}:`, error.message);
      throw new Error(`Failed to fetch Jira issue ${issueKey}`);
    }
  }

  /**
   * Get all sprints for a project (requires Jira Software)
   * @param {string} projectKey - Jira project key
   * @param {string} accessToken - OAuth access token
   * @param {boolean} useCache - Whether to use cache
   * @returns {Promise<Array>} - List of sprints
   */
  async getSprints(projectKey, accessToken, useCache = true) {
    try {
      // This endpoint is specific to Jira Software and may require different API path
      const boardsEndpoint = '/rest/agile/1.0/board';
      
      // Get all boards for the project
      const boards = await jiraApiService.get(boardsEndpoint, {
        projectKeyOrId: projectKey
      }, accessToken, useCache);
      
      if (!boards.values || boards.values.length === 0) {
        return [];
      }
      
      // Get sprints for each board
      const allSprints = [];
      for (const board of boards.values) {
        const sprintsEndpoint = `/rest/agile/1.0/board/${board.id}/sprint`;
        const sprints = await jiraApiService.get(sprintsEndpoint, {
          state: 'active,future'
        }, accessToken, useCache);
        
        if (sprints.values && sprints.values.length > 0) {
          allSprints.push(...sprints.values);
        }
      }
      
      return allSprints;
    } catch (error) {
      console.error(`Error fetching sprints for project ${projectKey}:`, error.message);
      throw new Error(`Failed to fetch sprints for project ${projectKey}`);
    }
  }
}

module.exports = new JiraDataService();

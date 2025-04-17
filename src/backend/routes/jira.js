const express = require('express');
const router = express.Router();
const jiraDataService = require('../services/jiraDataService');
const { transformProject, transformIssue, transformEpic, transformBug } = require('../utils/jiraTransformer');
const { asyncHandler } = require('../utils/errorHandler');
const { authenticateToken } = require('../middleware/authMiddleware');

// Apply authentication middleware to all routes
router.use(authenticateToken);

/**
 * @route   GET /api/jira/projects
 * @desc    Get all accessible Jira projects
 * @access  Private
 */
router.get('/projects', asyncHandler(async (req, res) => {
  const projects = await jiraDataService.getProjects(req.oauth.access_token);
  
  // Transform projects to standardized format
  const transformedProjects = projects.map(transformProject);
  
  res.json({
    success: true,
    data: transformedProjects
  });
}));

/**
 * @route   GET /api/jira/projects/:projectKey
 * @desc    Get a specific Jira project
 * @access  Private
 */
router.get('/projects/:projectKey', asyncHandler(async (req, res) => {
  const { projectKey } = req.params;
  const project = await jiraDataService.getProject(projectKey, req.oauth.access_token);
  
  // Transform project to standardized format
  const transformedProject = transformProject(project);
  
  res.json({
    success: true,
    data: transformedProject
  });
}));

/**
 * @route   GET /api/jira/projects/:projectKey/epics
 * @desc    Get all epics for a Jira project
 * @access  Private
 */
router.get('/projects/:projectKey/epics', asyncHandler(async (req, res) => {
  const { projectKey } = req.params;
  const epics = await jiraDataService.getEpics(projectKey, req.oauth.access_token);
  
  // Transform epics to standardized format
  const transformedEpics = epics.map(transformEpic);
  
  res.json({
    success: true,
    data: transformedEpics
  });
}));

/**
 * @route   GET /api/jira/epics/:epicKey/issues
 * @desc    Get all issues for a Jira epic
 * @access  Private
 */
router.get('/epics/:epicKey/issues', asyncHandler(async (req, res) => {
  const { epicKey } = req.params;
  const issues = await jiraDataService.getIssuesForEpic(epicKey, req.oauth.access_token);
  
  // Transform issues to standardized format
  const transformedIssues = issues.map(transformIssue);
  
  res.json({
    success: true,
    data: transformedIssues
  });
}));

/**
 * @route   GET /api/jira/projects/:projectKey/bugs
 * @desc    Get all bugs for a Jira project
 * @access  Private
 */
router.get('/projects/:projectKey/bugs', asyncHandler(async (req, res) => {
  const { projectKey } = req.params;
  const bugs = await jiraDataService.getBugs(projectKey, req.oauth.access_token);
  
  // Transform bugs to standardized format
  const transformedBugs = bugs.map(transformBug);
  
  res.json({
    success: true,
    data: transformedBugs
  });
}));

/**
 * @route   GET /api/jira/issues/:issueKey
 * @desc    Get a specific Jira issue
 * @access  Private
 */
router.get('/issues/:issueKey', asyncHandler(async (req, res) => {
  const { issueKey } = req.params;
  const issue = await jiraDataService.getIssue(issueKey, req.oauth.access_token);
  
  // Transform issue to standardized format
  const transformedIssue = transformIssue(issue);
  
  res.json({
    success: true,
    data: transformedIssue
  });
}));

/**
 * @route   GET /api/jira/search
 * @desc    Search for Jira issues using JQL
 * @access  Private
 */
router.get('/search', asyncHandler(async (req, res) => {
  const { jql, startAt, maxResults } = req.query;
  
  if (!jql) {
    return res.status(400).json({
      success: false,
      error: {
        message: 'JQL query is required'
      }
    });
  }
  
  const searchResults = await jiraDataService.searchIssues(
    jql,
    req.oauth.access_token,
    true,
    parseInt(startAt, 10) || 0,
    parseInt(maxResults, 10) || 50
  );
  
  // Transform issues to standardized format
  const transformedIssues = searchResults.issues.map(transformIssue);
  
  res.json({
    success: true,
    data: {
      issues: transformedIssues,
      total: searchResults.total,
      startAt: searchResults.startAt,
      maxResults: searchResults.maxResults
    }
  });
}));

/**
 * @route   GET /api/jira/cache/clear
 * @desc    Clear Jira API cache
 * @access  Private
 */
router.get('/cache/clear', asyncHandler(async (req, res) => {
  const { pattern } = req.query;
  
  if (pattern) {
    // Clear cache by pattern
    const clearedCount = require('../services/cacheService').clearByPattern(pattern);
    
    res.json({
      success: true,
      message: `Cleared ${clearedCount} cache entries matching "${pattern}"`
    });
  } else {
    // Clear all Jira API cache
    require('../services/jiraApiService').clearAllCache();
    
    res.json({
      success: true,
      message: 'Cleared all Jira API cache'
    });
  }
}));

/**
 * @route   GET /api/jira/cache/stats
 * @desc    Get Jira API cache statistics
 * @access  Private
 */
router.get('/cache/stats', asyncHandler(async (req, res) => {
  const stats = require('../services/cacheService').getStats();
  
  res.json({
    success: true,
    data: stats
  });
}));

module.exports = router;

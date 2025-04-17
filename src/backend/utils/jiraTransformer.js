/**
 * Utility functions for transforming Jira data
 */

/**
 * Transform a Jira project into a standardized format
 * @param {Object} project - Jira project object
 * @returns {Object} - Standardized project object
 */
function transformProject(project) {
  if (!project) return null;
  
  return {
    id: project.id,
    key: project.key,
    name: project.name,
    description: project.description || '',
    url: project.self,
    webUrl: project.url || `${process.env.JIRA_API_URL}/browse/${project.key}`,
    lead: project.lead ? {
      id: project.lead.accountId,
      name: project.lead.displayName,
      email: project.lead.emailAddress,
      avatarUrl: project.lead.avatarUrls?.['48x48']
    } : null,
    issueTypes: (project.issueTypes || []).map(type => ({
      id: type.id,
      name: type.name,
      description: type.description,
      iconUrl: type.iconUrl
    })),
    versions: (project.versions || []).map(version => ({
      id: version.id,
      name: version.name,
      description: version.description || '',
      released: version.released || false,
      releaseDate: version.releaseDate || null
    }))
  };
}

/**
 * Transform a Jira issue into a standardized format
 * @param {Object} issue - Jira issue object
 * @returns {Object} - Standardized issue object
 */
function transformIssue(issue) {
  if (!issue) return null;
  
  const fields = issue.fields || {};
  
  return {
    id: issue.id,
    key: issue.key,
    summary: fields.summary || '',
    description: fields.description || '',
    status: fields.status ? {
      id: fields.status.id,
      name: fields.status.name,
      category: fields.status.statusCategory?.name || 'Unknown'
    } : null,
    priority: fields.priority ? {
      id: fields.priority.id,
      name: fields.priority.name,
      iconUrl: fields.priority.iconUrl
    } : null,
    issueType: fields.issuetype ? {
      id: fields.issuetype.id,
      name: fields.issuetype.name,
      iconUrl: fields.issuetype.iconUrl
    } : null,
    project: fields.project ? {
      id: fields.project.id,
      key: fields.project.key,
      name: fields.project.name
    } : null,
    assignee: fields.assignee ? {
      id: fields.assignee.accountId,
      name: fields.assignee.displayName,
      email: fields.assignee.emailAddress,
      avatarUrl: fields.assignee.avatarUrls?.['48x48']
    } : null,
    reporter: fields.reporter ? {
      id: fields.reporter.accountId,
      name: fields.reporter.displayName,
      email: fields.reporter.emailAddress,
      avatarUrl: fields.reporter.avatarUrls?.['48x48']
    } : null,
    created: fields.created || null,
    updated: fields.updated || null,
    dueDate: fields.duedate || null,
    labels: fields.labels || [],
    components: (fields.components || []).map(component => ({
      id: component.id,
      name: component.name
    })),
    fixVersions: (fields.fixVersions || []).map(version => ({
      id: version.id,
      name: version.name
    })),
    // Custom fields - these may vary by Jira instance
    sprint: fields.customfield_10014 ? extractSprintInfo(fields.customfield_10014) : null,
    epicLink: fields.customfield_10015 || null,
    epicName: fields.customfield_10016 || null,
    // URL to view the issue in Jira
    webUrl: `${process.env.JIRA_API_URL}/browse/${issue.key}`
  };
}

/**
 * Transform a Jira epic into a standardized format
 * @param {Object} epic - Jira epic issue object
 * @returns {Object} - Standardized epic object
 */
function transformEpic(epic) {
  if (!epic) return null;
  
  const standardIssue = transformIssue(epic);
  const fields = epic.fields || {};
  
  return {
    ...standardIssue,
    epicName: fields.customfield_10016 || standardIssue.summary,
    progress: calculateEpicProgress(epic),
    color: fields.customfield_10017 || '#2684FF', // Epic color field (may vary)
    quarterInfo: determineEpicQuarter(epic)
  };
}

/**
 * Transform a Jira bug into a standardized format
 * @param {Object} bug - Jira bug issue object
 * @returns {Object} - Standardized bug object
 */
function transformBug(bug) {
  if (!bug) return null;
  
  const standardIssue = transformIssue(bug);
  const fields = bug.fields || {};
  
  return {
    ...standardIssue,
    severity: determineBugSeverity(bug),
    environment: fields.environment || '',
    affectsVersions: (fields.versions || []).map(version => ({
      id: version.id,
      name: version.name
    }))
  };
}

/**
 * Extract sprint information from Jira sprint field
 * @param {Array|string} sprintField - Jira sprint field value
 * @returns {Object|null} - Sprint information
 */
function extractSprintInfo(sprintField) {
  if (!sprintField) return null;
  
  // Sprint field can be an array or a string depending on Jira configuration
  let sprintData = sprintField;
  
  if (Array.isArray(sprintField)) {
    // Use the most recent sprint if there are multiple
    sprintData = sprintField[sprintField.length - 1];
  }
  
  // If it's a string, parse the sprint data
  if (typeof sprintData === 'string') {
    try {
      // Sprint data is often in the format: "com.atlassian.greenhopper.service.sprint.Sprint@12345[id=123,name=Sprint 1,...]"
      const matches = sprintData.match(/id=(\d+),name=([^,]+),/);
      if (matches && matches.length >= 3) {
        return {
          id: matches[1],
          name: matches[2]
        };
      }
    } catch (error) {
      console.error('Error parsing sprint data:', error);
    }
  } else if (typeof sprintData === 'object') {
    // If it's already an object, extract the relevant fields
    return {
      id: sprintData.id,
      name: sprintData.name,
      state: sprintData.state,
      startDate: sprintData.startDate,
      endDate: sprintData.endDate
    };
  }
  
  return null;
}

/**
 * Calculate progress for an epic based on its issues
 * @param {Object} epic - Jira epic issue object
 * @returns {Object} - Progress information
 */
function calculateEpicProgress(epic) {
  // This would typically use data from a separate API call to get all issues in the epic
  // For now, we'll return a placeholder
  return {
    total: 0,
    completed: 0,
    percent: 0
  };
}

/**
 * Determine which quarter an epic belongs to
 * @param {Object} epic - Jira epic issue object
 * @returns {Object} - Quarter information
 */
function determineEpicQuarter(epic) {
  const fields = epic.fields || {};
  const dueDate = fields.duedate ? new Date(fields.duedate) : null;
  
  if (!dueDate) {
    return {
      year: new Date().getFullYear(),
      quarter: 'Backlog',
      display: 'Backlog'
    };
  }
  
  const year = dueDate.getFullYear();
  const month = dueDate.getMonth();
  let quarter;
  
  if (month < 3) {
    quarter = 'Q1';
  } else if (month < 6) {
    quarter = 'Q2';
  } else if (month < 9) {
    quarter = 'Q3';
  } else {
    quarter = 'Q4';
  }
  
  return {
    year,
    quarter,
    display: `${quarter} ${year}`
  };
}

/**
 * Determine severity of a bug based on priority and other factors
 * @param {Object} bug - Jira bug issue object
 * @returns {Object} - Severity information
 */
function determineBugSeverity(bug) {
  const fields = bug.fields || {};
  const priority = fields.priority ? fields.priority.name : null;
  
  // Map Jira priorities to severity levels
  let severity;
  switch (priority) {
    case 'Highest':
    case 'Critical':
      severity = 'Critical';
      break;
    case 'High':
      severity = 'High';
      break;
    case 'Medium':
      severity = 'Medium';
      break;
    case 'Low':
      severity = 'Low';
      break;
    case 'Lowest':
      severity = 'Trivial';
      break;
    default:
      severity = 'Medium';
  }
  
  return {
    level: severity,
    value: getSeverityValue(severity),
    color: getSeverityColor(severity)
  };
}

/**
 * Get numeric value for a severity level
 * @param {string} severity - Severity level
 * @returns {number} - Numeric value
 */
function getSeverityValue(severity) {
  switch (severity) {
    case 'Critical': return 5;
    case 'High': return 4;
    case 'Medium': return 3;
    case 'Low': return 2;
    case 'Trivial': return 1;
    default: return 0;
  }
}

/**
 * Get color for a severity level
 * @param {string} severity - Severity level
 * @returns {string} - Color code
 */
function getSeverityColor(severity) {
  switch (severity) {
    case 'Critical': return '#FF0000'; // Red
    case 'High': return '#FF8C00'; // Dark Orange
    case 'Medium': return '#FFD700'; // Gold
    case 'Low': return '#32CD32'; // Lime Green
    case 'Trivial': return '#1E90FF'; // Dodger Blue
    default: return '#808080'; // Gray
  }
}

module.exports = {
  transformProject,
  transformIssue,
  transformEpic,
  transformBug,
  extractSprintInfo,
  calculateEpicProgress,
  determineEpicQuarter,
  determineBugSeverity
};

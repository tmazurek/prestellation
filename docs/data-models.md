# Prestellation Data Models

This document outlines the data models used in the Prestellation application, including their structure, relationships, and transformation processes.

## Core Data Models

### Project

Represents a Jira project that is being tracked in the application.

```typescript
interface Project {
  id: string;           // Unique identifier from Jira
  key: string;          // Project key (e.g., "PROJ")
  name: string;         // Project name
  description: string;  // Project description
  lead: User;           // Project lead/owner
  url: string;          // URL to project in Jira
  avatarUrl: string;    // URL to project avatar image
  category: string;     // Project category
  lastUpdated: Date;    // Last update timestamp
  metadata: {           // Additional metadata
    [key: string]: any;
  };
}
```

### Epic

Represents a Jira epic, which is a large body of work that can be broken down into smaller stories.

```typescript
interface Epic {
  id: string;               // Unique identifier from Jira
  key: string;              // Epic key (e.g., "PROJ-123")
  summary: string;          // Epic summary/title
  description: string;      // Epic description
  status: string;           // Current status
  statusCategory: string;   // Status category (To Do, In Progress, Done)
  assignee: User | null;    // Assigned user
  reporter: User;           // User who reported/created the epic
  created: Date;            // Creation timestamp
  updated: Date;            // Last update timestamp
  dueDate: Date | null;     // Due date if set
  startDate: Date | null;   // Start date if set
  project: Project;         // Associated project
  color: string;            // Color for visualization
  progress: number;         // Progress percentage (0-100)
  children: Issue[];        // Child issues
  quarter: string;          // Assigned quarter (e.g., "2023-Q1")
  metadata: {               // Additional metadata
    [key: string]: any;
  };
}
```

### Issue

Represents a Jira issue, which can be a story, task, bug, or other issue type.

```typescript
interface Issue {
  id: string;               // Unique identifier from Jira
  key: string;              // Issue key (e.g., "PROJ-456")
  type: string;             // Issue type (Story, Task, Bug, etc.)
  summary: string;          // Issue summary/title
  description: string;      // Issue description
  status: string;           // Current status
  statusCategory: string;   // Status category (To Do, In Progress, Done)
  priority: string;         // Priority level
  severity: string | null;  // Severity level (for bugs)
  assignee: User | null;    // Assigned user
  reporter: User;           // User who reported/created the issue
  created: Date;            // Creation timestamp
  updated: Date;            // Last update timestamp
  dueDate: Date | null;     // Due date if set
  project: Project;         // Associated project
  epic: Epic | null;        // Parent epic if any
  parent: Issue | null;     // Parent issue if any
  children: Issue[];        // Child issues
  timeEstimate: number;     // Estimated time in seconds
  timeSpent: number;        // Time spent in seconds
  labels: string[];         // Associated labels
  components: string[];     // Associated components
  fixVersions: string[];    // Fix versions
  metadata: {               // Additional metadata
    [key: string]: any;
  };
}
```

### User

Represents a Jira user.

```typescript
interface User {
  id: string;           // Unique identifier from Jira
  name: string;         // Username
  displayName: string;  // Display name
  email: string;        // Email address
  avatarUrl: string;    // URL to avatar image
  active: boolean;      // Whether the user is active
  metadata: {           // Additional metadata
    [key: string]: any;
  };
}
```

## View Models

These models represent transformed data optimized for specific views in the application.

### RoadmapViewModel

Used for the roadmap visualization.

```typescript
interface RoadmapViewModel {
  quarters: Quarter[];              // List of quarters
  projects: ProjectSummary[];       // List of projects
  epics: RoadmapEpic[];             // List of epics
  filters: RoadmapFilters;          // Applied filters
  lastUpdated: Date;                // Last data update timestamp
}

interface Quarter {
  id: string;                       // Quarter identifier (e.g., "2023-Q1")
  name: string;                     // Display name (e.g., "Q1 2023")
  startDate: Date;                  // Quarter start date
  endDate: Date;                    // Quarter end date
  epicCount: number;                // Number of epics in this quarter
}

interface ProjectSummary {
  id: string;                       // Project identifier
  key: string;                      // Project key
  name: string;                     // Project name
  color: string;                    // Color for visualization
  epicCount: number;                // Number of epics in this project
}

interface RoadmapEpic {
  id: string;                       // Epic identifier
  key: string;                      // Epic key
  summary: string;                  // Epic summary
  status: string;                   // Current status
  statusCategory: string;           // Status category
  progress: number;                 // Progress percentage
  quarter: string;                  // Assigned quarter
  project: ProjectSummary;          // Associated project
  assignee: UserSummary | null;     // Assigned user
  dueDate: Date | null;             // Due date if set
  color: string;                    // Color for visualization
  childCount: number;               // Number of child issues
  completedCount: number;           // Number of completed child issues
}

interface RoadmapFilters {
  projects: string[];               // Selected project IDs
  quarters: string[];               // Selected quarter IDs
  statuses: string[];               // Selected status categories
  assignees: string[];              // Selected assignee IDs
  searchTerm: string;               // Search term
}

interface UserSummary {
  id: string;                       // User identifier
  displayName: string;              // Display name
  avatarUrl: string;                // Avatar URL
}
```

### BugReportViewModel

Used for the bug reporting visualization.

```typescript
interface BugReportViewModel {
  summary: BugSummary;              // Summary statistics
  severityBreakdown: SeverityCount[];  // Bugs by severity
  projectBreakdown: ProjectBugs[];  // Bugs by project
  trends: BugTrend[];               // Bug trends over time
  criticalBugs: BugDetail[];        // List of critical bugs
  filters: BugFilters;              // Applied filters
  lastUpdated: Date;                // Last data update timestamp
}

interface BugSummary {
  totalCount: number;               // Total number of bugs
  openCount: number;                // Number of open bugs
  criticalCount: number;            // Number of critical bugs
  resolvedLastWeek: number;         // Bugs resolved in last week
  createdLastWeek: number;          // Bugs created in last week
  averageAge: number;               // Average age in days
}

interface SeverityCount {
  severity: string;                 // Severity level
  count: number;                    // Number of bugs
  percentage: number;               // Percentage of total
}

interface ProjectBugs {
  project: ProjectSummary;          // Project information
  count: number;                    // Number of bugs
  criticalCount: number;            // Number of critical bugs
  percentageResolved: number;       // Percentage resolved
}

interface BugTrend {
  date: Date;                       // Date point
  created: number;                  // Bugs created
  resolved: number;                 // Bugs resolved
  open: number;                     // Open bugs
}

interface BugDetail {
  id: string;                       // Bug identifier
  key: string;                      // Bug key
  summary: string;                  // Bug summary
  severity: string;                 // Severity level
  status: string;                   // Current status
  project: ProjectSummary;          // Associated project
  assignee: UserSummary | null;     // Assigned user
  created: Date;                    // Creation date
  age: number;                      // Age in days
  url: string;                      // URL to bug in Jira
}

interface BugFilters {
  projects: string[];               // Selected project IDs
  severities: string[];             // Selected severity levels
  statuses: string[];               // Selected status categories
  assignees: string[];              // Selected assignee IDs
  dateRange: {                      // Date range for trends
    start: Date;
    end: Date;
  };
  searchTerm: string;               // Search term
}
```

## Data Transformation

### Jira to Prestellation Transformation

The application transforms raw Jira data into the application's data models through several steps:

1. **Data Retrieval**: Fetch raw data from Jira API
2. **Data Normalization**: Convert Jira's data structure to application models
3. **Data Enrichment**: Add calculated fields and metadata
4. **Data Linking**: Establish relationships between entities
5. **View Preparation**: Transform data for specific views

#### Example: Epic Transformation

```javascript
// Example transformation function for epics
function transformEpic(jiraEpic, projectsMap, issuesMap) {
  // Basic epic information
  const epic = {
    id: jiraEpic.id,
    key: jiraEpic.key,
    summary: jiraEpic.fields.summary,
    description: jiraEpic.fields.description || '',
    status: jiraEpic.fields.status.name,
    statusCategory: jiraEpic.fields.status.statusCategory.key,
    created: new Date(jiraEpic.fields.created),
    updated: new Date(jiraEpic.fields.updated),
    dueDate: jiraEpic.fields.duedate ? new Date(jiraEpic.fields.duedate) : null,
    startDate: jiraEpic.fields.startdate ? new Date(jiraEpic.fields.startdate) : null,
    project: projectsMap[jiraEpic.fields.project.id],
    color: getEpicColor(jiraEpic),
    children: [],
    metadata: {}
  };
  
  // Assignee and reporter
  epic.assignee = jiraEpic.fields.assignee ? transformUser(jiraEpic.fields.assignee) : null;
  epic.reporter = transformUser(jiraEpic.fields.reporter);
  
  // Find child issues
  epic.children = Object.values(issuesMap)
    .filter(issue => issue.fields.epic && issue.fields.epic.id === epic.id)
    .map(issue => transformIssue(issue, projectsMap, {}));
  
  // Calculate progress
  const totalIssues = epic.children.length;
  const completedIssues = epic.children.filter(
    issue => issue.statusCategory === 'done'
  ).length;
  
  epic.progress = totalIssues > 0 ? Math.round((completedIssues / totalIssues) * 100) : 0;
  
  // Assign to quarter based on due date
  epic.quarter = assignQuarter(epic.dueDate);
  
  return epic;
}

// Helper function to assign quarter
function assignQuarter(date) {
  if (!date) return 'Unassigned';
  
  const year = date.getFullYear();
  const month = date.getMonth();
  
  if (month < 3) return `${year}-Q1`;
  if (month < 6) return `${year}-Q2`;
  if (month < 9) return `${year}-Q3`;
  return `${year}-Q4`;
}
```

#### Example: Bug Transformation

```javascript
// Example transformation function for bugs
function transformBug(jiraIssue, projectsMap) {
  // Basic bug information
  const bug = {
    id: jiraIssue.id,
    key: jiraIssue.key,
    summary: jiraIssue.fields.summary,
    status: jiraIssue.fields.status.name,
    statusCategory: jiraIssue.fields.status.statusCategory.key,
    created: new Date(jiraIssue.fields.created),
    project: projectsMap[jiraIssue.fields.project.id],
    url: `${process.env.JIRA_BASE_URL}/browse/${jiraIssue.key}`
  };
  
  // Determine severity
  bug.severity = getSeverity(jiraIssue);
  
  // Assignee
  bug.assignee = jiraIssue.fields.assignee ? transformUser(jiraIssue.fields.assignee) : null;
  
  // Calculate age in days
  const createdDate = new Date(jiraIssue.fields.created);
  const now = new Date();
  const ageInMs = now - createdDate;
  bug.age = Math.floor(ageInMs / (1000 * 60 * 60 * 24));
  
  return bug;
}

// Helper function to determine severity
function getSeverity(jiraIssue) {
  // Check for severity field
  if (jiraIssue.fields.customfield_10001) {
    return jiraIssue.fields.customfield_10001.value;
  }
  
  // Check for priority as fallback
  if (jiraIssue.fields.priority) {
    const priorityMap = {
      'Highest': 'Critical',
      'High': 'High',
      'Medium': 'Medium',
      'Low': 'Low',
      'Lowest': 'Trivial'
    };
    return priorityMap[jiraIssue.fields.priority.name] || 'Medium';
  }
  
  // Default
  return 'Medium';
}
```

## Data Flow

### Roadmap Data Flow

1. **Retrieve Projects**: Fetch all configured projects from Jira
2. **Retrieve Epics**: Fetch epics for each project
3. **Retrieve Issues**: Fetch issues linked to epics
4. **Transform Data**: Convert to application data models
5. **Calculate Quarters**: Assign epics to quarters based on due dates
6. **Calculate Progress**: Determine completion percentage for each epic
7. **Prepare View Model**: Create roadmap view model for frontend

### Bug Report Data Flow

1. **Retrieve Projects**: Fetch all configured projects from Jira
2. **Retrieve Bugs**: Fetch issues of type "Bug" for each project
3. **Classify Bugs**: Determine severity and other attributes
4. **Calculate Metrics**: Compute age, trends, and statistics
5. **Prepare View Model**: Create bug report view model for frontend

## Caching Strategy

### Cache Structure

```typescript
interface CacheEntry<T> {
  data: T;                  // Cached data
  timestamp: Date;          // When the data was cached
  expiresAt: Date;          // When the cache entry expires
}

interface CacheStore {
  projects: CacheEntry<Project[]>;
  epics: {
    [projectId: string]: CacheEntry<Epic[]>;
  };
  issues: {
    [epicId: string]: CacheEntry<Issue[]>;
  };
  bugs: {
    [projectId: string]: CacheEntry<Issue[]>;
  };
  roadmap: CacheEntry<RoadmapViewModel>;
  bugReport: CacheEntry<BugReportViewModel>;
}
```

### Cache Invalidation

- **Time-based**: Entries expire after configured time (default: 1 hour)
- **Manual**: User can force refresh data
- **Dependency-based**: Invalidate dependent caches when source data changes

## Data Validation

### Input Validation

- Validate all input data from Jira API
- Handle missing or null fields gracefully
- Provide defaults for optional fields
- Log validation errors for debugging

### Output Validation

- Ensure all required fields are present in view models
- Validate calculated fields (percentages, dates, etc.)
- Sanitize text fields for security
- Format dates and numbers consistently

## Conclusion

This data model documentation provides a comprehensive overview of the data structures used in the Prestellation application. By following these models and transformation processes, the application can effectively retrieve, process, and visualize Jira data for executive-friendly presentations and reporting.

The data models are designed to be flexible and extensible, allowing for future enhancements and additional features as the application evolves.

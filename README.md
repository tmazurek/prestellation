# Prestellation

## Executive-Friendly Jira Data Visualization

Prestellation is a web application designed to extract and visualize Jira data in a condensed, executive-friendly format. The app addresses the limitations of Jira's native reporting capabilities when presenting high-level views across multiple projects for C-level meetings and stakeholder reviews.

## Project Overview

This application provides:

- **Roadmap Visualization**: Timeline-based views of project epics across quarters
- **Bug Reporting**: Severity-based analysis and trend visualization of issues
- **Executive-Friendly Interface**: Designed specifically for management stakeholders, not developers

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Jira API access

### Installation

1. Clone this repository
2. Install dependencies:
   ```
   cd prestellation
   npm install
   ```
3. Configure your Jira connection in `.env` file (see `.env.example`)
4. Start the development server:
   ```
   npm run dev
   ```

## Documentation

For detailed information about the project requirements and specifications, see the [Requirements Document](./docs/requirements.md).

## License

[MIT](LICENSE)

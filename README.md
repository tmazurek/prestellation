# Prestellation

## Executive-Friendly Jira Data Visualization

Prestellation is a web application designed to extract and visualize Jira data in a condensed, executive-friendly format. The app addresses the limitations of Jira's native reporting capabilities when presenting high-level views across multiple projects for C-level meetings and stakeholder reviews.

## Project Overview

This application provides:

- **Roadmap Visualization**: Timeline-based views of project epics across quarters
- **Bug Reporting**: Severity-based analysis and trend visualization of issues
- **Executive-Friendly Interface**: Designed specifically for management stakeholders, not developers
- **Export Capabilities**: Generate PowerPoint presentations and PDF reports directly from the visualizations

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Jira account with administrator access to create an OAuth 2.0 app

### Installation

1. Clone this repository
   ```
   git clone https://github.com/yourusername/prestellation.git
   cd prestellation
   ```

2. Install dependencies for both backend and frontend:
   ```
   npm install
   cd src/frontend
   npm install
   cd ../..
   ```

3. Set up an OAuth 2.0 app in Atlassian Developer Console:
   - Go to https://developer.atlassian.com/console/myapps/
   - Create a new OAuth 2.0 app
   - Configure the callback URL as `http://localhost:3000/api/auth/callback`
   - Request the scopes: `read:jira-user` and `read:jira-work`
   - Copy your Client ID and Client Secret

4. Configure your Jira connection in `.env` file (see `.env.example`)
   ```
   cp .env.example .env
   # Edit .env with your OAuth app credentials and settings
   ```

5. Start the development server:
   ```
   npm run dev
   ```
   This will start both the backend server and the frontend development server with hot reloading.

## Project Structure

```
prestellation/
├── docs/                  # Project documentation
├── src/                   # Source code
│   ├── backend/           # Node.js/Express backend
│   │   ├── controllers/   # Request handlers
│   │   ├── middleware/    # Express middleware
│   │   ├── models/        # Data models
│   │   ├── routes/        # API routes
│   │   ├── utils/         # Utility functions
│   │   └── server.js      # Express app entry point
│   └── frontend/          # React frontend
│       ├── public/        # Static assets
│       ├── src/           # React source code
│       │   ├── assets/    # Images, fonts, etc.
│       │   ├── components/# Reusable React components
│       │   ├── pages/     # Page components
│       │   ├── services/  # API service integrations
│       │   ├── utils/     # Utility functions
│       │   ├── App.jsx    # Main App component
│       │   └── main.jsx   # React entry point
│       ├── index.html     # HTML template
│       └── vite.config.js # Vite configuration
├── .env.example          # Example environment variables
├── .eslintrc.js          # ESLint configuration
├── .prettierrc           # Prettier configuration
├── package.json          # Project dependencies and scripts
└── README.md             # Project documentation
```

## Available Scripts

- `npm start` - Start the production server
- `npm run dev` - Start both backend and frontend in development mode
- `npm run dev:backend` - Start only the backend in development mode
- `npm run dev:frontend` - Start only the frontend in development mode
- `npm run build` - Build the frontend for production
- `npm test` - Run tests
- `npm run lint` - Run ESLint to check code quality
- `npm run lint:fix` - Run ESLint and automatically fix issues
- `npm run format` - Format code with Prettier

## API Endpoints

- `GET /api/health` - Health check endpoint
- `GET /api/auth/login` - Initiate OAuth 2.0 authentication flow
- `GET /api/auth/callback` - OAuth 2.0 callback endpoint
- `GET /api/auth/logout` - Logout and clear session
- `GET /api/auth/user` - Get current authenticated user
- `POST /api/auth/refresh` - Refresh authentication token
- `GET /api/roadmap` - Get roadmap data (coming soon)
- `GET /api/bugs` - Get bug reporting data (coming soon)

## Documentation

For detailed information about the project, see the following documentation:

- [Project Specification Summary](./docs/project-specification-summary.md)
- [Technical Architecture](./docs/technical-architecture.md)
- [Data Models](./docs/data-models.md)
- [Implementation Plan](./docs/implementation-plan.md)
- [Testing Strategy](./docs/testing-strategy.md)
- [Developer Specification](./docs/developer-specification.md)

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

[MIT](LICENSE)

# Prestellation Developer Guide

This guide provides detailed information for developers working on the Prestellation project.

## Development Environment Setup

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Git
- Code editor (VS Code recommended)
- Jira API access

### Initial Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/prestellation.git
   cd prestellation
   ```

2. Install dependencies:
   ```bash
   # Install root dependencies
   npm install
   
   # Install frontend dependencies
   cd src/frontend
   npm install
   cd ../..
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env
   # Edit .env with your Jira credentials and settings
   ```

4. Start the development servers:
   ```bash
   npm run dev
   ```

## Code Structure

### Backend (Node.js/Express)

- **server.js**: Main entry point for the Express application
- **routes/**: API route definitions
- **controllers/**: Request handlers for routes
- **models/**: Data models and database interactions
- **middleware/**: Express middleware functions
- **utils/**: Utility functions and helpers

### Frontend (React/Vite)

- **main.jsx**: Entry point for the React application
- **App.jsx**: Main application component
- **components/**: Reusable UI components
- **pages/**: Page-level components
- **services/**: API service integrations
- **utils/**: Utility functions and helpers
- **assets/**: Static assets like images and fonts

## Coding Standards

### General Guidelines

- Use meaningful variable and function names
- Write comments for complex logic
- Keep functions small and focused on a single responsibility
- Follow the DRY (Don't Repeat Yourself) principle

### JavaScript/React

- Use ES6+ features
- Use functional components with hooks
- Use destructuring for props
- Use async/await for asynchronous operations
- Use PropTypes or TypeScript for type checking

### CSS/Styling

- Use Material-UI components and styling system
- Follow BEM naming convention for custom CSS
- Use responsive design principles

## Git Workflow

1. Create a new branch for each feature or bug fix:
   ```bash
   git checkout -b feature/feature-name
   # or
   git checkout -b fix/bug-name
   ```

2. Make your changes and commit them with descriptive messages:
   ```bash
   git add .
   git commit -m "Add feature X" -m "Detailed description of changes"
   ```

3. Push your branch to the remote repository:
   ```bash
   git push origin feature/feature-name
   ```

4. Create a pull request on GitHub

5. After review and approval, merge the pull request

## Testing

### Running Tests

```bash
# Run all tests
npm test

# Run tests with coverage
npm test -- --coverage
```

### Writing Tests

- Write unit tests for utility functions and components
- Write integration tests for API endpoints
- Use Jest for testing
- Use React Testing Library for component tests

## Deployment

### Building for Production

```bash
# Build the frontend
npm run build

# Start the production server
npm start
```

### Environment Variables

The following environment variables should be set in production:

- `NODE_ENV=production`
- `PORT=3000` (or your preferred port)
- `JIRA_API_URL`
- `JIRA_API_TOKEN`
- `JIRA_USERNAME`

## Troubleshooting

### Common Issues

1. **"Module not found" errors**:
   - Make sure all dependencies are installed
   - Check import paths for typos

2. **API connection issues**:
   - Verify Jira API credentials in .env file
   - Check network connectivity
   - Ensure Jira API endpoints are correct

3. **Hot reloading not working**:
   - Restart the development server
   - Check for syntax errors in your code

## Resources

- [React Documentation](https://reactjs.org/docs/getting-started.html)
- [Express Documentation](https://expressjs.com/)
- [Material-UI Documentation](https://mui.com/getting-started/usage/)
- [Jira REST API Documentation](https://developer.atlassian.com/cloud/jira/platform/rest/v3/intro/)

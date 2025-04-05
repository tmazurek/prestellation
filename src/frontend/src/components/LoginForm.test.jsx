import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../contexts/AuthContext';
import LoginForm from './LoginForm';
import authService from '../services/authService';

// Mock the auth service
jest.mock('../services/authService');

describe('LoginForm', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  const renderLoginForm = () => {
    return render(
      <BrowserRouter>
        <AuthProvider>
          <LoginForm />
        </AuthProvider>
      </BrowserRouter>
    );
  };

  it('renders the login form correctly', () => {
    renderLoginForm();
    
    expect(screen.getByText('Sign in with Jira')).toBeInTheDocument();
    expect(screen.getByLabelText(/Jira Email or Username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Jira API Token/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Sign In/i })).toBeInTheDocument();
  });

  it('shows validation errors for empty fields', async () => {
    renderLoginForm();
    
    // Submit the form without filling in any fields
    fireEvent.click(screen.getByRole('button', { name: /Sign In/i }));
    
    await waitFor(() => {
      expect(screen.getByText('Username is required')).toBeInTheDocument();
    });
    
    // Fill in username but not API token
    fireEvent.change(screen.getByLabelText(/Jira Email or Username/i), {
      target: { value: 'test@example.com' }
    });
    
    fireEvent.click(screen.getByRole('button', { name: /Sign In/i }));
    
    await waitFor(() => {
      expect(screen.getByText('API token is required')).toBeInTheDocument();
    });
  });

  it('handles successful login', async () => {
    // Mock the login function to return success
    authService.login.mockResolvedValue({
      success: true,
      message: 'Authentication successful'
    });
    
    authService.getCurrentUser.mockResolvedValue({
      user: {
        username: 'test@example.com',
        displayName: 'Test User'
      }
    });
    
    renderLoginForm();
    
    // Fill in the form
    fireEvent.change(screen.getByLabelText(/Jira Email or Username/i), {
      target: { value: 'test@example.com' }
    });
    
    fireEvent.change(screen.getByLabelText(/Jira API Token/i), {
      target: { value: 'valid-token' }
    });
    
    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /Sign In/i }));
    
    await waitFor(() => {
      expect(authService.login).toHaveBeenCalledWith('test@example.com', 'valid-token');
      expect(authService.getCurrentUser).toHaveBeenCalled();
    });
  });

  it('handles failed login', async () => {
    // Mock the login function to return failure
    authService.login.mockRejectedValue({
      success: false,
      message: 'Invalid credentials'
    });
    
    renderLoginForm();
    
    // Fill in the form
    fireEvent.change(screen.getByLabelText(/Jira Email or Username/i), {
      target: { value: 'test@example.com' }
    });
    
    fireEvent.change(screen.getByLabelText(/Jira API Token/i), {
      target: { value: 'invalid-token' }
    });
    
    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /Sign In/i }));
    
    await waitFor(() => {
      expect(authService.login).toHaveBeenCalledWith('test@example.com', 'invalid-token');
      expect(screen.getByText(/An error occurred during login/i)).toBeInTheDocument();
    });
  });

  it('shows help text when clicking the help link', () => {
    renderLoginForm();
    
    // Initially, help text should not be visible
    expect(screen.queryByText(/To get your Jira API token:/i)).not.toBeInTheDocument();
    
    // Click the help link
    fireEvent.click(screen.getByText(/Need help finding your API token?/i));
    
    // Help text should now be visible
    expect(screen.getByText(/To get your Jira API token:/i)).toBeInTheDocument();
    expect(screen.getByText(/Log in to/i)).toBeInTheDocument();
    
    // Click the help link again to hide the help text
    fireEvent.click(screen.getByText(/Hide help/i));
    
    // Help text should be hidden again
    expect(screen.queryByText(/To get your Jira API token:/i)).not.toBeInTheDocument();
  });
});

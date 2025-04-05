import { createContext, useState, useEffect, useContext } from 'react';
import authService from '../services/authService';

// Create context
const AuthContext = createContext();

/**
 * Authentication provider component
 * @param {Object} props - Component props
 * @returns {JSX.Element} - Provider component
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check authentication status on mount
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        setLoading(true);
        const isAuthenticated = await authService.isAuthenticated();
        
        if (isAuthenticated) {
          const { user } = await authService.getCurrentUser();
          setUser(user);
        }
      } catch (err) {
        console.error('Auth check error:', err);
        setError('Failed to check authentication status');
      } finally {
        setLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  // Set up token refresh interval
  useEffect(() => {
    if (!user) return;

    // Refresh token every 23 hours (assuming 24 hour expiry)
    const refreshInterval = setInterval(async () => {
      try {
        await authService.refreshToken();
      } catch (err) {
        console.error('Token refresh error:', err);
        // Force logout on refresh failure
        handleLogout();
      }
    }, 23 * 60 * 60 * 1000);

    return () => clearInterval(refreshInterval);
  }, [user]);

  /**
   * Handle user login
   * @param {string} username - Jira username or email
   * @param {string} apiToken - Jira API token
   */
  const handleLogin = async (username, apiToken) => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await authService.login(username, apiToken);
      
      if (result.success) {
        const userData = await authService.getCurrentUser();
        setUser(userData.user);
        return { success: true };
      } else {
        setError(result.message || 'Login failed');
        return { success: false, message: result.message };
      }
    } catch (err) {
      const errorMessage = err.message || 'Login failed';
      setError(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle user logout
   */
  const handleLogout = async () => {
    try {
      setLoading(true);
      await authService.logout();
      setUser(null);
    } catch (err) {
      console.error('Logout error:', err);
      setError('Logout failed');
    } finally {
      setLoading(false);
    }
  };

  // Context value
  const value = {
    user,
    loading,
    error,
    isAuthenticated: !!user,
    login: handleLogin,
    logout: handleLogout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Custom hook to use auth context
 * @returns {Object} - Auth context value
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;

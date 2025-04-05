import { createContext, useState, useEffect, useContext } from 'react';
import authService from '../services/authService';

// Create context
const AuthContext = createContext();

/**
 * Authentication provider component for OAuth 2.0
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

    // Refresh token every hour
    const refreshInterval = setInterval(async () => {
      try {
        await authService.refreshToken();
      } catch (err) {
        console.error('Token refresh error:', err);
        // Force logout on refresh failure
        handleLogout();
      }
    }, 60 * 60 * 1000); // Every hour

    return () => clearInterval(refreshInterval);
  }, [user]);

  /**
   * Initiate OAuth login flow
   */
  const initiateLogin = () => {
    setLoading(true);
    setError(null);
    authService.initiateLogin();
  };

  /**
   * Handle user logout
   */
  const handleLogout = () => {
    setLoading(true);
    authService.logout();
    // The page will be redirected, but we'll set user to null just in case
    setUser(null);
  };

  // Context value
  const value = {
    user,
    loading,
    error,
    isAuthenticated: !!user,
    initiateLogin,
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

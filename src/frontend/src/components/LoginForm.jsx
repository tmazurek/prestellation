import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Avatar from '@mui/material/Avatar';
import Link from '@mui/material/Link';

/**
 * Login form component for OAuth 2.0 authentication
 * @returns {JSX.Element} - Login form component
 */
function LoginForm() {
  const { initiateLogin, loading, error } = useAuth();
  const [formError, setFormError] = useState('');
  const location = useLocation();

  // Check for error in URL query parameters
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const errorParam = params.get('error');

    if (errorParam) {
      setFormError(decodeURIComponent(errorParam));
    }
  }, [location]);

  /**
   * Handle login button click
   */
  const handleLogin = () => {
    setFormError('');
    initiateLogin();
  };

  return (
    <Paper elevation={3} sx={{ p: 4, maxWidth: 500, mx: 'auto', mt: 8 }}>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Avatar sx={{ m: 1, bgcolor: 'primary.main' }}>
          <LockOutlinedIcon />
        </Avatar>
        <Typography component="h1" variant="h5" gutterBottom>
          Sign in with Jira
        </Typography>

        {(error || formError) && (
          <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
            {formError || error}
          </Alert>
        )}

        <Typography variant="body1" align="center" paragraph>
          Prestellation uses your Jira account for authentication.
          Click the button below to sign in with your Jira credentials.
        </Typography>

        <Button
          fullWidth
          variant="contained"
          sx={{ mt: 3, mb: 2 }}
          onClick={handleLogin}
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} /> : 'Sign in with Jira'}
        </Button>

        <Box sx={{ mt: 2 }}>
          <Typography variant="body2" color="text.secondary" align="center">
            You will be redirected to Atlassian to authenticate.
            Prestellation does not store your Jira password.
          </Typography>
        </Box>
      </Box>
    </Paper>
  );
}

export default LoginForm;

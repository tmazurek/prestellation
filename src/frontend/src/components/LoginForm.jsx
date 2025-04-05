import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Avatar from '@mui/material/Avatar';
import Link from '@mui/material/Link';

/**
 * Login form component
 * @returns {JSX.Element} - Login form component
 */
function LoginForm() {
  const { login, loading, error } = useAuth();
  const [username, setUsername] = useState('');
  const [apiToken, setApiToken] = useState('');
  const [formError, setFormError] = useState('');
  const [showHelp, setShowHelp] = useState(false);

  /**
   * Handle form submission
   * @param {Event} e - Form submit event
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Form validation
    if (!username.trim()) {
      setFormError('Username is required');
      return;
    }
    
    if (!apiToken.trim()) {
      setFormError('API token is required');
      return;
    }
    
    setFormError('');
    
    try {
      const result = await login(username, apiToken);
      
      if (!result.success) {
        setFormError(result.message || 'Login failed');
      }
    } catch (err) {
      setFormError(err.message || 'An error occurred during login');
    }
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
        
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1, width: '100%' }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="username"
            label="Jira Email or Username"
            name="username"
            autoComplete="email"
            autoFocus
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            disabled={loading}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="apiToken"
            label="Jira API Token"
            type="password"
            id="apiToken"
            autoComplete="current-password"
            value={apiToken}
            onChange={(e) => setApiToken(e.target.value)}
            disabled={loading}
          />
          
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Sign In'}
          </Button>
          
          <Box sx={{ mt: 2 }}>
            <Link
              component="button"
              variant="body2"
              onClick={() => setShowHelp(!showHelp)}
              underline="hover"
            >
              {showHelp ? 'Hide help' : 'Need help finding your API token?'}
            </Link>
            
            {showHelp && (
              <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
                <Typography variant="body2" paragraph>
                  To get your Jira API token:
                </Typography>
                <ol>
                  <li>
                    <Typography variant="body2">
                      Log in to{' '}
                      <Link
                        href="https://id.atlassian.com/manage/api-tokens"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Atlassian API tokens page
                      </Link>
                    </Typography>
                  </li>
                  <li>
                    <Typography variant="body2">
                      Click "Create API token"
                    </Typography>
                  </li>
                  <li>
                    <Typography variant="body2">
                      Enter a label (e.g., "Prestellation App")
                    </Typography>
                  </li>
                  <li>
                    <Typography variant="body2">
                      Click "Create" and copy your token
                    </Typography>
                  </li>
                </ol>
              </Box>
            )}
          </Box>
        </Box>
      </Box>
    </Paper>
  );
}

export default LoginForm;

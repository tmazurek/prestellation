import { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CircularProgress from '@mui/material/CircularProgress';

function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [apiStatus, setApiStatus] = useState(null);

  useEffect(() => {
    // Check API health
    const checkApiHealth = async () => {
      try {
        const response = await fetch('/api/health');
        const data = await response.json();
        setApiStatus(data);
      } catch (error) {
        console.error('Error checking API health:', error);
        setApiStatus({ status: 'error', message: 'Could not connect to API' });
      } finally {
        setLoading(false);
      }
    };

    checkApiHealth();
  }, []);

  return (
    <Box sx={{ flexGrow: 1, mt: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Prestellation Dashboard
      </Typography>
      <Typography variant="subtitle1" gutterBottom>
        Executive-friendly Jira data visualization
      </Typography>

      <Grid container spacing={3} sx={{ mt: 2 }}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" component="h2" gutterBottom>
              API Status
            </Typography>
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                <CircularProgress />
              </Box>
            ) : (
              <Card variant="outlined">
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Status: {apiStatus?.status || 'Unknown'}
                  </Typography>
                  <Typography variant="body2" component="p">
                    {apiStatus?.message || 'No message available'}
                  </Typography>
                </CardContent>
              </Card>
            )}
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" component="h2" gutterBottom>
              Getting Started
            </Typography>
            <Typography variant="body1" paragraph>
              Welcome to Prestellation! This dashboard will help you visualize your Jira data in an executive-friendly format.
            </Typography>
            <Typography variant="body2">
              To get started, you'll need to:
            </Typography>
            <ul>
              <li>Log in with your Jira credentials</li>
              <li>Select a project to visualize</li>
              <li>Choose between roadmap or bug reporting views</li>
            </ul>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}

export default Dashboard;

import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  Grid,
  Card,
  CardContent,
  IconButton,
  AppBar,
  Toolbar,
  Menu,
  MenuItem,
} from '@mui/material';
import {
  ContentCopy,
  Delete,
  AccountCircle,
  Logout,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { urlService } from '../services/urlService';
import { authService } from '../services/authService';

const Dashboard = () => {
  const [originalUrl, setOriginalUrl] = useState('');
  const [customCode, setCustomCode] = useState('');
  const [urls, setUrls] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const navigate = useNavigate();

  const currentUser = authService.getCurrentUser();

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      navigate('/login');
      return;
    }
    fetchUrls();
  }, [navigate]);

  const fetchUrls = async () => {
    try {
      const response = await urlService.getMyUrls();
      setUrls(response.urls);
    } catch (err) {
      setError('Failed to fetch URLs');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const request = {
        originalUrl,
        ...(customCode && { customCode }),
      };
      
      const newUrl = await urlService.shortenUrl(request);
      setUrls([newUrl, ...urls]);
      setOriginalUrl('');
      setCustomCode('');
      setSuccess('URL shortened successfully!');
    } catch (err) {
      console.log('Dashboard error:', err); // Debug log
      console.log('Error message:', err.message); // Debug log
      setError(err.message || err.toString() || 'Failed to shorten URL');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (url) => {
    navigator.clipboard.writeText(url);
    setSuccess('URL copied to clipboard!');
  };

  const handleDelete = async (id) => {
    try {
      await urlService.deleteUrl(id);
      setUrls(urls.filter(url => url.id !== id));
      setSuccess('URL deleted successfully!');
    } catch (err) {
      setError('Failed to delete URL');
    }
  };

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            URL Shortener
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography variant="body2" sx={{ mr: 2 }}>
              Welcome, {currentUser?.firstName}!
            </Typography>
            <IconButton
              size="large"
              aria-label="account menu"
              aria-controls="account-menu"
              aria-haspopup="true"
              onClick={handleMenuOpen}
              color="inherit"
            >
              <AccountCircle />
            </IconButton>
            <Menu
              id="account-menu"
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
            >
              <MenuItem onClick={handleLogout}>
                <Logout fontSize="small" sx={{ mr: 1 }} />
                Logout
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Paper elevation={3} sx={{ p: 4, mb: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom align="center">
            Create Short URL
          </Typography>

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Original URL"
              value={originalUrl}
              onChange={(e) => setOriginalUrl(e.target.value)}
              margin="normal"
              required
              placeholder="https://example.com"
            />
            <TextField
              fullWidth
              label="Custom Code (optional)"
              value={customCode}
              onChange={(e) => setCustomCode(e.target.value)}
              margin="normal"
              placeholder="my-custom-code"
              helperText="Leave empty for auto-generated code"
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={loading}
            >
              {loading ? 'Shortening...' : 'Shorten URL'}
            </Button>
          </form>
        </Paper>

        <Typography variant="h5" component="h2" gutterBottom>
          Your URLs
        </Typography>

        <Grid container spacing={3}>
          {urls.map((url) => (
            <Grid item xs={12} md={6} key={url.id}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Typography variant="h6" component="div" noWrap sx={{ flexGrow: 1, mr: 1 }}>
                      {url.shortCode}
                    </Typography>
                  </Box>
                  
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    <strong>Original:</strong> {url.originalUrl}
                  </Typography>
                  
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    <strong>Short URL:</strong> {url.shortUrl}
                  </Typography>
                  
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    <strong>Clicks:</strong> {url.clickCount}
                  </Typography>
                  
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    <strong>Created:</strong> {new Date(url.createdAt).toLocaleDateString()}
                  </Typography>

                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                    <IconButton
                      size="small"
                      onClick={() => handleCopy(url.shortUrl)}
                      title="Copy URL"
                    >
                      <ContentCopy />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleDelete(url.id)}
                      title="Delete"
                      color="error"
                    >
                      <Delete />
                    </IconButton>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {urls.length === 0 && (
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="body1" color="text.secondary">
              No URLs created yet. Create your first short URL above!
            </Typography>
          </Paper>
        )}
      </Container>
    </>
  );
};

export default Dashboard;

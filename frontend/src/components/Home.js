import React, { useState } from 'react';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
} from '@mui/material';
import { Link } from 'react-router-dom';
import { urlService } from '../services/urlService';

const Home = () => {
  const [originalUrl, setOriginalUrl] = useState('');
  const [shortenedUrl, setShortenedUrl] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setShortenedUrl(null);

    try {
      const request = { originalUrl };
      const result = await urlService.shortenUrl(request);
      setShortenedUrl(result);
      setOriginalUrl('');
    } catch (err) {
      setError(err.message || 'Failed to shorten URL');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (shortenedUrl) {
      navigator.clipboard.writeText(shortenedUrl.shortUrl);
    }
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Typography variant="h2" component="h1" gutterBottom align="center">
          URL Shortener
        </Typography>
        
        <Typography variant="h6" component="p" gutterBottom align="center" color="text.secondary">
          Shorten your long URLs quickly and easily
        </Typography>

        <Paper elevation={3} sx={{ p: 4, width: '100%', maxWidth: 600, mt: 4 }}>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          
          {shortenedUrl && (
            <Alert severity="success" sx={{ mb: 2 }}>
              <Typography variant="body2" gutterBottom>
                <strong>Short URL:</strong> {shortenedUrl.shortUrl}
              </Typography>
              <Button size="small" onClick={handleCopy} variant="outlined">
                Copy URL
              </Button>
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Enter your URL"
              value={originalUrl}
              onChange={(e) => setOriginalUrl(e.target.value)}
              margin="normal"
              required
              placeholder="https://example.com/very/long/url/to/shorten"
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              sx={{ mt: 3, mb: 2 }}
              disabled={loading}
            >
              {loading ? 'Shortening...' : 'Shorten URL'}
            </Button>
          </form>
        </Paper>

        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Typography variant="body1" gutterBottom>
            Want to track your URLs and get analytics?
          </Typography>
          <Button component={Link} to="/login" variant="outlined" sx={{ mr: 2 }}>
            Sign In
          </Button>
          <Button component={Link} to="/register" variant="contained">
            Sign Up
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default Home;

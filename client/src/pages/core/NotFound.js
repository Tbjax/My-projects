import React from 'react';
import { Box, Button, Container, Typography, Paper } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { SentimentVeryDissatisfied as SadIcon } from '@mui/icons-material';

/**
 * 404 Not Found page component
 * Displayed when a user navigates to a non-existent route
 * 
 * @returns {JSX.Element} - The not found page component
 */
const NotFound = () => {
  return (
    <Container maxWidth="md">
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '80vh',
        }}
      >
        <Paper
          elevation={3}
          sx={{
            p: 5,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            maxWidth: 600,
            width: '100%',
          }}
        >
          <SadIcon sx={{ fontSize: 100, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h1" component="h1" align="center" gutterBottom>
            404
          </Typography>
          <Typography variant="h4" component="h2" align="center" gutterBottom>
            Page Not Found
          </Typography>
          <Typography variant="body1" align="center" color="text.secondary" paragraph sx={{ mb: 4 }}>
            The page you are looking for might have been removed, had its name changed,
            or is temporarily unavailable.
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'center' }}>
            <Button
              variant="contained"
              color="primary"
              component={RouterLink}
              to="/"
              size="large"
            >
              Go to Dashboard
            </Button>
            <Button
              variant="outlined"
              color="primary"
              onClick={() => window.history.back()}
              size="large"
            >
              Go Back
            </Button>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default NotFound;

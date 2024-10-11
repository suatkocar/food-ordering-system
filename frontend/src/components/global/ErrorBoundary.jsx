import React from 'react';
import { Box, Typography, Button } from '@mui/material';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ error, errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <Box
          display="flex"
          flexDirection="column"
          justifyContent="center"
          alignItems="center"
          minHeight="100vh"
          padding={3}
          textAlign="center"
        >
          <Typography variant="h4" gutterBottom>
            Oops! Something went wrong.
          </Typography>
          <Typography variant="body1" paragraph>
            We're sorry for the inconvenience. Please try refreshing the page or contact support if the problem persists.
          </Typography>
          {process.env.NODE_ENV === 'development' && (
            <Box mt={2}>
              <Typography variant="h6">Error Details:</Typography>
              <pre>{this.state.error && this.state.error.toString()}</pre>
              <Typography variant="h6">Component Stack:</Typography>
              <pre>{this.state.errorInfo && this.state.errorInfo.componentStack}</pre>
            </Box>
          )}
          <Button
            variant="contained"
            color="primary"
            onClick={() => window.location.reload()}
            style={{ marginTop: '20px' }}
          >
            Refresh Page
          </Button>
        </Box>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

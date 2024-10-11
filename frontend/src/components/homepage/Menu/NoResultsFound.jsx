import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import SearchOffIcon from '@mui/icons-material/SearchOff';

const NoResultsFound = React.memo(function NoResultsFound({ searchQuery, onClearSearch }) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        py: 4,
        maxWidth: '600px',
        maxHeight: '100px',
        margin: '0 auto',
      }}
    >
      <SearchOffIcon sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
      <Typography variant="h6" gutterBottom>
        No results found for "{searchQuery}"
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        We couldn't find any products matching your search. Please try different keywords or browse our categories.
      </Typography>
      <Button variant="contained" color="primary" onClick={onClearSearch} size="medium">
        Clear Search
      </Button>
    </Box>
  );
});

export default NoResultsFound;

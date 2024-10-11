import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import CustomizedDataGrid from './CustomizedDataGrid';

const ControlPanel = React.memo(() => {
  return (
    <Box sx={{ width: '100%', maxWidth: { sm: '100%', md: '1700px' }, margin: '0 auto' }}>
      <Grid container spacing={2} columns={14}>
        <Grid item xs={14} md={14} lg={14}>
          <CustomizedDataGrid />
        </Grid>
      </Grid>
    </Box>
  );
});

export default ControlPanel;

import React from 'react';
import PropTypes from 'prop-types';
import { Box, Button } from '@mui/material';

const NavigationButtons = ({ handleScrollTo }) => {
  return (
    <Box
      sx={{
        position: 'absolute',
        left: '50%',
        transform: 'translateX(-50%)',
        display: { xs: 'none', md: 'flex' },
        gap: 2,
      }}
    >
      <Button
        variant='text'
        color='info'
        size='small'
        onClick={() => handleScrollTo('home')}
      >
        Home
      </Button>
      <Button
        variant='text'
        color='info'
        size='small'
        onClick={() => handleScrollTo('menu')}
      >
        Menu
      </Button>
    </Box>
  );
};

NavigationButtons.propTypes = {
  handleScrollTo: PropTypes.func.isRequired,
};

export default NavigationButtons;

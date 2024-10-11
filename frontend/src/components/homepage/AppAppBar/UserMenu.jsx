import React, { forwardRef } from 'react';
import PropTypes from 'prop-types';
import { Box, List, ListItem, ListItemText, Divider, Button, Grow } from '@mui/material';
import { styled } from '@mui/material/styles';
import { Link } from 'react-router-dom';

const UserMenuContainer = styled(Box)(({ theme }) => ({
  p: 2,
  position: 'absolute',
  top: '56px',
  right: 0,
  minWidth: '200px',
  backgroundColor: theme.palette.background.paper,
  boxShadow: 3,
  borderRadius: `calc(${theme.shape.borderRadius}px + 8px)`,
  zIndex: theme.zIndex.modal,
}));

const UserMenu = forwardRef(({ userMenuOpen, user, handleLogout, theme }, ref) => {
  return (
    <Grow in={userMenuOpen} style={{ transformOrigin: 'top center' }} timeout={300}>
      <UserMenuContainer ref={ref}>
        <List sx={{ mb: -2 }}>
          <ListItem
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <ListItemText
              primary={user.name}
              secondary={user.email}
              sx={{
                textAlign: 'center',
                '& .MuiListItemText-primary': {
                  fontSize: '1.1rem',
                  color: theme.palette.text.primary,
                  marginBottom: theme.spacing(1),
                },
                '& .MuiListItemText-secondary': {
                  color: theme.palette.text.secondary,
                },
              }}
            />
          </ListItem>
        </List>
        <Divider sx={{ my: 1 }} />

        {user.role === 'admin' ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
            <Button
              variant='contained'
              color='secondary'
              component={Link}
              to='/admin-dashboard'
              sx={{ width: '90%', textTransform: 'none', mb: 0 }}
            >
              Dashboard
            </Button>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
            <Button
              variant='contained'
              color='secondary'
              component={Link}
              to='/customer-dashboard'
              sx={{ width: '90%', textTransform: 'none', mb: 0 }}
            >
              Dashboard
            </Button>
          </Box>
        )}

        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
          <Button
            variant='contained'
            color='primary'
            onClick={handleLogout}
            sx={{ width: '90%', textTransform: 'none', mb: 2 }}
          >
            Logout
          </Button>
        </Box>
      </UserMenuContainer>
    </Grow>
  );
});

UserMenu.propTypes = {
  userMenuOpen: PropTypes.bool.isRequired,
  user: PropTypes.object.isRequired,
  handleLogout: PropTypes.func.isRequired,
  theme: PropTypes.object.isRequired,
};

export default UserMenu;

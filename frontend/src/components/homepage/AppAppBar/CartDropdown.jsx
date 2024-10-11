import React, { forwardRef } from 'react';
import PropTypes from 'prop-types';
import { Box, List, ListItem, ListItemText, IconButton, Divider, Button, Typography, Grow } from '@mui/material';
import { Remove as RemoveIcon, Add as AddIcon } from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';

const CartContainer = styled(Box)(({ theme }) => ({
  p: 2,
  position: 'absolute',
  top: '64px',
  right: 0,
  width: '330px',
  maxHeight: 'calc(100vh - 100px)',
  overflowY: 'auto',
  backgroundColor: theme.palette.background.paper,
  boxShadow: 3,
  borderRadius: `calc(${theme.shape.borderRadius}px + 8px)`,
  zIndex: theme.zIndex.modal,
}));

const CartDropdown = forwardRef(({
  cartOpen,
  cart,
  increaseQuantity,
  decreaseQuantity,
  calculateTotalPrice,
  handleProceedToCheckout,
  placeholderImage = 'https://picsum.photos/200',
  theme,
}, ref) => {
  const navigate = useNavigate();

  return (
    <Grow in={cartOpen} style={{ transformOrigin: 'top center' }} timeout={300}>
      <CartContainer ref={ref}>
        {Object.keys(cart).length === 0 && (
          <Box sx={{ textAlign: 'center', py: 2, mt: 5 }}>
            <Typography
              variant="body1"
              color="text.secondary"
              sx={{ fontWeight: 'bold', fontSize: '1.1rem' }}
            >
              Your cart is empty.
            </Typography>
          </Box>
        )}
        <List>
          {Object.keys(cart).map((productID) => {
            const product = cart[productID];
            const dynamicPrice = parseFloat(product.DynamicPrice) || 0;

            return (
              <ListItem key={productID}>
                <img
                  src={product.image || placeholderImage}
                  alt={product.Name}
                  style={{ width: 50, height: 50, marginRight: 8 }}
                />
                <ListItemText
                  primary={product.Name}
                  secondary={`£${dynamicPrice.toFixed(2)} x ${product.quantity}`}
                  primaryTypographyProps={{
                    style: { color: theme.palette.text.primary },
                  }}
                  secondaryTypographyProps={{
                    style: { color: theme.palette.text.secondary },
                  }}
                />
                <IconButton onClick={() => decreaseQuantity(productID)}>
                  <RemoveIcon />
                </IconButton>
                <IconButton
                  style={{ marginLeft: 4 }}
                  onClick={() => increaseQuantity(productID)}
                >
                  <AddIcon />
                </IconButton>
              </ListItem>
            );
          })}
        </List>

        <Divider sx={{ my: 2 }} />
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            px: 2,
            py: 1,
          }}
        >
          <Box
            sx={{
              fontWeight: 'bold',
              color: theme.palette.text.primary,
              marginLeft: 2,
              fontSize: '1.1rem',
            }}
          >
            Total :
          </Box>
          <Box
            sx={{
              fontWeight: 'bold',
              color: '#0DCB81',
              marginRight: 2,
              fontSize: '1.1rem',
            }}
          >
            {`£${calculateTotalPrice(cart)}`}
          </Box>
        </Box>
        {Object.keys(cart).length > 0 && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleProceedToCheckout}
              sx={{ width: '60%', textTransform: 'none', mb: 2 }}
            >
              Proceed to Checkout
            </Button>
          </Box>
        )}
      </CartContainer>
    </Grow>
  );
});

CartDropdown.propTypes = {
  cartOpen: PropTypes.bool.isRequired,
  cart: PropTypes.object.isRequired,
  increaseQuantity: PropTypes.func.isRequired,
  decreaseQuantity: PropTypes.func.isRequired,
  calculateTotalPrice: PropTypes.func.isRequired,
  handleProceedToCheckout: PropTypes.func.isRequired,
  placeholderImage: PropTypes.string,
  theme: PropTypes.object.isRequired,
};

export default CartDropdown;

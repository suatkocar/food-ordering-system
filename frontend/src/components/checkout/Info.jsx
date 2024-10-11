import React from 'react';
import PropTypes from 'prop-types';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';
import { Box, IconButton } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import { useDispatch } from 'react-redux';
import { addItem, removeItem } from '../../redux/slices/cartSlice';
import axiosInstance from '../../api/axiosInstance';
import { useNavigate } from 'react-router-dom';

function Info({ cart = {}, totalPrice = '0.00' }) {  
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const placeholderImage = "https://picsum.photos/200";

  const increaseQuantity = async (productID) => {
    const product = cart[productID];
    if (product) {
      dispatch(addItem({ productId: productID, product }));
      
      try {
        await axiosInstance.post(`/cart`, {
          productId: productID,
          quantity: 1
        });
      } catch (error) {
        console.error("Error increasing product quantity:", error);
      }
    }
  };

  const decreaseQuantity = async (productID) => {
    const product = cart[productID];
    if (product) {
      if (product.quantity > 1) {
        dispatch(removeItem({ productId: productID }));
        
        try {
          await axiosInstance.put(`/cart`, {
            productId: productID,
            quantity: product.quantity - 1
          });
        } catch (error) {
          console.error("Error decreasing product quantity:", error);
        }
      } else {
        dispatch(removeItem({ productId: productID }));
        
        try {
          await axiosInstance.delete(`/cart`, {
            data: { productId: productID }
          });
        } catch (error) {
          console.error("Error removing product from cart:", error);
        }

        if (Object.keys(cart).length === 1) {
          navigate('/');
        }
      }
    }
  };

  return (
    <React.Fragment>
      <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
        Total
      </Typography>
      <Typography variant="h4" sx={{ color: 'text.secondary' }} gutterBottom>
        {totalPrice}
      </Typography>
      <List disablePadding>
        {Object.keys(cart).map((productID) => {
          const product = cart[productID];
          if (!product) return null;

          const dynamicPrice = parseFloat(product.DynamicPrice) || 0;

          return (
            <ListItem key={productID} sx={{ py: 1, px: 0, display: 'flex', alignItems: 'center' }}>
              <Box component="img"
                src={product.image || placeholderImage}
                alt={product.Name}
                sx={{ width: 50, height: 50, marginRight: 2 }}
              />
              <ListItemText
                primary={product.Name}
                secondary={`£${dynamicPrice.toFixed(2)} x ${product.quantity}`}
                sx={{ marginRight: 2 }}
              />
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <IconButton onClick={() => decreaseQuantity(productID)}>
                  <RemoveIcon />
                </IconButton>
                <IconButton onClick={() => increaseQuantity(productID)}>
                  <AddIcon />
                </IconButton>
              </Box>
            </ListItem>
          );
        })}
      </List>
    </React.Fragment>
  );
}

Info.propTypes = {
  cart: PropTypes.object,
  totalPrice: PropTypes.string.isRequired,
};

export default Info;

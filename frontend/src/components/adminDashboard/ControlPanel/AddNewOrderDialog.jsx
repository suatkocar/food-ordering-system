import React from 'react';
import { Dialog, DialogContent, DialogActions, Button, TextField, Typography, Box } from '@mui/material';
import { styled } from '@mui/material/styles';

const commonTextFieldSx = {
  '& label': {
    transform: 'translate(10px, 10px)',
  },
  '& label.MuiInputLabel-shrink': {
    transform: 'translate(0, -26px)',
  },
};

const AddNewOrderDialog = ({
  open,
  handleClose,
  newOrder,
  handleNewOrderChange,
  handleAddNewOrder,
}) => {
  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogContent>
        <Box display="flex" flexDirection="column" gap={2}>
          <Typography variant="h6" align="center">
            Add New Order
          </Typography>

          {/* Customer ID */}
          <TextField
            label="Customer ID"
            name="CustomerID"
            value={newOrder.CustomerID}
            onChange={handleNewOrderChange}
            fullWidth
            margin="normal"
            sx={commonTextFieldSx}
          />

          {/* Product ID */}
          <TextField
            label="Product ID"
            name="ProductID"
            value={newOrder.ProductID}
            onChange={handleNewOrderChange}
            fullWidth
            margin="normal"
            sx={commonTextFieldSx}
          />

          {/* Quantity */}
          <TextField
            label="Quantity"
            name="Quantity"
            type="number"
            value={newOrder.Quantity}
            onChange={handleNewOrderChange}
            fullWidth
            margin="normal"
            sx={commonTextFieldSx}
            inputProps={{ min: 1 }}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} color="secondary">
          Cancel
        </Button>
        <Button onClick={handleAddNewOrder} color="primary" variant="contained">
          Add Order
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddNewOrderDialog;

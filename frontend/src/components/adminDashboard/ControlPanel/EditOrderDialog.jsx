import React from 'react';
import { Dialog, DialogContent, DialogActions, Button, TextField, Typography, Box, Select, MenuItem } from '@mui/material';
import { styled } from '@mui/material/styles';

const commonTextFieldSx = {
  '& label': {
    transform: 'translate(10px, 10px)',
  },
  '& label.MuiInputLabel-shrink': {
    transform: 'translate(0, -26px)',
  },
};

const FormContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(2),
}));

const orderStatusOptions = [
  "Pending",
  "Processing",
  "Shipped",
  "Delivered",
  "Cancelled",
];

const EditOrderDialog = ({
  open,
  handleClose,
  orderData,
  handleOrderChange,
  handleSaveOrder,
}) => {
  if (!orderData) return null;

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogContent>
        <FormContainer>
          <Typography variant="h6" align="center">
            Edit Order
          </Typography>

          <TextField
            label="Order ID"
            name="OrderID"
            value={orderData.OrderID}
            fullWidth
            margin="normal"
            sx={commonTextFieldSx}
            InputProps={{
              readOnly: true,
            }}
          />

          <TextField
            label="Customer ID"
            name="CustomerID"
            value={orderData.CustomerID}
            onChange={handleOrderChange}
            fullWidth
            margin="normal"
            sx={commonTextFieldSx}
          />

          <Select
            label="Order Status"
            name="OrderStatus"
            value={orderData.OrderStatus}
            onChange={handleOrderChange}
            fullWidth
            margin="normal"
            sx={commonTextFieldSx}
          >
            {orderStatusOptions.map((option) => (
              <MenuItem key={option} value={option}>
                {option}
              </MenuItem>
            ))}
          </Select>
        </FormContainer>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} color="secondary">
          Cancel
        </Button>
        <Button onClick={handleSaveOrder} color="primary" variant="contained">
          Save Changes
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditOrderDialog;

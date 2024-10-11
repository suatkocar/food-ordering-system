import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  Box,
} from '@mui/material';
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

const EditCustomerDialog = ({
  open,
  handleClose,
  customer,
  handleCustomerChange,
  handleSaveCustomer,
}) => {
  if (!customer) return null;

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogContent>
        <FormContainer>
          <Typography variant="h6" align="center">
            Edit Customer
          </Typography>

          {/* Customer Name */}
          <TextField
            label="Name"
            name="Name"
            value={customer.Name}
            onChange={handleCustomerChange}
            fullWidth
            margin="normal"
            sx={commonTextFieldSx}
          />

          {/* Customer Email */}
          <TextField
            label="Email"
            name="Email"
            type="email"
            value={customer.Email}
            onChange={handleCustomerChange}
            fullWidth
            margin="normal"
            sx={commonTextFieldSx}
          />

          {/* Customer Address */}
          <TextField
            label="Address"
            name="Address"
            value={customer.Address}
            onChange={handleCustomerChange}
            fullWidth
            margin="normal"
            multiline
            rows={3}
            sx={commonTextFieldSx}
          />

          {/* Customer Phone */}
          <TextField
            label="Phone"
            name="Phone"
            type="tel"
            value={customer.Phone}
            onChange={handleCustomerChange}
            fullWidth
            margin="normal"
            sx={commonTextFieldSx}
          />
        </FormContainer>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} color="secondary">
          Cancel
        </Button>
        <Button onClick={handleSaveCustomer} color="primary" variant="contained">
          Save Changes
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditCustomerDialog;

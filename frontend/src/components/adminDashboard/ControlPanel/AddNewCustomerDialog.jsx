import React from "react";
import {
  Dialog,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  Box,
} from "@mui/material";
import { styled } from "@mui/material/styles";

const commonTextFieldSx = {
  "& label": {
    transform: "translate(10px, 10px)",
  },
  "& label.MuiInputLabel-shrink": {
    transform: "translate(0, -26px)",
  },
};

const FormContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing(2),
}));

const AddNewCustomerDialog = ({
  open,
  handleClose,
  newCustomer,
  handleNewCustomerChange,
  handleAddNewCustomer,
}) => {
  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogContent>
        <FormContainer>
          <Typography variant="h6" align="center">
            Add New Customer
          </Typography>

          {/* Customer Name */}
          <TextField
            label="Name"
            name="Name"
            value={newCustomer.Name}
            onChange={handleNewCustomerChange}
            fullWidth
            margin="normal"
            sx={commonTextFieldSx}
          />

          {/* Customer Email */}
          <TextField
            label="Email"
            name="Email"
            type="email"
            value={newCustomer.Email}
            onChange={handleNewCustomerChange}
            fullWidth
            margin="normal"
            sx={commonTextFieldSx}
          />

          {/* Customer Address */}
          <TextField
            label="Address"
            name="Address"
            value={newCustomer.Address}
            onChange={handleNewCustomerChange}
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
            value={newCustomer.Phone}
            onChange={handleNewCustomerChange}
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
        <Button
          onClick={handleAddNewCustomer}
          color="primary"
          variant="contained"
        >
          Add Customer
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddNewCustomerDialog;

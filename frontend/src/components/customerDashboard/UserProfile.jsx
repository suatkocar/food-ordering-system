import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { updateCustomer } from "../../redux/slices/customerSlice";
import Grid from "@mui/material/Grid";
import FormLabel from "@mui/material/FormLabel";
import OutlinedInput from "@mui/material/OutlinedInput";
import FormHelperText from "@mui/material/FormHelperText";
import Button from '@mui/material/Button';
import { useSnackbar } from 'notistack';
import { styled } from "@mui/system";
import Box from "@mui/material/Box";

const FormGrid = styled(Grid)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  width: "100%",
}));

const CenteredForm = styled('div')({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  minHeight: '70vh',
  padding: '20px',
});

export default function CustomerProfile() {
  const user = useSelector((state) => state.user.user);
  const dispatch = useDispatch();
  const { status } = useSelector((state) => state.customers);
  const { enqueueSnackbar } = useSnackbar();

  const [formData, setFormData] = useState({
    Name: "",
    Email: "",
    Address: "",
    Phone: "",
  });

  const [errors, setErrors] = useState({
    Name: false,
    Email: false,
    Address: false,
    Phone: false,
  });

  useEffect(() => {
    if (user) {
      setFormData({
        Name: user.name || "",
        Email: user.email || "",
        Address: user.address || "",
        Phone: user.phone || "",
      });
    }
  }, [user]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));

    setErrors((prevErrors) => ({
      ...prevErrors,
      [name]: value.trim() === "",
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    dispatch(updateCustomer({ id: user.id, ...formData })).then((result) => {
      if (result.type === "customers/updateCustomer/fulfilled") {
        enqueueSnackbar("Profile updated successfully", { variant: "success" });
      } else {
        enqueueSnackbar(result.payload?.message || "Failed to update profile", { variant: "error" });
      }
    });
  };

  return (
    <CenteredForm sx={{width: "100%"}}>
      <Box sx={{ maxWidth: "500px", width: "100%" }}>
        <form onSubmit={handleSubmit}>
          <FormGrid container spacing={3}>
            <FormGrid item xs={12}>
              <FormLabel htmlFor="Name" required>
                Name
              </FormLabel>
              <OutlinedInput
                id="Name"
                name="Name"
                value={formData.Name}
                onChange={handleChange}
                size="small"
                fullWidth
                error={errors.Name}
              />
              {errors.Name && (
                <FormHelperText error>
                  Name is required.
                </FormHelperText>
              )}
            </FormGrid>

            <FormGrid item xs={12}>
              <FormLabel htmlFor="Email" required>
                Email
              </FormLabel>
              <OutlinedInput
                id="Email"
                name="Email"
                value={formData.Email}
                onChange={handleChange}
                size="small"
                fullWidth
                error={errors.Email}
              />
              {errors.Email && (
                <FormHelperText error>
                  Email is required.
                </FormHelperText>
              )}
            </FormGrid>

            <FormGrid item xs={12}>
              <FormLabel htmlFor="Address" required>
                Address
              </FormLabel>
              <OutlinedInput
                id="Address"
                name="Address"
                value={formData.Address}
                onChange={handleChange}
                size="small"
                fullWidth
                multiline
                rows={0}
                error={errors.Address}
              />
              {errors.Address && (
                <FormHelperText error>
                  Address is required.
                </FormHelperText>
              )}
            </FormGrid>

            <FormGrid item xs={12}>
              <FormLabel htmlFor="Phone" required>
                Phone
              </FormLabel>
              <OutlinedInput
                id="Phone"
                name="Phone"
                value={formData.Phone}
                onChange={handleChange}
                size="small"
                fullWidth
                error={errors.Phone}
              />
              {errors.Phone && (
                <FormHelperText error>
                  Phone is required.
                </FormHelperText>
              )}
            </FormGrid>

            <FormGrid item xs={12}>
              <Button 
                type="submit" 
                variant="contained" 
                color="primary"
                fullWidth
              >
                Save Changes
              </Button>
            </FormGrid>
          </FormGrid>
        </form>
      </Box>
    </CenteredForm>
  );
}

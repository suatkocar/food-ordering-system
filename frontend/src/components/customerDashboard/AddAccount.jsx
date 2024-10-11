import * as React from "react";
import Grid from "@mui/material/Grid2";
import FormLabel from "@mui/material/FormLabel";
import OutlinedInput from "@mui/material/OutlinedInput";
import FormHelperText from "@mui/material/FormHelperText";
import { styled } from "@mui/system";
import { useDispatch, useSelector } from "react-redux";
import { createUser } from "../../redux/slices/userSlice";
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Button from '@mui/material/Button';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';

const FormGrid = styled(Grid)(() => ({
  display: "flex",
  flexDirection: "column",
}));

const CenteredForm = styled('div')({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  height: '70vh',
});

export default function AddAccount() {
  const dispatch = useDispatch();
  const { status, error } = useSelector((state) => state.user);

  const [formData, setFormData] = React.useState({
    name: "",
    email: "",
    password: "",
    role: "admin",
  });

  const [errors, setErrors] = React.useState({
    name: false,
    email: false,
    password: false,
  });

  const [open, setOpen] = React.useState(false);
  const [alertMessage, setAlertMessage] = React.useState("");

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
    if (!formData.name.trim() || !formData.email.trim() || !formData.password.trim() || formData.password.length < 6) {
      setErrors({
        name: !formData.name.trim(),
        email: !formData.email.trim(),
        password: !formData.password.trim() || formData.password.length < 6,
      });
      return;
    }
    dispatch(createUser(formData)).then((result) => {
      if (result.type === "user/createUser/fulfilled") {
        setAlertMessage("User created successfully");
        setOpen(true);
        setFormData({
          name: "",
          email: "",
          password: "",
          role: "admin",
        });
      } else {
        setAlertMessage(result.payload.message || "Failed to create user");
        setOpen(true);
      }
    });
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <CenteredForm>
      <form onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          <FormGrid size={{ xs: 12 }}>
            <FormLabel htmlFor="name" required>
              Name
            </FormLabel>
            <OutlinedInput
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              size="small"
              error={errors.name}
            />
            {errors.name && (
              <FormHelperText error>
                Name is required.
              </FormHelperText>
            )}
          </FormGrid>
          <FormGrid size={{ xs: 12 }}>
            <FormLabel htmlFor="email" required>
              Email
            </FormLabel>
            <OutlinedInput
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              size="small"
              error={errors.email}
            />
            {errors.email && (
              <FormHelperText error>
                Email is required.
              </FormHelperText>
            )}
          </FormGrid>
          <FormGrid size={{ xs: 12 }}>
            <FormLabel htmlFor="password" required>
              Password
            </FormLabel>
            <OutlinedInput
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              size="small"
              error={errors.password}
            />
            {errors.password && (
              <FormHelperText error>
                Password is required and must be at least 6 characters long.
              </FormHelperText>
            )}
          </FormGrid>
          <FormGrid size={{ xs: 12 }}>
            <FormLabel htmlFor="role" required>
              Role
            </FormLabel>
            <Select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleChange}
              size="small"
            >
              <MenuItem value="admin">Admin</MenuItem>
            </Select>
          </FormGrid>
          <FormGrid size={{ xs: 12 }}>
            <Button type="submit" variant="contained" color="primary">
              Add Account
            </Button>
          </FormGrid>
        </Grid>
        <Snackbar
          open={open}
          autoHideDuration={6000}
          onClose={handleClose}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          <Alert onClose={handleClose} severity={status === "succeeded" ? "success" : "error"} sx={{ width: '100%' }}>
            {alertMessage}
          </Alert>
        </Snackbar>
      </form>
    </CenteredForm>
  );
}

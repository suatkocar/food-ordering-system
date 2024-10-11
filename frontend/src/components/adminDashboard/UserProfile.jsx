import * as React from "react";
import Grid from "@mui/material/Grid";
import FormLabel from "@mui/material/FormLabel";
import OutlinedInput from "@mui/material/OutlinedInput";
import FormHelperText from "@mui/material/FormHelperText";
import { styled } from "@mui/system";
import { useSelector, useDispatch } from "react-redux";
import { updateUser } from "../../redux/slices/userSlice";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import Button from "@mui/material/Button";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";

const FormGrid = styled(Grid)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  width: "100%",
}));

const CenteredForm = styled("div")({
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  minHeight: "70vh",
  padding: "20px",
});

export default function UserProfile() {
  const user = useSelector((state) => state.user.user);
  const dispatch = useDispatch();
  const { status, error } = useSelector((state) => state.user);

  const [formData, setFormData] = React.useState({
    name: "",
    email: "",
    oldPassword: "",
    newPassword: "",
    confirmNewPassword: "",
    role: "admin",
  });

  const [errors, setErrors] = React.useState({
    name: false,
    email: false,
    newPassword: false,
    confirmNewPassword: false,
  });

  const [open, setOpen] = React.useState(false);
  const [alertMessage, setAlertMessage] = React.useState("");

  React.useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        role: user.role || "admin",
        oldPassword: "",
        newPassword: "",
        confirmNewPassword: "",
      });
    }
  }, [user]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
    setErrors((prevErrors) => ({ ...prevErrors, [name]: value.trim() === "" }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    dispatch(
      updateUser({
        id: user.id,
        name: formData.name,
        email: formData.email,
        role: formData.role,
      })
    ).then((result) => {
      if (result.type === "user/updateUser/fulfilled") {
        setAlertMessage("User updated successfully");
        setOpen(true);
      } else {
        setAlertMessage(result.payload.message || "Failed to update user");
        setOpen(true);
      }
    });
  };

  const handlePasswordChange = () => {
    if (formData.newPassword !== formData.confirmNewPassword) {
      setErrors((prevErrors) => ({ ...prevErrors, confirmNewPassword: true }));
      return;
    }

    dispatch(
      updateUser({
        id: user.id,
        newPassword: formData.newPassword,
        oldPassword: formData.oldPassword,
      })
    ).then((result) => {
      if (result.type === "user/updateUser/fulfilled") {
        setAlertMessage("Password changed successfully");
        setOpen(true);
        setFormData((prevData) => ({
          ...prevData,
          oldPassword: "",
          newPassword: "",
          confirmNewPassword: "",
        }));
      } else {
        setAlertMessage(result.payload.message || "Failed to change password");
        setOpen(true);
      }
    });
  };

  const handleClose = () => setOpen(false);

  return (
    <CenteredForm>
      <Box sx={{ maxWidth: "1000px", width: "100%" }}>
        <Grid container spacing={4}>
          {/* Left Column */}
          <Grid item xs={12} md={6}>
            <form onSubmit={handleSubmit}>
              <FormGrid container spacing={3}>
                <FormGrid item xs={12}>
                  <FormLabel htmlFor="name" required>
                    Name
                  </FormLabel>
                  <OutlinedInput
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    size="small"
                    fullWidth
                    error={errors.name}
                  />
                  {errors.name && (
                    <FormHelperText error>Name is required.</FormHelperText>
                  )}
                </FormGrid>
                <FormGrid item xs={12}>
                  <FormLabel htmlFor="email" required>
                    Email
                  </FormLabel>
                  <OutlinedInput
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    size="small"
                    fullWidth
                    error={errors.email}
                  />
                  {errors.email && (
                    <FormHelperText error>Email is required.</FormHelperText>
                  )}
                </FormGrid>
                <FormGrid item xs={12}>
                  <FormLabel htmlFor="role" required>
                    Role
                  </FormLabel>
                  <Select
                    id="role"
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    size="small"
                    fullWidth
                  >
                    <MenuItem value="admin">Admin</MenuItem>
                  </Select>
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
          </Grid>

          {/* Right Column */}
          <Grid item xs={12} md={6}>
            <FormGrid container spacing={3}>
              <FormGrid item xs={12}>
                <FormLabel htmlFor="oldPassword">Old Password</FormLabel>
                <OutlinedInput
                  id="oldPassword"
                  name="oldPassword"
                  type="password"
                  value={formData.oldPassword}
                  onChange={handleChange}
                  size="small"
                  fullWidth
                />
              </FormGrid>
              <FormGrid item xs={12}>
                <FormLabel htmlFor="newPassword">New Password</FormLabel>
                <OutlinedInput
                  id="newPassword"
                  name="newPassword"
                  type="password"
                  value={formData.newPassword}
                  onChange={handleChange}
                  size="small"
                  fullWidth
                  error={errors.newPassword}
                />
                {errors.newPassword && (
                  <FormHelperText error>
                    New password is required.
                  </FormHelperText>
                )}
              </FormGrid>
              <FormGrid item xs={12}>
                <FormLabel htmlFor="confirmNewPassword">
                  Confirm New Password
                </FormLabel>
                <OutlinedInput
                  id="confirmNewPassword"
                  name="confirmNewPassword"
                  type="password"
                  value={formData.confirmNewPassword}
                  onChange={handleChange}
                  size="small"
                  fullWidth
                  error={errors.confirmNewPassword}
                />
                {errors.confirmNewPassword && (
                  <FormHelperText error>Passwords must match.</FormHelperText>
                )}
              </FormGrid>
              <FormGrid item xs={12}>
                <Button
                  type="button"
                  variant="contained"
                  color="secondary"
                  onClick={handlePasswordChange}
                  fullWidth
                >
                  Change Password
                </Button>
              </FormGrid>
            </FormGrid>
          </Grid>
        </Grid>
      </Box>
      <Snackbar
        open={open}
        autoHideDuration={6000}
        onClose={handleClose}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={handleClose}
          severity={status === "succeeded" ? "success" : "error"}
          sx={{ width: "100%" }}
        >
          {alertMessage}
        </Alert>
      </Snackbar>
    </CenteredForm>
  );
}

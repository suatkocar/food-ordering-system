import * as React from "react";
import Grid from "@mui/material/Grid2";
import FormLabel from "@mui/material/FormLabel";
import OutlinedInput from "@mui/material/OutlinedInput";
import FormHelperText from "@mui/material/FormHelperText";
import { styled } from "@mui/system";
import { useSelector, useDispatch } from "react-redux";
import { updateCustomer } from "../../redux/slices/customerSlice";

const FormGrid = styled(Grid)(() => ({
  display: "flex",
  flexDirection: "column",
}));

function debounce(func, delay) {
  let timeoutId;
  return (...args) => {
    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      func(...args);
    }, delay);
  };
}

export default function AddressForm({ onFormValidityChange }) {
  const user = useSelector((state) => state.user.user);
  const dispatch = useDispatch();

  const [formData, setFormData] = React.useState({
    Name: "",
    Email: "",
    Address: "",
    Phone: "",
  });

  const [errors, setErrors] = React.useState({
    Address: false,
    Phone: false,
  });

  React.useEffect(() => {
    if (user) {
      setFormData({
        Name: user.name || "",
        Email: user.email || "",
        Address: user.address || "",
        Phone: user.phone || "",
      });
    }
  }, [user]);

  React.useEffect(() => {
    const isFormValid =
      formData.Address.trim() !== "" && formData.Phone.trim() !== "";
    onFormValidityChange(isFormValid);
  }, [formData, onFormValidityChange]);

  const debouncedUpdateCustomer = React.useCallback(
    debounce((updatedData) => {
      if (user?.CustomerID) {
        dispatch(
          updateCustomer({ ...updatedData, CustomerID: user.CustomerID })
        );
      } else if (user?.id) {
        dispatch(updateCustomer({ ...updatedData, CustomerID: user.id }));
      } else {
        console.error("CustomerID is missing. Update skipped.");
      }
    }, 500),
    [dispatch, user?.CustomerID, user?.id]
  );

  const handleChange = (event) => {
    const { name, value } = event.target;

    if (name === "Phone" && !/^\d*$/.test(value)) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        [name]: true,
      }));
      return;
    }

    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));

    setErrors((prevErrors) => ({
      ...prevErrors,
      [name]: value.trim() === "",
    }));

    debouncedUpdateCustomer({ ...formData, [name]: value });
  };

  return (
    <Grid container spacing={3}>
      <FormGrid size={{ xs: 12 }}>
        <FormLabel htmlFor="name">Name</FormLabel>
        <OutlinedInput
          id="name"
          name="Name"
          value={formData.Name}
          onChange={handleChange}
          size="small"
          style={{ pointerEvents: "none", fontStyle: "italic", color: "gray" }}
          inputProps={{ readOnly: true }}
        />
      </FormGrid>
      <FormGrid size={{ xs: 12 }}>
        <FormLabel htmlFor="email">Email</FormLabel>
        <OutlinedInput
          id="email"
          name="Email"
          value={formData.Email}
          onChange={handleChange}
          size="small"
          style={{ pointerEvents: "none", fontStyle: "italic", color: "gray" }}
          inputProps={{ readOnly: true }}
        />
      </FormGrid>
      <FormGrid size={{ xs: 12 }}>
        <FormLabel htmlFor="address" required>
          Address
        </FormLabel>
        <OutlinedInput
          id="address"
          name="Address"
          value={formData.Address}
          onChange={handleChange}
          size="small"
          error={errors.Address}
        />
        {errors.Address && (
          <FormHelperText error>Address is required.</FormHelperText>
        )}
      </FormGrid>
      <FormGrid size={{ xs: 12 }}>
        <FormLabel htmlFor="phone" required>
          Phone
        </FormLabel>
        <OutlinedInput
          id="phone"
          name="Phone"
          value={formData.Phone}
          onChange={handleChange}
          size="small"
          error={errors.Phone}
          type="tel"
          inputProps={{
            pattern: "[0-9]*",
            inputMode: "numeric", 
          }}
        />
        {errors.Phone && (
          <FormHelperText error>
            Phone is required and should contain only numbers.
          </FormHelperText>
        )}
      </FormGrid>
    </Grid>
  );
}

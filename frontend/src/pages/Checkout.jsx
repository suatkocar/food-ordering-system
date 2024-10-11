import * as React from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CssBaseline from "@mui/material/CssBaseline";
import Grid from "@mui/material/Grid2";
import Stack from "@mui/material/Stack";
import Step from "@mui/material/Step";
import StepLabel from "@mui/material/StepLabel";
import Stepper from "@mui/material/Stepper";
import Typography from "@mui/material/Typography";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import ChevronLeftRoundedIcon from "@mui/icons-material/ChevronLeftRounded";
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";
import AddressForm from "../components/checkout/AddressForm";
import getCheckoutTheme from "../components/checkout/theme/getCheckoutTheme";
import Info from "../components/checkout/Info";
import InfoMobile from "../components/checkout/InfoMobile";
import PaymentForm from "../components/checkout/PaymentForm/PaymentForm";
import Review from "../components/checkout/Review";
import SitemarkIcon from "../components/checkout/SitemarkIcon";
import NavBar from "../components/checkout/NavBar/NavBar";
import { useDispatch, useSelector } from "react-redux";
import { useState, useEffect } from "react";
import { fetchCart } from "../redux/slices/cartSlice";
import { handleLogout, setRedirectUrl } from "../redux/slices/userSlice";
import axiosInstance from "../api/axiosInstance";
import { useNavigate } from "react-router-dom";
import { useSnackbar } from "notistack";
import DashboardIcon from "@mui/icons-material/Dashboard";

const steps = ["Shipping address", "Payment details", "Review your order"];

function getStepContent(step, handleFormValidityChange) {
  switch (step) {
    case 0:
      return (
        <AddressForm
          onFormValidityChange={(isValid) =>
            handleFormValidityChange(isValid, 0)
          }
        />
      );
    case 1:
      return (
        <PaymentForm
          onFormValidityChange={(isValid) =>
            handleFormValidityChange(isValid, 1)
          }
        />
      );
    case 2:
      return <Review />;
    default:
      throw new Error("Unknown step");
  }
}

function calculateTotalPrice(cart) {
  return Object.values(cart)
    .reduce(
      (total, item) =>
        total + (item.DynamicPrice ? item.DynamicPrice : 0) * item.quantity,
      0
    )
    .toFixed(2);
}

export default function Checkout() {
  const { user, token } = useSelector((state) => state.user);
  const cart = useSelector((state) => state.cart.items);
  const [mode, setMode] = React.useState("light");
  const [showCustomTheme, setShowCustomTheme] = React.useState(true);
  const checkoutTheme = createTheme(getCheckoutTheme(mode));
  const defaultTheme = createTheme({ palette: { mode } });
  const [activeStep, setActiveStep] = React.useState(0);
  const dispatch = useDispatch();
  const [isAddressFormValid, setIsAddressFormValid] = useState(false);
  const [isPaymentFormValid, setIsPaymentFormValid] = useState(false);
  const navigate = useNavigate();
  const [orderId, setOrderId] = useState(null);
  const { enqueueSnackbar } = useSnackbar();

  const handleFormValidityChange = (isValid, step) => {
    if (step === 0) {
      setIsAddressFormValid(isValid);
    } else if (step === 1) {
      setIsPaymentFormValid(isValid);
    }
  };

  const handleGoToOrders = () => {
    navigate("/customer-dashboard");
  };

  React.useEffect(() => {
    const savedMode = localStorage.getItem("themeMode");
    if (savedMode) {
      setMode(savedMode);
    } else {
      const systemPrefersDark = window.matchMedia(
        "(prefers-color-scheme: light)"
      ).matches;
      setMode(systemPrefersDark ? "dark" : "light");
    }
  }, []);

  useEffect(() => {
    if (token) {
      axiosInstance.defaults.headers.common["Authorization"] =
        `Bearer ${token}`;
      dispatch(fetchCart())
        .then((response) => {
          if (response.error) {
            console.error("Error fetching cart:", response.error);
          } else {
            console.log("Cart fetched successfully:", response.payload);
          }
        })
        .catch((error) => console.error("Fetch cart failed:", error));
    } else {
      delete axiosInstance.defaults.headers.common["Authorization"];
    }
  }, [token, dispatch]);

  function formatDateForSQL(date) {
    const pad = (n) => (n < 10 ? "0" + n : n);
    return (
      date.getFullYear() +
      "-" +
      pad(date.getMonth() + 1) +
      "-" +
      pad(date.getDate()) +
      " " +
      pad(date.getHours()) +
      ":" +
      pad(date.getMinutes()) +
      ":" +
      pad(date.getSeconds())
    );
  }

  const toggleColorMode = () => {
    const newMode = mode === "dark" ? "light" : "dark";
    setMode(newMode);
    localStorage.setItem("themeMode", newMode);
  };

  const toggleCustomTheme = () => {
    setShowCustomTheme((prev) => !prev);
  };

  const handlePlaceOrder = async () => {
    console.log("Order creation initiated");
    try {
      if (!cart || Object.keys(cart).length === 0) {
        throw new Error("Your basket is empty.");
      }

      const orderItems = Object.values(cart).map((item) => {
        console.log("Processing item:", item);

        if (!item.ProductID) {
          console.error("Missing product_id for item:", item);
          throw new Error("Product ID is missing for an item.");
        }

        return {
          productId: item.ProductID,
          quantity: item.Quantity,
        };
      });

      console.log("Order items:", orderItems);

      const formattedDate = formatDateForSQL(new Date());

      const response = await axiosInstance.post(
        `/orders`,
        {
          orderItems,
          orderDate: formattedDate,
        },
        {
          withCredentials: true,
        }
      );

      console.log("Order response:", response);

      if (response.status === 201) {
        console.log("Order created successfully:", response.data.OrderID);

        enqueueSnackbar("Order placed successfully!", { variant: "success" });
        setOrderId(response.data.OrderID); // Bu satırı değiştirdik
        setActiveStep(steps.length);
      } else {
        console.error("Order creation failed:", response.data);
        enqueueSnackbar(
          "An error occurred while placing your order. Please try again.",
          { variant: "error" }
        );
      }
    } catch (error) {
      console.error("Error during order creation:", error);
      if (error.response && error.response.status === 401) {
        enqueueSnackbar("Your session has expired. Redirecting to sign in...", {
          variant: "warning",
        });

        await dispatch(handleLogout());
        dispatch(setRedirectUrl("/checkout"));

        setTimeout(() => {
          navigate("/signin");
        }, 2000);
      } else {
        enqueueSnackbar("An error occurred. Please try again.", {
          variant: "error",
        });
      }
    }
  };

  const handleNext = () => {
    if (Object.keys(cart).length === 0) return;

    if (
      (activeStep === 0 && isAddressFormValid) ||
      (activeStep === 1 && isPaymentFormValid) ||
      activeStep > 1
    ) {
      if (activeStep === steps.length - 1) {
        handlePlaceOrder();
      } else {
        setActiveStep(activeStep + 1);
      }
    }
  };

  const handleBack = () => {
    setActiveStep(activeStep - 1);
  };

  const handleReload = () => {
    navigate("/");
    window.location.reload();
  };

  const handleBackToHome = () => {
    navigate("/");
  };

  return (
    <ThemeProvider theme={showCustomTheme ? checkoutTheme : defaultTheme}>
      <CssBaseline />
      <NavBar
        toggleCustomTheme={toggleCustomTheme}
        showCustomTheme={showCustomTheme}
        mode={mode}
        toggleColorMode={toggleColorMode}
      />
      <Grid container sx={{ height: { xs: "100%", sm: "100dvh" } }}>
        <Grid
          size={{ xs: 12, sm: 5, lg: 4 }}
          sx={{
            display: { xs: "none", md: "flex" },
            flexDirection: "column",
            backgroundColor: "background.paper",
            borderRight: { sm: "none", md: "1px solid" },
            borderColor: { sm: "none", md: "divider" },
            alignItems: "start",
            pt: 24,
            px: 10,
            gap: 4,
          }}
        >
          <SitemarkIcon onClick={handleReload} sx={{ cursor: "pointer" }} />
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              flexGrow: 1,
              width: "100%",
              maxWidth: 500,
            }}
          >
            <Info
              cart={cart || {}}
              totalPrice={`£${calculateTotalPrice(cart)}`}
            />
          </Box>
        </Grid>
        <Grid
          size={{ sm: 12, md: 7, lg: 8 }}
          sx={{
            display: "flex",
            flexDirection: "column",
            maxWidth: "100%",
            width: "100%",
            backgroundColor: { xs: "transparent", sm: "background.default" },
            alignItems: "start",
            pt: { xs: 6, sm: 24 },
            px: { xs: 2, sm: 10 },
            gap: { xs: 4, md: 8 },
          }}
        >
          <Box
            sx={{
              display: "flex",
              justifyContent: { sm: "space-between", md: "flex-end" },
              alignItems: "center",
              width: "100%",
              maxWidth: { sm: "100%", md: 600 },
            }}
          >
            <Box
              sx={{
                display: { xs: "none", md: "flex" },
                flexDirection: "column",
                justifyContent: "space-between",
                alignItems: "flex-end",
                flexGrow: 1,
              }}
            >
              <Stepper
                id="desktop-stepper"
                activeStep={activeStep}
                sx={{ width: "100%", height: 40 }}
              >
                {steps.map((label) => (
                  <Step
                    sx={{
                      ":first-of-type": { pl: 0 },
                      ":last-of-type": { pr: 0 },
                    }}
                    key={label}
                  >
                    <StepLabel>{label}</StepLabel>
                  </Step>
                ))}
              </Stepper>
            </Box>
          </Box>
          {Object.keys(cart).length > 0 && (
            <Card sx={{ display: { xs: "flex", md: "none" }, width: "100%" }}>
              <CardContent
                sx={{
                  display: "flex",
                  width: "100%",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <div>
                  <Typography variant="subtitle2" gutterBottom>
                    Selected products
                  </Typography>
                  <Typography variant="body1">
                    £{calculateTotalPrice(cart)}
                  </Typography>
                </div>
                <InfoMobile
                  totalPrice={`£${calculateTotalPrice(cart)}`}
                  cart={cart}
                />
              </CardContent>
            </Card>
          )}

          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              flexGrow: 1,
              width: "100%",
              maxWidth: { sm: "100%", md: 600 },
              maxHeight: "720px",
              gap: { xs: 5, md: "none" },
            }}
          >
            <Stepper
              id="mobile-stepper"
              activeStep={activeStep}
              alternativeLabel
              sx={{ display: { sm: "flex", md: "none" } }}
            >
              {steps.map((label) => (
                <Step
                  sx={{
                    ":first-of-type": { pl: 0 },
                    ":last-of-type": { pr: 0 },
                    "& .MuiStepConnector-root": { top: { xs: 6, sm: 12 } },
                  }}
                  key={label}
                >
                  <StepLabel
                    sx={{
                      ".MuiStepLabel-labelContainer": { maxWidth: "70px" },
                    }}
                  >
                    {label}
                  </StepLabel>
                </Step>
              ))}
            </Stepper>
            {activeStep === steps.length ? (
              <Stack spacing={2} useFlexGap>
                <Typography variant="h1" sx={{ alignSelf: "center" }}>
                  📦
                </Typography>
                <Typography variant="h5" sx={{ alignSelf: "center" }}>
                  Thank you for your order!
                </Typography>
                <Typography variant="body1" sx={{ color: "text.secondary" }}>
                  Your order number is
                  <strong>&nbsp; #{orderId}</strong>. We have emailed your order
                  confirmation and will update you once it's shipped.
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<DashboardIcon />}
                  sx={{
                    alignSelf: "center",
                    width: { xs: "100%", sm: "auto" },
                    mt: 2,
                  }}
                  onClick={handleGoToOrders}
                >
                  Go to Your Orders
                </Button>
                <Button
                  variant="outlined"
                  sx={{
                    alignSelf: "center",
                    width: { xs: "100%", sm: "auto" },
                  }}
                  onClick={handleBackToHome}
                >
                  Back to Home
                </Button>
              </Stack>
            ) : (
              <React.Fragment>
                {getStepContent(activeStep, handleFormValidityChange)}
                <Box
                  sx={[
                    {
                      display: "flex",
                      flexDirection: { xs: "column-reverse", sm: "row" },
                      alignItems: "end",
                      flexGrow: 1,
                      gap: 1,
                      pb: { xs: 12, sm: 12, md: 60, lg: 60, xl: 60 },
                      mt: { xs: 2, sm: 0 },
                      mb: "60px",
                    },
                    activeStep !== 0
                      ? { justifyContent: "space-between" }
                      : { justifyContent: "flex-end" },
                  ]}
                >
                  {activeStep !== 0 && (
                    <Button
                      startIcon={<ChevronLeftRoundedIcon />}
                      onClick={handleBack}
                      variant="text"
                      sx={{ display: { xs: "none", sm: "flex" } }}
                    >
                      Previous
                    </Button>
                  )}

                  {activeStep !== 0 && (
                    <Button
                      startIcon={<ChevronLeftRoundedIcon />}
                      onClick={handleBack}
                      variant="outlined"
                      fullWidth
                      sx={{ display: { xs: "flex", sm: "none" } }}
                    >
                      Previous
                    </Button>
                  )}

                  {Object.keys(cart).length > 0 && (
                    <Button
                      variant="contained"
                      endIcon={<ChevronRightRoundedIcon />}
                      onClick={handleNext}
                      sx={{
                        width: { xs: "100%", sm: "fit-content" },
                        display:
                          (activeStep === 0 && !isAddressFormValid) ||
                          (activeStep === 1 && !isPaymentFormValid)
                            ? "none"
                            : "inline-flex",
                      }}
                    >
                      {activeStep === steps.length - 1 ? "Place order" : "Next"}
                    </Button>
                  )}
                </Box>
              </React.Fragment>
            )}
          </Box>
        </Grid>
      </Grid>
    </ThemeProvider>
  );
}

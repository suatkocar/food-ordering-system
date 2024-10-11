import * as React from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Checkbox from "@mui/material/Checkbox";
import CssBaseline from "@mui/material/CssBaseline";
import FormControlLabel from "@mui/material/FormControlLabel";
import Divider from "@mui/material/Divider";
import FormLabel from "@mui/material/FormLabel";
import FormControl from "@mui/material/FormControl";
import Link from "@mui/material/Link";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import MuiCard from "@mui/material/Card";
import { ThemeProvider, createTheme, styled } from "@mui/material/styles";
import ForgotPassword from "../components/sign-in/ForgotPassword";
import getSignInTheme from "../components/sign-in/theme/getSignInTheme";
import {
  GoogleIcon,
  FacebookIcon,
  SitemarkIcon,
} from "../components/sign-in/CustomIcons";
import NavBar from "../components/sign-in/NavBar/NavBar";
import { useDispatch, useSelector } from "react-redux";
import { fetchDashboardData } from "../redux/slices/insightsSlice";
import { loginSuccess } from "../redux/slices/userSlice";
import axiosInstance from "../api/axiosInstance";
import { useNavigate } from "react-router-dom";
import { fetchCart } from "../redux/slices/cartSlice";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import { useSnackbar } from "notistack";

const Card = styled(MuiCard)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  alignSelf: "center",
  width: "100%",
  padding: theme.spacing(4),
  gap: theme.spacing(2),
  [theme.breakpoints.up("sm")]: {
    width: "450px",
  },
  boxShadow:
    "hsla(220, 30%, 5%, 0.05) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.05) 0px 15px 35px -5px",
  ...theme.applyStyles("dark", {
    boxShadow:
      "hsla(220, 30%, 5%, 0.5) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.08) 0px 15px 35px -5px",
  }),
}));

const SignInContainer = styled(Stack)(({ theme }) => ({
  height: "auto",
  backgroundImage:
    "radial-gradient(ellipse at 50% 50%, hsl(210, 100%, 97%), hsl(0, 0%, 100%))",
  backgroundRepeat: "no-repeat",
  [theme.breakpoints.up("sm")]: {
    height: "100dvh",
  },
  ...theme.applyStyles("dark", {
    backgroundImage:
      "radial-gradient(at 50% 50%, hsla(210, 100%, 16%, 0.5), hsl(220, 30%, 5%))",
  }),
}));

const CustomFormControlLabel = styled((props) => (
  <FormControlLabel {...props} />
))(({ theme }) => ({
  marginLeft: 0,
  marginRight: 0,
  padding: 0,
  "& .MuiFormControlLabel-label": {
    userSelect: "none",
    marginRight: theme.spacing(1),
  },
  "& .MuiCheckbox-root": {
    padding: theme.spacing(0.5),
  },
}));

export default function SignIn() {
  const [mode, setMode] = React.useState("light");
  const [showCustomTheme, setShowCustomTheme] = React.useState(true);
  const defaultTheme = createTheme({ palette: { mode } });
  const SignInTheme = createTheme(getSignInTheme(mode));
  const [emailError, setEmailError] = React.useState(false);
  const [emailErrorMessage, setEmailErrorMessage] = React.useState("");
  const [passwordError, setPasswordError] = React.useState(false);
  const [passwordErrorMessage, setPasswordErrorMessage] = React.useState("");
  const [open, setOpen] = React.useState(false);
  const [rememberMe, setRememberMe] = React.useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [loginError, setLoginError] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const redirectUrl = useSelector((state) => state.user.redirectUrl);
  const { enqueueSnackbar } = useSnackbar();

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

    // Remember Me functionality:
    const savedEmail = localStorage.getItem("email");
    const savedPassword = localStorage.getItem("password");
    const savedRememberMe = localStorage.getItem("rememberMe");

    if (savedRememberMe === "true") {
      if (savedEmail) {
        document.getElementById("email").value = savedEmail;
      }
      if (savedPassword) {
        document.getElementById("password").value = savedPassword;
      }
      setRememberMe(true);
    }
  }, []);

  const handleLogoClick = () => {
    navigate("/");
  };

  const toggleColorMode = () => {
    const newMode = mode === "dark" ? "light" : "dark";
    setMode(newMode);
    localStorage.setItem("themeMode", newMode);
  };

  const toggleCustomTheme = () => {
    setShowCustomTheme((prev) => !prev);
  };

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleRememberMeChange = (event) => {
    setRememberMe(event.target.checked);
  };

  const handleClickShowPassword = () => {
    setShowPassword((show) => !show);
  };

  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setEmailError(false);
    setEmailErrorMessage("");
    setPasswordError(false);
    setPasswordErrorMessage("");
    setLoginError("");

    const form = event.target.closest("form");

    if (!form) return;

    const data = new FormData(form);

    try {
      const response = await axiosInstance.post(
        `/login`,
        {
          email: data.get("email"),
          password: data.get("password"),
          redirectUrl,
        },
        { withCredentials: true }
      );

      const { user, token } = response.data;
      dispatch(loginSuccess({ user, token }));

      if (rememberMe) {
        localStorage.setItem("email", data.get("email"));
        localStorage.setItem("password", data.get("password"));
        localStorage.setItem("rememberMe", true);
      } else {
        localStorage.removeItem("email");
        localStorage.removeItem("password");
        localStorage.removeItem("rememberMe");
      }

      await dispatch(fetchCart()).unwrap();
      await dispatch(fetchDashboardData()).unwrap();

    
      enqueueSnackbar("Login successful!", { variant: "success" });

      navigate(response.data.redirectUrl || "/");
    } catch (error) {
      console.error("Login failed:", error);

      if (error.response && error.response.status === 401) {
        if (error.response.data.message === "Invalid email") {
          setEmailError(true);
          setEmailErrorMessage("Invalid email address.");
        } else if (error.response.data.message === "Invalid password") {
          setPasswordError(true);
          setPasswordErrorMessage("Incorrect password.");
        } else {
          setLoginError("Login failed, please try again.");
        }
      } else {
        setLoginError("An unexpected error occurred.");
      }
    }
  };

  const validateInputs = () => {
    const email = document.getElementById("email");
    const password = document.getElementById("password");

    let isValid = true;

    if (
      !email.value ||
      (!/\S+@\S+\.\S+/.test(email.value) &&
        email.value !== "admin" &&
        email.value !== "test")
    ) {
      setEmailError(true);
      setEmailErrorMessage("Please enter a valid email address.");
      isValid = false;
    } else {
      setEmailError(false);
      setEmailErrorMessage("");
    }

    if (!password.value || password.value.length < 6) {
      setPasswordError(true);
      setPasswordErrorMessage("Password must be at least 6 characters long.");
      isValid = false;
    } else {
      setPasswordError(false);
      setPasswordErrorMessage("");
    }

    return isValid;
  };

  const handleSignUp = () => {
    navigate("/signup");
  };

  return (
    <ThemeProvider theme={showCustomTheme ? SignInTheme : defaultTheme}>
      <CssBaseline />
      <NavBar
        toggleCustomTheme={toggleCustomTheme}
        showCustomTheme={showCustomTheme}
        mode={mode}
        toggleColorMode={toggleColorMode}
      />
      <SignInContainer direction="column" justifyContent="space-between">
        <Stack
          sx={{
            justifyContent: "center",
            height: "100dvh",
            p: 2,
          }}
        >
          <Card variant="outlined">
          <Box onClick={handleLogoClick} sx={{ alignSelf: 'center', mb: 2, cursor: 'pointer' }}>
        <SitemarkIcon />
      </Box>
            <Typography
              component="h1"
              variant="h4"
              sx={{ width: "100%", fontSize: "clamp(2rem, 10vw, 2.15rem)" }}
            >
              Sign in
            </Typography>
            <Box
              component="form"
              onSubmit={handleSubmit}
              noValidate
              sx={{
                display: "flex",
                flexDirection: "column",
                width: "100%",
                gap: 2,
              }}
            >
              <FormControl>
                <FormLabel htmlFor="email">Email</FormLabel>
                <TextField
                  error={emailError}
                  helperText={emailError ? emailErrorMessage : ""}
                  id="email"
                  type="email"
                  name="email"
                  placeholder="your@email.com"
                  autoComplete="email"
                  autoFocus
                  required
                  fullWidth
                  variant="outlined"
                  color={emailError ? "error" : "primary"}
                  sx={{ ariaLabel: "email" }}
                />
              </FormControl>
              <FormControl>
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <FormLabel htmlFor="password">Password</FormLabel>
                  <Link
                    component="button"
                    type="button"
                    onClick={handleClickOpen}
                    variant="body2"
                    sx={{
                      alignSelf: "baseline",
                      "&:hover": {
                        background: "inherit",
                        color: "inherit",
                        textDecoration: "none",
                      },
                    }}
                  >
                    Forgot your password?
                  </Link>
                </Box>
                <TextField
                  error={passwordError}
                  helperText={passwordError ? passwordErrorMessage : ""}
                  name="password"
                  placeholder="••••••"
                  type={showPassword ? "text" : "password"}
                  id="password"
                  autoComplete="current-password"
                  required
                  fullWidth
                  variant="outlined"
                  color={passwordError ? "error" : "primary"}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle password visibility"
                          onClick={handleClickShowPassword}
                          onMouseDown={handleMouseDownPassword}
                          edge="end"
                          sx={{
                            padding: "0px",
                            backgroundColor: "transparent",
                            border: "none",
                            "&:hover": {
                              backgroundColor: "transparent",
                            },
                          }}
                        >
                          {showPassword ? (
                            <VisibilityOff fontSize="small" />
                          ) : (
                            <Visibility fontSize="small" />
                          )}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </FormControl>

              <CustomFormControlLabel
                control={
                  <Checkbox
                    value="remember"
                    color="primary"
                    checked={rememberMe}
                    onChange={handleRememberMeChange}
                    sx={{
                      "& .MuiSvgIcon-root": { fontSize: 20 },
                      padding: 0,
                    }}
                  />
                }
                label={
                  <Typography sx={{ userSelect: "none", marginRight: 1 }}>
                    Remember me
                  </Typography>
                }
                sx={{ marginLeft: 0, userSelect: "none", marginRight: 0 }}
              />
              <ForgotPassword open={open} handleClose={handleClose} />
              {loginError && (
                <Typography color="error" variant="body2" sx={{ mt: 2 }}>
                  {loginError}
                </Typography>
              )}
              <Button
                type="submit"
                fullWidth
                variant="contained"
                onClick={(e) => {
                  if (validateInputs()) {
                    handleSubmit(e);
                  }
                }}
              >
                Sign in
              </Button>

              <Typography sx={{ textAlign: "center" }} variant="body2">
                Don't have an account?{" "}
                <Link
                  onClick={handleSignUp}
                  variant="body2"
                  sx={{
                    cursor: "pointer",
                    color: "primary.main",
                    textDecoration: "none",
                    "&:hover": {
                      textDecoration: "underline",
                      backgroundColor: "transparent",
                    },
                  }}
                >
                  Sign up
                </Link>
              </Typography>
            </Box>
            <Divider>or</Divider>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <Button
                fullWidth
                variant="outlined"
                onClick={() =>
                  enqueueSnackbar("Coming soon", { variant: "info" })
                }
                startIcon={<GoogleIcon />}
              >
                Sign in with Google
              </Button>
              <Button
                fullWidth
                variant="outlined"
                onClick={() =>
                  enqueueSnackbar("Coming soon", { variant: "info" })
                }
                startIcon={<FacebookIcon />}
              >
                Sign in with Facebook
              </Button>
            </Box>
          </Card>
        </Stack>
      </SignInContainer>
    </ThemeProvider>
  );
}

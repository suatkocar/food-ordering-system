import * as React from "react";
import { createTheme, ThemeProvider, alpha } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import getDashboardTheme from "../components/customerDashboard/theme/getDashboardTheme";
import AppNavbar from "../components/customerDashboard/AppNavbar/AppNavbar";
import SideMenu from "../components/customerDashboard/SideMenu/SideMenu";
import NavBar from "../components/customerDashboard/Navbar/NavBar";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import { useDispatch, useSelector } from "react-redux";
import { hideAlert } from "../redux/slices/alertSlice";
import { useNavigate } from "react-router-dom";
import ControlPanel from "../components/customerDashboard/ControlPanel/ControlPanel";
import UserProfile from "../components/customerDashboard/UserProfile";

export default function CustomerDashboard() {
  const [mode, setMode] = React.useState("light");
  const [showCustomTheme, setShowCustomTheme] = React.useState(true);
  const [selectedMenuItem, setSelectedMenuItem] = React.useState("Orders");
  const dashboardTheme = createTheme(getDashboardTheme(mode));
  const defaultTheme = createTheme({ palette: { mode } });
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const alert = useSelector((state) => state.alert);
  const token = useSelector((state) => state.user.token);

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

  React.useEffect(() => {
    if (!token) {
      navigate("/signin");
    }
  }, [token, navigate]);

  const toggleColorMode = () => {
    const newMode = mode === "dark" ? "light" : "dark";
    setMode(newMode);
    localStorage.setItem("themeMode", newMode);
  };

  const toggleCustomTheme = () => {
    setShowCustomTheme((prev) => !prev);
  };

  const handleSnackbarClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    dispatch(hideAlert());
  };

  return (
    <ThemeProvider theme={showCustomTheme ? dashboardTheme : defaultTheme}>
      <CssBaseline />
      <NavBar
        toggleCustomTheme={toggleCustomTheme}
        showCustomTheme={showCustomTheme}
        mode={mode}
        toggleColorMode={toggleColorMode}
      />
      <Box sx={{ display: "flex" }}>
        <SideMenu setSelectedMenuItem={setSelectedMenuItem} selectedMenuItem={selectedMenuItem} />
        <AppNavbar setSelectedMenuItem={setSelectedMenuItem} selectedMenuItem={selectedMenuItem} />
        <Box
          component="main"
          sx={(theme) => ({
            position: { sm: "relative", md: "" },
            top: { sm: "48px", md: "60px" },
            height: { sm: "calc(100vh - 48px)", md: "100vh" },
            flexGrow: 1,
            backgroundColor: alpha(theme.palette.background.default, 1),
            overflow: "auto",
          })}
        >
          <Stack
            spacing={2}
            sx={{
              alignItems: "center",
              mx: 3,
              pb: 10,
              mt: { xs: 16, sm: 10, md: 0 },
            }}
          >
            {selectedMenuItem === "Orders" && <ControlPanel />}
            {selectedMenuItem === "Profile" && <UserProfile />}
            {selectedMenuItem === "AddAccount" && <AddAccount />}
          </Stack>
        </Box>
      </Box>
      <Snackbar
        open={alert.open}
        autoHideDuration={4000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={alert.severity}
          sx={{ width: "100%" }}
        >
          {alert.message}
        </Alert>
      </Snackbar>
    </ThemeProvider>
  );
}

import * as React from "react";
import { createTheme, ThemeProvider, alpha } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import Box from "@mui/material/Box";
import getDashboardTheme from "../components/adminDashboard/theme/getDashboardTheme";
import AppNavbar from "../components/adminDashboard/AppNavbar/AppNavbar";
import Header from "../components/adminDashboard/Header/Header";
import MainGrid from "../components/adminDashboard/MainGrid/MainGrid";
import SideMenu from "../components/adminDashboard/SideMenu/SideMenu";
import NavBar from "../components/adminDashboard/Navbar/NavBar";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import { useDispatch, useSelector } from "react-redux";
import { hideAlert } from "../redux/slices/alertSlice";
import { useNavigate } from "react-router-dom";
import UserProfile from "../components/adminDashboard/UserProfile";
import AddAccount from "../components/adminDashboard/AddAccount";
import ControlPanel from "../components/adminDashboard/ControlPanel/ControlPanel";
import { fetchDashboardData } from "../redux/slices/insightsSlice";
import { ClipLoader } from "react-spinners";

export default function AdminDashboard() {
  const [mode, setMode] = React.useState("light");
  const [showCustomTheme, setShowCustomTheme] = React.useState(true);
  const [selectedMenuItem, setSelectedMenuItem] = React.useState("Analytics");
  const dashboardTheme = createTheme(getDashboardTheme(mode));
  const defaultTheme = createTheme({ palette: { mode } });
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const alert = useSelector((state) => state.alert);
  const token = useSelector((state) => state.user.token);
  const insightsLoading = useSelector((state) => state.insights.loading);

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
    } else {
      dispatch(fetchDashboardData());
    }
  }, [token, navigate, dispatch]);

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

  const handleFormValidityChange = (isValid) => {
    console.log("Form validity changed:", isValid);
  };

  if (insightsLoading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <ClipLoader color={mode === "dark" ? "#ffffff" : "#000000"} />
      </Box>
    );
  }

  return (
    <ThemeProvider theme={showCustomTheme ? dashboardTheme : defaultTheme}>
      <CssBaseline />
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          height: "100%",
          overflow: "hidden",
        }}
      >
        <NavBar
          toggleCustomTheme={toggleCustomTheme}
          showCustomTheme={showCustomTheme}
          mode={mode}
          toggleColorMode={toggleColorMode}
        />
        <Box sx={{ display: "flex", flexGrow: 1, overflow: "hidden" }}>
          <SideMenu
            setSelectedMenuItem={setSelectedMenuItem}
            selectedMenuItem={selectedMenuItem}
          />
          <AppNavbar
            setSelectedMenuItem={setSelectedMenuItem}
            selectedMenuItem={selectedMenuItem}
          />
          <Box
            component="main"
            sx={{
              flexGrow: 1,
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
              height: "100%",
            }}
          >
            <Box
              sx={{
                flexGrow: 1,
                overflow: "auto",
                paddingTop: { xs: 16, sm: 3 },
                scrollPaddingRight: 3,
                paddingLeft: 3,
                paddingRight: 3,
                paddingBottom: { xs: 0, sm: 0 },
              }}
            >
              <Header selectedMenuItem={selectedMenuItem} />
              {selectedMenuItem === "Analytics" && <MainGrid />}
              {selectedMenuItem === "Database" && <ControlPanel />}
              {selectedMenuItem === "Profile" && (
                <UserProfile onFormValidityChange={handleFormValidityChange} />
              )}
              {selectedMenuItem === "AddAccount" && <AddAccount />}
            </Box>
          </Box>
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

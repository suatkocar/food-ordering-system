import * as React from "react";
import PropTypes from "prop-types";
import { createTheme, ThemeProvider, styled } from "@mui/material/styles";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Box from "@mui/material/Box";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Container from "@mui/material/Container";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import ToggleColorMode from "./ToggleColorMode";
import getDashboardTheme from "../theme/getDashboardTheme";
import { useNavigate } from "react-router-dom";

const StyledAppBar = styled(AppBar)(({ theme }) => ({
  position: "fixed",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  flexShrink: 0,
  borderBottom: "1px solid",
  borderColor: theme.palette.divider,
  backgroundColor: theme.palette.background.paper,
  boxShadow: theme.shadows[1],
  backgroundImage: "none",
  padding: 4,
  zIndex: theme.zIndex.drawer + 1,
}));

function NavBar({ showCustomTheme, toggleCustomTheme, mode, toggleColorMode }) {
  const navigate = useNavigate();
  
  const handleBackToHome = () => {
    navigate("/");
  };

  const handleChange = (event) => {
    toggleCustomTheme(event.target.value === "custom");
  };

  const dashboardTheme = createTheme(getDashboardTheme(mode));

  return (
    <ThemeProvider theme={dashboardTheme}>
      <StyledAppBar>
        <Container maxWidth={false}>
          <Toolbar
            variant="dense"
            disableGutters
            sx={{
              display: "flex",
              justifyContent: "space-between",
              width: "100%",
            }}
          >
            <Button
              variant="text"
              size="small"
              aria-label="Back to Home"
              startIcon={<ArrowBackRoundedIcon />}
              onClick={handleBackToHome}
              sx={{
                display: { xs: "none", sm: "flex" },
                justifySelf: "flex-start",
              }}
            >
              Back to Home
            </Button>
            <IconButton
              size="small"
              aria-label="Back to Home"
              onClick={handleBackToHome}
              sx={{ display: { xs: "auto", sm: "none" } }}
            >
              <ArrowBackRoundedIcon />
            </IconButton>

            <Box
              sx={{
                display: "flex",
                gap: 1,
                justifySelf: "flex-end",
                ml: "auto",
              }}
            >
              <ToggleColorMode
                data-screenshot="toggle-mode"
                mode={mode}
                toggleColorMode={toggleColorMode}
              />
            </Box>
          </Toolbar>
        </Container>
      </StyledAppBar>
    </ThemeProvider>
  );
}

NavBar.propTypes = {
  mode: PropTypes.oneOf(["dark", "light"]).isRequired,
  showCustomTheme: PropTypes.bool.isRequired,
  toggleColorMode: PropTypes.func.isRequired,
  toggleCustomTheme: PropTypes.func.isRequired,
};

export default NavBar;

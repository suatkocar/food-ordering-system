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
import getSignUpTheme from "../theme/getSignUpTheme";
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
}));

function NavBar({ mode, toggleColorMode }) {
  const signUpTheme = createTheme(getSignUpTheme(mode));
  const navigate = useNavigate();

  const handleBackToHome = () => {
    navigate("/");
  };

  return (
    <ThemeProvider theme={signUpTheme}>
      <StyledAppBar>
        <Container maxWidth="lg">
          <Toolbar
            variant="dense"
            disableGutters
            sx={{ display: "flex", justifyContent: "space-between" }}
          >
            <Button
              variant="text"
              size="small"
              aria-label="Back to Home"
              startIcon={<ArrowBackRoundedIcon />}
              onClick={handleBackToHome}
              sx={{ display: { xs: "none", sm: "flex" } }}
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
            <Box sx={{ display: "flex", gap: 1 }}>
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
  toggleColorMode: PropTypes.func.isRequired,
};

export default NavBar;

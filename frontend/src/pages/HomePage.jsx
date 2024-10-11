import * as React from "react";
import { useRef, useCallback } from "react";
import PropTypes from "prop-types";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import Box from "@mui/material/Box";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";
import AppAppBar from "../components/homepage/AppAppBar/AppAppBar";
import Hero from "../components/homepage/Hero";
import Footer from "../components/homepage/Footer";
import getMPTheme from "../theme/getMPTheme";
import Menu from "../components/homepage/Menu/Menu";
import { useDispatch, useSelector } from "react-redux";
import { fetchCart } from "../redux/slices/cartSlice";
import { fetchProducts } from "../redux/slices/productsSlice";
import { fetchCategories } from "../redux/slices/categoriesSlice";
import { Button } from "@mui/material";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";

function ToggleCustomTheme({ showCustomTheme, toggleCustomTheme }) {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        width: "100dvw",
        position: "fixed",
        bottom: 24,
      }}
    >
      <ToggleButtonGroup
        color="primary"
        exclusive
        value={showCustomTheme}
        onChange={toggleCustomTheme}
        aria-label="Toggle design language"
        sx={{
          backgroundColor: "background.default",
          "& .Mui-selected": {
            pointerEvents: "none",
          },
        }}
      >
        <ToggleButton value>
          <AutoAwesomeRoundedIcon sx={{ fontSize: "20px", mr: 1 }} />
          Custom theme
        </ToggleButton>
        <ToggleButton data-screenshot="toggle-default-theme" value={false}>
          Material Design 2
        </ToggleButton>
      </ToggleButtonGroup>
    </Box>
  );
}

ToggleCustomTheme.propTypes = {
  showCustomTheme: PropTypes.bool.isRequired,
  toggleCustomTheme: PropTypes.func.isRequired,
};

export default function HomePage() {
  const [mode, setMode] = React.useState("light");
  const [showCustomTheme, setShowCustomTheme] = React.useState(true);
  const MPTheme = createTheme(getMPTheme(mode));
  const defaultTheme = createTheme({ palette: { mode } });
  const [searchQuery, setSearchQuery] = React.useState("");
  const [showScrollButton, setShowScrollButton] = React.useState(false);

  const dispatch = useDispatch();
  const productsStatus = useSelector((state) => state.products.status);
  const categoriesStatus = useSelector((state) => state.categories.status);
  const searchBoxRef = useRef(null);

  React.useEffect(() => {
    dispatch(fetchCart());
  }, [dispatch]);

  React.useEffect(() => {
    if (productsStatus === "idle") {
      dispatch(fetchProducts());
    }
    if (categoriesStatus === "idle") {
      dispatch(fetchCategories());
    }
  }, [productsStatus, categoriesStatus, dispatch]);

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

  const toggleColorMode = () => {
    const newMode = mode === "dark" ? "light" : "dark";
    setMode(newMode);
    localStorage.setItem("themeMode", newMode);
  };

  const toggleCustomTheme = () => {
    setShowCustomTheme((prev) => !prev);
  };

  const smoothScrollTo = useCallback((element, duration = 1000, offset = 0) => {
    const targetPosition =
      element.getBoundingClientRect().top + window.pageYOffset - offset;
    const startPosition = window.pageYOffset;
    const distance = targetPosition - startPosition;
    let startTime = null;

    function animation(currentTime) {
      if (startTime === null) startTime = currentTime;
      const timeElapsed = currentTime - startTime;
      const run = ease(timeElapsed, startPosition, distance, duration);
      window.scrollTo(0, run);
      if (timeElapsed < duration) requestAnimationFrame(animation);
    }

    function ease(t, b, c, d) {
      t /= d / 2;
      if (t < 1) return (c / 2) * t * t + b;
      t--;
      return (-c / 2) * (t * (t - 2) - 1) + b;
    }

    requestAnimationFrame(animation);
  }, []);

  const handleSearch = useCallback(
    (query) => {
      setSearchQuery(query);
      const menuElement = document.getElementById("menu");
      if (menuElement) {
        smoothScrollTo(menuElement, 1000, -400);
        setTimeout(() => {
          if (searchBoxRef.current) {
            searchBoxRef.current.focus();
            const value = searchBoxRef.current.value;
            searchBoxRef.current.value = "";
            searchBoxRef.current.value = value;
          }
        }, 1000);
      }
    },
    [setSearchQuery, smoothScrollTo]
  );

  const handleScroll = () => {
    if (window.scrollY > 300) {
      setShowScrollButton(true);
    } else {
      setShowScrollButton(false);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  React.useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <ThemeProvider theme={showCustomTheme ? MPTheme : defaultTheme}>
      <CssBaseline />
      <AppAppBar mode={mode} toggleColorMode={toggleColorMode} />
      <Hero onSearch={handleSearch} />
      <Menu
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        searchBoxRef={searchBoxRef}
      />
      <div>
        <Footer />
      </div>
      {showScrollButton && (
        <Button
          variant="contained"
          onClick={scrollToTop}
          sx={{
            position: "fixed",
            top: "95%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            zIndex: 1000,
            borderRadius: "100%",
            width: "40px",
            height: "40px",
            minWidth: "40px",
            minHeight: "40px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            transition: "transform 0.2s ease",
            "&:hover": {
              transform: "translate(-50%, -50%) scale(1.3)",
            },
          }}
        >
          <ArrowUpwardIcon sx={{ fontSize: "20px" }} />
        </Button>
      )}
    </ThemeProvider>
  );
}

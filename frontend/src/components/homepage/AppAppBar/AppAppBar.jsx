import React, { useState, useEffect, useRef } from "react";
import PropTypes from "prop-types";
import { styled, alpha, useTheme } from "@mui/material/styles";
import {
  Box,
  AppBar,
  Toolbar,
  IconButton,
  Container,
  Drawer,
  MenuItem,
  Badge,
  Divider,
  Button,
  Typography,
} from "@mui/material";
import {
  Menu as MenuIcon,
  CloseRounded as CloseRoundedIcon,
  ShoppingCart as ShoppingCartIcon,
  AccountCircle as AccountCircleIcon,
} from "@mui/icons-material";
import { useNavigate, Link } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import Sitemark from "../Shared/SitemarkIcon";
import ToggleColorMode from "./ToggleColorMode";
import axiosInstance from "../../../api/axiosInstance";
import { fetchProducts } from "../../../redux/slices/productsSlice";
import { fetchCart, resetCart } from "../../../redux/slices/cartSlice";
import { fetchDashboardData } from "../../../redux/slices/insightsSlice";
import {
  logout,
  resetUser,
  setRedirectUrl,
} from "../../../redux/slices/userSlice";

import CartDropdown from "./CartDropdown";
import UserMenu from "./UserMenu";
import NavigationButtons from "./NavigationButtons";
import { useSnackbar } from "notistack";

const StyledToolbar = styled(Toolbar)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  flexShrink: 0,
  borderRadius: theme.shape.borderRadius + 8,
  backdropFilter: "blur(24px)",
  border: "1px solid",
  borderColor: theme.palette.divider,
  backgroundColor: alpha(theme.palette.background.default, 0.4),
  boxShadow: theme.shadows[1],
  padding: "8px 12px",
  position: "relative",
}));

const calculateTotalPrice = (cart) => {
  return Object.values(cart)
    .reduce(
      (total, item) =>
        total + (item.DynamicPrice ? item.DynamicPrice : 0) * item.quantity,
      0
    )
    .toFixed(2);
};

function AppAppBar({ mode, toggleColorMode }) {
  const [open, setOpen] = useState(false);
  const dispatch = useDispatch();
  const cart = useSelector((state) => state.cart.items);
  const [cartOpen, setCartOpen] = useState(false);
  const cartItemCount = Object.keys(cart).reduce(
    (sum, key) => sum + cart[key].quantity,
    0
  );
  const theme = useTheme();
  const navigate = useNavigate();
  const { user, token } = useSelector((state) => state.user);
  const dashboardData = useSelector((state) => state.insights.data);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const products = useSelector((state) => state.products.items);
  const { enqueueSnackbar } = useSnackbar();
  const cartRef = useRef(null);
  const userMenuRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        cartRef.current &&
        !cartRef.current.contains(event.target) &&
        !event.target.closest(".MuiIconButton-root")
      ) {
        setCartOpen(false);
      }
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(event.target) &&
        !event.target.closest(".MuiIconButton-root")
      ) {
        setUserMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (products.length === 0) {
      dispatch(fetchProducts());
    }
  }, [products, dispatch]);

  useEffect(() => {
    if (token && !dashboardData) {
      dispatch(fetchDashboardData());
    }
  }, [token, dashboardData, dispatch]);

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

  const toggleUserMenu = () => {
    setUserMenuOpen(!userMenuOpen);
    if (!userMenuOpen) {
      setCartOpen(false);
    }
  };

  const toggleCart = () => {
    setCartOpen(!cartOpen);
    if (!cartOpen) {
      setUserMenuOpen(false);
    }
  };

  const handleSignIn = () => {
    dispatch(setRedirectUrl("/"));
    navigate("/signin");
  };

  const handleSignUp = () => {
    navigate("/signup");
  };

  const handleLogout = async () => {
    try {
      await axiosInstance.post(`/logout`, {}, { withCredentials: true });
      dispatch(logout());
      dispatch(resetCart());
      delete axiosInstance.defaults.headers.common["Authorization"];
      dispatch(resetUser());

      enqueueSnackbar("Logged out successfully!", { variant: "success" });

      setTimeout(() => {
        navigate("/signin");
      }, 100);
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const handleProceedToCheckout = () => {
    if (!user || !token) {
      dispatch(setRedirectUrl("/checkout"));
      navigate("/signin");
    } else {
      navigate("/checkout");
    }
  };

  const toggleDrawer = (newOpen) => () => {
    setOpen(newOpen);
  };

  const handleSitemarkClick = (event) => {
    if (event.ctrlKey || event.metaKey || event.button === 1) {
      event.preventDefault();
      window.open("/", "_blank");
    } else {
      handleReload();
    }
  };

  const increaseQuantity = async (productID) => {
    try {
      const product = cart[productID];

      if (product.quantity >= product.StockLevel) {
        enqueueSnackbar(
          `Cannot increase quantity. Only ${product.StockLevel} units of ${product.Name} are in stock.`,
          { variant: "warning" }
        );
        return;
      }

      await axiosInstance.post(
        `/cart`,
        { productId: productID, quantity: 1 },
        { withCredentials: true }
      );

      dispatch(fetchCart());

      const newQuantity = product.quantity + 1;

      enqueueSnackbar(`${product.Name} quantity increased to ${newQuantity}.`, {
        variant: "success",
      });
    } catch (err) {
      console.error("Error increasing product quantity:", err);
      enqueueSnackbar(`Error increasing quantity of ${product.Name}.`, {
        variant: "error",
      });
    }
  };

  const decreaseQuantity = async (productID) => {
    try {
      const product = cart[productID];

      if (!product || product.quantity <= 0) {
        return;
      }

      if (product.quantity > 1) {
        await axiosInstance.put(
          `/cart`,
          { productId: productID, quantity: product.quantity - 1 },
          { withCredentials: true }
        );

        dispatch(fetchCart());

        const newQuantity = product.quantity - 1;

        enqueueSnackbar(
          `${product.Name} quantity decreased to ${newQuantity}.`,
          { variant: "success" }
        );
      } else {
        await axiosInstance.delete(`/cart`, {
          data: { productId: productID },
          withCredentials: true,
        });

        dispatch(fetchCart());

        enqueueSnackbar(`${product.Name} removed from cart.`, {
          variant: "success",
        });
      }
    } catch (err) {
      console.error("Error decreasing product quantity:", err);
      enqueueSnackbar(`Error decreasing quantity of ${product.Name}.`, {
        variant: "error",
      });
    }
  };

  const iconColor =
    mode === "dark" ? theme.palette.common.white : theme.palette.common.black;

  const handleScrollTo = (id) => {
    if (id === "home") {
      document.documentElement.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    } else {
      document
        .getElementById(id)
        .scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const handleReload = () => {
    window.location.reload();
  };

  return (
    <>
      <AppBar
        position="fixed"
        sx={{
          boxShadow: 0,
          bgcolor: "transparent",
          backgroundImage: "none",
          mt: 2,
        }}
      >
        <Container maxWidth="lg">
          <StyledToolbar variant="dense" disableGutters>
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <Link
                to="/"
                onClick={handleSitemarkClick}
                style={{
                  display: "flex",
                  alignItems: "center",
                  textDecoration: "none",
                }}
              >
                <Sitemark />
              </Link>
            </Box>

            <NavigationButtons handleScrollTo={handleScrollTo} />

            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                ml: "auto",
                position: "relative",
                minWidth: "140px",
              }}
            >
              {!user ? (
                <>
                  <Button
                    color="primary"
                    variant="text"
                    size="small"
                    onClick={handleSignIn}
                    sx={{ display: { xs: "none", md: "inline-flex" } }}
                  >
                    Sign in
                  </Button>

                  <Button
                    color="primary"
                    variant="contained"
                    size="small"
                    onClick={handleSignUp}
                    sx={{ display: { xs: "none", md: "inline-flex" } }}
                  >
                    Sign up
                  </Button>
                  <ToggleColorMode
                    data-screenshot="toggle-mode"
                    mode={mode}
                    toggleColorMode={toggleColorMode}
                    sx={{ display: { xs: "none", md: "flex" } }}
                  />
                  <IconButton
                    color="inherit"
                    onClick={toggleCart}
                    sx={{
                      width: 40,
                      height: 40,
                      display: { xs: "none", md: "flex" },
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Badge
                      badgeContent={cartItemCount}
                      color="primary"
                      anchorOrigin={{
                        vertical: "top",
                        horizontal: "right",
                      }}
                      sx={{
                        "& .MuiBadge-badge": {
                          fontSize: "0.75rem",
                          height: "20px",
                          minWidth: "20px",
                          border: `2px solid ${theme.palette.background.paper}`,
                          padding: "0 4px",
                          transform: "translate(50%, -50%)",
                          display: cartItemCount > 0 ? "flex" : "none",
                        },
                      }}
                    >
                      <ShoppingCartIcon
                        sx={{ color: iconColor, cursor: "pointer" }}
                      />
                    </Badge>
                  </IconButton>
                </>
              ) : (
                <>
                  <IconButton
                    color="inherit"
                    onClick={toggleUserMenu}
                    sx={{
                      width: 40,
                      height: 40,
                      display: { xs: "none", md: "flex" },
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <AccountCircleIcon />
                  </IconButton>
                  <ToggleColorMode
                    data-screenshot="toggle-mode"
                    mode={mode}
                    toggleColorMode={toggleColorMode}
                    sx={{ display: { xs: "none", md: "flex" } }}
                  />
                  <IconButton
                    color="inherit"
                    onClick={toggleCart}
                    sx={{
                      width: 40,
                      height: 40,
                      display: { xs: "none", md: "flex" },
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Badge
                      badgeContent={cartItemCount}
                      color="primary"
                      anchorOrigin={{
                        vertical: "top",
                        horizontal: "right",
                      }}
                      sx={{
                        "& .MuiBadge-badge": {
                          fontSize: "0.75rem",
                          height: "20px",
                          minWidth: "20px",
                          border: `2px solid ${theme.palette.background.paper}`,
                          padding: "0 4px",
                          transform: "translate(50%, -50%)",
                          display: cartItemCount > 0 ? "flex" : "none",
                        },
                      }}
                    >
                      <ShoppingCartIcon
                        sx={{ color: iconColor, cursor: "pointer" }}
                      />
                    </Badge>
                  </IconButton>

                  <UserMenu
                    userMenuOpen={userMenuOpen}
                    user={user}
                    handleLogout={handleLogout}
                    theme={theme}
                    ref={userMenuRef}
                  />
                </>
              )}
            </Box>
            <Box
              sx={{
                display: { xs: "flex", md: "none" },
                ml: "auto",
                alignItems: "center",
                gap: 0.4,
              }}
            >
              <ToggleColorMode
                data-screenshot="toggle-mode"
                mode={mode}
                toggleColorMode={toggleColorMode}
              />
              <IconButton
                color="inherit"
                onClick={toggleCart}
                sx={{
                  width: 40,
                  height: 40,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Badge
                  badgeContent={cartItemCount}
                  color="primary"
                  anchorOrigin={{
                    vertical: "top",
                    horizontal: "right",
                  }}
                  sx={{
                    "& .MuiBadge-badge": {
                      fontSize: "0.75rem",
                      height: "20px",
                      minWidth: "20px",
                      border: `2px solid ${theme.palette.background.paper}`,
                      padding: "0 4px",
                      transform: "translate(50%, -50%)",
                      display: cartItemCount > 0 ? "flex" : "none",
                    },
                  }}
                >
                  <ShoppingCartIcon
                    sx={{ color: iconColor, cursor: "pointer" }}
                  />
                </Badge>
              </IconButton>
              <IconButton aria-label="Menu button" onClick={toggleDrawer(true)}>
                <MenuIcon />
              </IconButton>
              <Drawer anchor="top" open={open} onClose={toggleDrawer(false)}>
                <Box
                  sx={{
                    p: 2,
                    backgroundColor: theme.palette.background.default,
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <IconButton onClick={toggleDrawer(false)}>
                      <CloseRoundedIcon />
                    </IconButton>
                  </Box>
                  <Divider sx={{ my: 3 }} />
                  {user ? (
                    <Box sx={{ textAlign: "center" }}>
                      <Typography variant="h6" gutterBottom>
                        {user.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {user.email}
                      </Typography>
                      <Button
                        variant="contained"
                        color="secondary"
                        fullWidth
                        sx={{ mt: 2 }}
                        onClick={() =>
                          navigate(
                            user.role === "admin"
                              ? "/admin-dashboard"
                              : "/customer-dashboard"
                          )
                        }
                      >
                        Dashboard
                      </Button>
                      <Button
                        variant="contained"
                        color="primary"
                        fullWidth
                        sx={{ mt: 2 }}
                        onClick={handleLogout}
                      >
                        Logout
                      </Button>
                    </Box>
                  ) : (
                    <>
                      <MenuItem onClick={handleSignIn}>
                        <Button color="primary" variant="outlined" fullWidth>
                          Sign in
                        </Button>
                      </MenuItem>
                      <MenuItem onClick={handleSignUp}>
                        <Button color="primary" variant="contained" fullWidth>
                          Sign up
                        </Button>
                      </MenuItem>
                    </>
                  )}
                </Box>
              </Drawer>
            </Box>

            <CartDropdown
              cartOpen={cartOpen}
              cart={cart}
              increaseQuantity={increaseQuantity}
              decreaseQuantity={decreaseQuantity}
              calculateTotalPrice={calculateTotalPrice}
              handleProceedToCheckout={handleProceedToCheckout}
              theme={theme}
              ref={cartRef}
            />
          </StyledToolbar>
        </Container>
      </AppBar>
    </>
  );
}

AppAppBar.propTypes = {
  mode: PropTypes.oneOf(["dark", "light"]).isRequired,
  toggleColorMode: PropTypes.func.isRequired,
};

export default AppAppBar;

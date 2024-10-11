import * as React from "react";
import PropTypes from "prop-types";
import Box from "@mui/material/Box";
import { styled } from "@mui/material/styles";
import Divider, { dividerClasses } from "@mui/material/Divider";
import Drawer, { drawerClasses } from "@mui/material/Drawer";
import Stack from "@mui/material/Stack";
import Avatar from "@mui/material/Avatar";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";
import MenuContent from "../shared/MenuContent";
import OptionsMenu from "../SideMenu/OptionsMenu";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../../api/axiosInstance";
import { logout, resetUser } from "../../../redux/slices/userSlice";
import { resetCart } from "../../../redux/slices/cartSlice";

const SideMenuMobile = ({ open, toggleDrawer, setSelectedMenuItem, selectedMenuItem }) => {
  const user = useSelector((state) => state.user.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogoutClick = async () => {
    try {
      await axiosInstance.post(`/logout`, {}, { withCredentials: true });
      dispatch(logout());
      dispatch(resetCart());
      delete axiosInstance.defaults.headers.common["Authorization"];
      dispatch(resetUser());
      navigate("/signin");
      setTimeout(() => {
        navigate("/");
      }, 100);
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const handleProfileClick = () => {
    setSelectedMenuItem("Profile");
  };

  const handleAddAccountClick = () => {
    setSelectedMenuItem("AddAccount");
  };

  return (
    <Drawer
      anchor="left"
      open={open}
      onClose={toggleDrawer(false)}
      sx={{
        [`& .${drawerClasses.paper}`]: {
          backgroundImage: "none",
          backgroundColor: "background.paper",
        },
      }}
    >
      <Stack
        sx={{
          maxWidth: "70dvw",
          height: "100%",
        }}
      >
        <Divider />
        <Stack sx={{ flexGrow: 1, mt: "3.5rem" }}>
          <MenuContent
            setSelectedMenuItem={setSelectedMenuItem}
            selectedMenuItem={selectedMenuItem}
          />
          <Divider />
        </Stack>
        <Stack direction="row" sx={{ p: 2, pb: 0, gap: 1 }}>
          <Stack
            direction="row"
            sx={{ gap: 1, alignItems: "center", flexGrow: 1, p: 1 }}
          >
            <Avatar
              sizes="small"
              alt={user?.name || "User"}
              src="/static/images/avatar/7.jpg"
              sx={{ width: 36, height: 36 }}
            />
            <Box sx={{ flexGrow: 1, minWidth: -0.5 }}>
              <Typography
                variant="body2"
                sx={{ fontWeight: 500, lineHeight: "16px" }}
              >
                {user?.name || "User Name"}
              </Typography>
              <Typography variant="caption" sx={{ color: "text.secondary" }}>
                {user?.email || "user@example.com"}
              </Typography>
            </Box>
            <OptionsMenu
              onLogout={handleLogoutClick}
              onProfileClick={handleProfileClick}
              onAddAccountClick={handleAddAccountClick}
            />
          </Stack>
        </Stack>
      </Stack>
    </Drawer>
  );
};

SideMenuMobile.propTypes = {
  open: PropTypes.bool,
  toggleDrawer: PropTypes.func.isRequired,
  setSelectedMenuItem: PropTypes.func.isRequired,
  selectedMenuItem: PropTypes.string.isRequired,
};

export default SideMenuMobile;

import * as React from "react";
import { styled } from "@mui/material/styles";
import Avatar from "@mui/material/Avatar";
import MuiDrawer, { drawerClasses } from "@mui/material/Drawer";
import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import MenuContent from "../shared/MenuContent";
import OptionsMenu from "./OptionsMenu";
import { useSelector, useDispatch } from "react-redux";
import { handleLogout, logout, resetUser } from "../../../redux/slices/userSlice";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../../api/axiosInstance";
import { resetCart } from "../../../redux/slices/cartSlice";

const drawerWidth = 240;

const Drawer = styled(MuiDrawer)({
  width: drawerWidth,
  flexShrink: 0,
  boxSizing: "border-box",
  mt: 10,
  [`& .${drawerClasses.paper}`]: {
    width: drawerWidth,
    boxSizing: "border-box",
  },
});

export default function SideMenu({ setSelectedMenuItem, selectedMenuItem }) {
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
      variant="permanent"
      sx={{
        display: { xs: "none", md: "block" },
        [`& .${drawerClasses.paper}`]: {
          backgroundColor: "background.paper",
        },
      }}
    >
      <Box
        sx={{
          display: "flex",
          mt: "40px",
          p: 1.5,
        }}
      >
      </Box>
      <MenuContent setSelectedMenuItem={setSelectedMenuItem} selectedMenuItem={selectedMenuItem} />
      <Stack
        direction="row"
        sx={{
          p: 2,
          gap: 1,
          alignItems: "center",
          borderTop: "1px solid",
          borderColor: "divider",
          marginLeft: -1,
        }}
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
        <Box sx={{ ml: -1.2 }}>
          <OptionsMenu 
            onLogout={handleLogoutClick}
            onProfileClick={handleProfileClick}
            onAddAccountClick={handleAddAccountClick}
          />
        </Box>
      </Stack>
    </Drawer>
  );
}

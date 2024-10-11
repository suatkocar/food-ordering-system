import * as React from "react";
import Stack from "@mui/material/Stack";
import CustomDatePicker from "./CustomDatePicker";
import NavbarBreadcrumbs from "./NavbarBreadcrumbs";

export default function Header({ selectedMenuItem }) {
  return (
    <Stack
      direction="row"
      sx={{
        display: { xs: "none", md: "flex" },
        width: "100%",
        alignItems: { xs: "flex-start", md: "center" },
        justifyContent: "space-between",
        maxWidth: { sm: "100%", md: "1700px" },
        pt: 1.5,
      }}
      spacing={2}
    >
      <NavbarBreadcrumbs selectedMenuItem={selectedMenuItem} />
      <Stack direction="row" sx={{ gap: 1 }}>
        <CustomDatePicker />
      </Stack>
    </Stack>
  );
}
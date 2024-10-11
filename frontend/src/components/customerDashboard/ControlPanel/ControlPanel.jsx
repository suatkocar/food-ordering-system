import * as React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import CustomizedDataGrid from "./CustomizedDataGrid";

const ControlPanel = React.memo(() => {
  return (
    <Box sx={{ width: "100%", maxWidth: "100%", display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <Typography component="h2" variant="h6" sx={{ mb: 2, mt: 2, textAlign: 'center' }}>
        Order History
      </Typography>
      <CustomizedDataGrid />
    </Box>
  );
});

export default ControlPanel;

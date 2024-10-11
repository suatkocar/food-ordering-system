import React, { useMemo } from "react";
import { useSelector } from "react-redux";
import { Treemap, Tooltip, ResponsiveContainer } from "recharts";
import Typography from "@mui/material/Typography";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Stack from "@mui/material/Stack";
import Box from "@mui/material/Box";
import { useTheme } from "@mui/material/styles";
import CircularProgress from "@mui/material/CircularProgress";

const LOYALTY_INFO = {
  "New Customer": { color: "#F2CD00", range: "1 Order" },
  "Occasional Customer": { color: "#EF6A00", range: "2-5 Order" },
  "Loyal Customer": { color: "#CD001A", range: "6-10 Order" },
  "Very Loyal Customer": { color: "#61007D", range: "11-15 Order" },
  "Elite Customer": { color: "#1961AE", range: "16-20 Order" },
  "Super Elite Customer": { color: "#79C300", range: "20+ Order" },
};

const CustomTooltip = ({ active, payload, theme }) => {
  if (active && payload && payload.length) {
    const { name, value } = payload[0];
    return (
      <div
        style={{
          backgroundColor: theme.palette.background.paper,
          color: theme.palette.text.primary,
          border: `1px solid ${theme.palette.divider}`,
          padding: "5px"
        }}
      >
        <p>{name}</p>
        <p>{value} Customer</p>
      </div>
    );
  }
  return null;
};

const CustomContent = ({ root, depth, x, y, width, height, index, name, value, color, theme }) => {
  return (
    <g>
      <rect x={x} y={y} width={width} height={height} fill={color} stroke="#fff" rx={10} ry={10} />
      {width > 80 && height > 20 && (
        <text x={x + width / 2} y={y + height / 2} textAnchor="middle" fill={theme.palette.text.primary} fontSize={14}>
          {name}
        </text>
      )}
      {width > 80 && height > 40 && (
        <text x={x + width / 2} y={y + height / 2 + 15} textAnchor="middle" fill={theme.palette.text.primary} fontSize={12}>
          {value}
        </text>
      )}
    </g>
  );
};

const TreeMapComponent = React.memo(() => {
  const { customerLoyaltyStatus, loading, error } = useSelector((state) => state.insights);
  const theme = useTheme();

  const data = useMemo(() => {
    return customerLoyaltyStatus.map((item) => ({
      name: item.loyalty_status,
      value: item.customer_count,
      color: LOYALTY_INFO[item.loyalty_status].color,
    }));
  }, [customerLoyaltyStatus]);

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100%",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <Card variant="outlined" sx={{ display: "flex", flexDirection: "column", gap: "8px", flexGrow: 1 }}>
      <CardContent>
        <Typography component="h2" variant="subtitle2">
          Customer Loyalty Status
        </Typography>
        <ResponsiveContainer width="100%" height={300}>
          <Treemap
            data={data}
            dataKey="value"
            stroke="#fff"
            fill="#fff"
            aspectRatio={4 / 3}
            animationDuration={500}
            animationEasing="ease-out"
            content={<CustomContent theme={theme} />}
          >
            <Tooltip content={<CustomTooltip theme={theme} />} />
          </Treemap>
        </ResponsiveContainer>
        <Box mt={2}>
          <Stack direction="column" spacing={1}>
            {Object.keys(LOYALTY_INFO).map((status) => (
              <Box key={status} sx={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'start' }}>
                <Box sx={{ width: '20px', height: '20px', backgroundColor: LOYALTY_INFO[status].color, borderRadius: '4px' }} />
                <Typography variant="body2">
                  {status} ({LOYALTY_INFO[status].range})
                </Typography>
              </Box>
            ))}
          </Stack>
        </Box>
      </CardContent>
    </Card>
  );
});

export default TreeMapComponent;

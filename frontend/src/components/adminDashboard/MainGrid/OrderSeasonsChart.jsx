import * as React from "react";
import PropTypes from "prop-types";
import { useSelector } from "react-redux";
import { PieChart } from "@mui/x-charts/PieChart";
import { useDrawingArea } from "@mui/x-charts/hooks";
import { styled } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import LinearProgress, {
  linearProgressClasses,
} from "@mui/material/LinearProgress";

const seasons = [
  {
    name: "Winter",
    icon: "❄️",
    color: "hsl(180, 60%, 70%)",
  },
  {
    name: "Spring",
    icon: "🌸",
    color: "hsl(120, 40%, 50%)",
  },
  {
    name: "Summer",
    icon: "☀️",
    color: "hsl(45, 100%, 60%)",
  },
  {
    name: "Autumn",
    icon: "🍂",
    color: "hsl(30, 100%, 50%)",
  },
];

const colors = seasons.map((season) => season.color);

const StyledText = styled("text", {
  shouldForwardProp: (prop) => prop !== "variant",
})(({ theme }) => ({
  textAnchor: "middle",
  dominantBaseline: "central",
  fill: theme.palette.text.secondary,
  variants: [
    {
      props: {
        variant: "primary",
      },
      style: {
        fontSize: theme.typography.h5.fontSize,
      },
    },
    {
      props: ({ variant }) => variant !== "primary",
      style: {
        fontSize: theme.typography.body2.fontSize,
      },
    },
    {
      props: {
        variant: "primary",
      },
      style: {
        fontWeight: theme.typography.h5.fontWeight,
      },
    },
    {
      props: ({ variant }) => variant !== "primary",
      style: {
        fontWeight: theme.typography.body2.fontWeight,
      },
    },
  ],
}));

function PieCenterLabel({ primaryText, secondaryText }) {
  const { width, height, left, top } = useDrawingArea();
  const primaryY = top + height / 2 - 10;
  const secondaryY = primaryY + 24;

  return (
    <React.Fragment>
      <StyledText variant="primary" x={left + width / 2} y={primaryY}>
        {primaryText}
      </StyledText>
      <StyledText variant="secondary" x={left + width / 2} y={secondaryY}>
        {secondaryText}
      </StyledText>
    </React.Fragment>
  );
}

PieCenterLabel.propTypes = {
  primaryText: PropTypes.string.isRequired,
  secondaryText: PropTypes.string.isRequired,
};

export default function OrderSeasonsChart() {
  const { salesBySeason, loading, error } = useSelector((state) => state.insights);
  const [totalOrders, setTotalOrders] = React.useState(0);

  React.useEffect(() => {
    if (salesBySeason.length > 0) {
      const total = salesBySeason.reduce((sum, item) => sum + item.total_orders, 0);
      setTotalOrders(total);
    }
  }, [salesBySeason]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  const formattedData = salesBySeason.map((item) => ({
    label: item.season,
    value: item.total_orders,
  }));

  const seasonData = seasons.map((season) => {
    const seasonSales = salesBySeason.find((s) => s.season === season.name);
    return {
      ...season,
      value: seasonSales ? seasonSales.total_orders : 0,
    };
  });

  return (
    <Card
      variant="outlined"
      sx={{ display: "flex", flexDirection: "column", gap: "8px", flexGrow: 1 }}
    >
      <CardContent>
        <Typography component="h2" variant="subtitle2">
          Orders by Season
        </Typography>
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <PieChart
            colors={colors}
            margin={{
              left: 80,
              right: 80,
              top: 80,
              bottom: 80,
            }}
            series={[
              {
                data: seasonData.map((season) => ({
                  label: season.name,
                  value: season.value,
                  color: season.color,
                })),
                innerRadius: 75,
                outerRadius: 100,
                paddingAngle: 0,
                highlightScope: { faded: "global", highlighted: "item" },
              },
            ]}
            height={260}
            width={260}
            slotProps={{
              legend: { hidden: true },
            }}
          >
            <PieCenterLabel primaryText={totalOrders.toString()} secondaryText="" />
          </PieChart>
        </Box>
        {seasonData.map((season, index) => (
          <Stack
            key={index}
            direction="row"
            sx={{ alignItems: "center", gap: 2, pb: 2 }}
          >
            <Typography variant="h5">{season.icon}</Typography>
            <Stack sx={{ gap: 1, flexGrow: 1 }}>
              <Stack
                direction="row"
                sx={{
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: 2,
                }}
              >
                <Typography variant="body2" sx={{ fontWeight: "500" }}>
                  {season.name}
                </Typography>
                <Typography variant="body2" sx={{ color: "text.secondary" }}>
                  {totalOrders > 0 ? ((season.value / totalOrders) * 100).toFixed(2) : 0}%
                </Typography>
              </Stack>
              <LinearProgress
                variant="determinate"
                aria-label="Number of orders by season"
                value={totalOrders > 0 ? (season.value / totalOrders) * 100 : 0}
                sx={{
                  [`& .${linearProgressClasses.bar}`]: {
                    backgroundColor: season.color,
                  },
                }}
              />
            </Stack>
          </Stack>
        ))}
      </CardContent>
    </Card>
  );
}

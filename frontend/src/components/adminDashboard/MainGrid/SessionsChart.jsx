import * as React from "react";
import PropTypes from "prop-types";
import { useTheme } from "@mui/material/styles";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import { LineChart } from "@mui/x-charts/LineChart";
import { useSelector } from "react-redux";

function AreaGradient({ color, id }) {
  return (
    <defs>
      <linearGradient id={id} x1="50%" y1="0%" x2="50%" y2="100%">
        <stop offset="0%" stopColor={color} stopOpacity={0.5} />
        <stop offset="100%" stopColor={color} stopOpacity={0} />
      </linearGradient>
    </defs>
  );
}

AreaGradient.propTypes = {
  color: PropTypes.string.isRequired,
  id: PropTypes.string.isRequired,
};


function getLast30Days() {
  const dates = [];
  for (let i = 29; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    dates.push(
      date.toLocaleDateString("en-US", { month: "long", day: "numeric" })
    );
  }
  return dates;
}

function fillMissingDates(data, dates) {
  const filledData = dates.map((date) => {
    const item = data.find(
      (d) =>
        new Date(d.order_date).toLocaleDateString("en-US", {
          month: "long",
          day: "numeric",
        }) === date
    );
    return item ? item.daily_sales : 0;
  });
  return filledData;
}

const SessionsChart = React.memo(() => {
  const theme = useTheme();
  const {
    topProductsDailySalesLast30Days,
    topProductsDailySalesLast60Days,
    loading,
    error,
  } = useSelector((state) => state.insights);

  const productNames = React.useMemo(
    () => [
      ...new Set(
        topProductsDailySalesLast30Days.map((item) => item.product_name)
      ),
    ],
    [topProductsDailySalesLast30Days]
  );
  const dates = React.useMemo(() => getLast30Days(), []);

  const series = React.useMemo(() => {
    return productNames.map((productName, index) => {
      const productData = topProductsDailySalesLast30Days.filter(
        (item) => item.product_name === productName
      );
      const filledData = fillMissingDates(productData, dates);

      return {
        id: productName,
        label: productName,
        showMark: false,
        curve: "linear",
        area: false,
        data: filledData,
      };
    });
  }, [productNames, topProductsDailySalesLast30Days, dates]);

  const colorPalette = [
    theme.palette.primary.light,
    theme.palette.primary.main,
    theme.palette.primary.dark,
    theme.palette.secondary.light,
    theme.palette.secondary.main,
    theme.palette.secondary.dark,
    theme.palette.error.light,
    theme.palette.error.main,
    theme.palette.error.dark,
    theme.palette.warning.light,
  ];

  const totalSalesLast30Days = React.useMemo(
    () =>
      topProductsDailySalesLast30Days.reduce(
        (acc, item) => acc + Number(item.daily_sales),
        0
      ),
    [topProductsDailySalesLast30Days]
  );

  const previous30DaysSales = React.useMemo(() => {
    return topProductsDailySalesLast60Days
      .filter(
        (item) =>
          new Date(item.order_date) <
          new Date(new Date().setDate(new Date().getDate() - 30))
      )
      .reduce((acc, item) => acc + Number(item.daily_sales), 0);
  }, [topProductsDailySalesLast60Days]);

  const percentageChange = previous30DaysSales
    ? ((totalSalesLast30Days - previous30DaysSales) / previous30DaysSales) * 100
    : 0;

  const tickValues = React.useMemo(
    () => [
      dates[0],
      ...dates.filter((_, index) => (index + 1) % 5 === 0),
      dates[dates.length - 1],
    ],
    [dates]
  );

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <Card variant="outlined" sx={{ width: "100%" }}>
      <CardContent>
        <Typography component="h2" variant="subtitle2" gutterBottom>
          Top 10 Products
        </Typography>
        <Stack sx={{ justifyContent: "space-between" }}>
          <Stack
            direction="row"
            sx={{
              alignContent: { xs: "center", sm: "flex-start" },
              alignItems: "center",
              gap: 1,
            }}
          >
            <Typography variant="h4" component="p">
              {totalSalesLast30Days}
            </Typography>
            <Chip
              size="small"
              color={percentageChange >= 0 ? "success" : "error"}
              label={`${percentageChange.toFixed(2)}%`}
            />
          </Stack>
          <Typography variant="caption" sx={{ color: "text.secondary" }}>
            Top 10 Products: Daily Sales (Last 30 Days)
          </Typography>
        </Stack>
        <LineChart
          colors={colorPalette}
          xAxis={[
            {
              scaleType: "point",
              data: dates,
              tickValues,
              tickFormat: (value) => {
                const date = new Date(value);
                return date.toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                });
              },
            },
          ]}
          series={series}
          height={250}
          margin={{ left: 50, right: 50, top: 20, bottom: 50 }}
          grid={{ horizontal: true }}
          animation={{
            duration: 500,
            easing: "easeOut",
          }}
          sx={{
            "& .MuiAreaElement-series-organic": {
              fill: "url('#organic')",
            },
            "& .MuiAreaElement-series-referral": {
              fill: "url('#referral')",
            },
            "& .MuiAreaElement-series-direct": {
              fill: "url('#direct')",
            },
          }}
          slotProps={{
            legend: {
              hidden: true,
            },
          }}
        >
          {productNames.map((productName, index) => (
            <AreaGradient
              key={productName}
              color={colorPalette[index % colorPalette.length]}
              id={productName}
            />
          ))}
        </LineChart>
      </CardContent>
    </Card>
  );
});

export default SessionsChart;

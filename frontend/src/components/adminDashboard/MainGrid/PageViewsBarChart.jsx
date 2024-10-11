import * as React from "react";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import { BarChart } from "@mui/x-charts/BarChart";
import { useTheme } from "@mui/material/styles";
import { useSelector } from "react-redux";

const PageViewsBarChart = React.memo(() => {
  const theme = useTheme();
  const { monthlyOrderDistributionByTime, loading, error } = useSelector(
    (state) => state.insights
  );

  const months = React.useMemo(
    () => [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ],
    []
  );

  const chartData = React.useMemo(() => {
    return months.map((month, idx) => {
      const data = monthlyOrderDistributionByTime.find(
        (d) => d.month === idx + 1
      ) || {
        orders_00_06: 0,
        orders_06_12: 0,
        orders_12_18: 0,
        orders_18_24: 0,
      };
      return { month, ...data };
    });
  }, [months, monthlyOrderDistributionByTime]);

  const getMaxTimeRange = React.useCallback((data) => {
    const timeRanges = [
      { range: "00:00 - 06:00", value: data.orders_00_06 },
      { range: "06:00 - 12:00", value: data.orders_06_12 },
      { range: "12:00 - 18:00", value: data.orders_12_18 },
      { range: "18:00 - 24:00", value: data.orders_18_24 },
    ];

    return timeRanges.reduce((max, curr) =>
      curr.value > max.value ? curr : max
    ).range;
  }, []);

  const mostOrderedTimeRanges = React.useMemo(() => {
    return chartData.map((data) => getMaxTimeRange(data));
  }, [chartData, getMaxTimeRange]);

  const series = React.useMemo(
    () => [
      {
        id: "orders_00_06",
        label: "00:00 - 06:00",
        data: chartData.map((data) => data.orders_00_06),
        stack: "A",
        color: theme.palette.primary.light,
      },
      {
        id: "orders_06_12",
        label: "06:00 - 12:00",
        data: chartData.map((data) => data.orders_06_12),
        stack: "A",
        color: theme.palette.primary.main,
      },
      {
        id: "orders_12_18",
        label: "12:00 - 18:00",
        data: chartData.map((data) => data.orders_12_18),
        stack: "A",
        color: theme.palette.info.main,
      },
      {
        id: "orders_18_24",
        label: "18:00 - 24:00",
        data: chartData.map((data) => data.orders_18_24),
        stack: "A",
        color: theme.palette.primary.dark,
      },
    ],
    [chartData, theme.palette]
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
          Monthly Order Distribution by Time Range
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
              Most Ordered Time Range:{" "}
              {mostOrderedTimeRanges[new Date().getMonth()]}
            </Typography>
            <Chip size="small" color="primary" label="This Year" />
          </Stack>
          <Typography variant="caption" sx={{ color: "text.secondary" }}>
            Order distributions for the current year by time range
          </Typography>
        </Stack>
        <BarChart
          borderRadius={8}
          colors={series.map((serie) => serie.color)}
          xAxis={[
            {
              scaleType: "band",
              categoryGapRatio: 0.5,
              data: months,
            },
          ]}
          series={series}
          height={250}
          margin={{ left: 50, right: 0, top: 20, bottom: 20 }}
          grid={{ horizontal: true }}
          animation={{
            duration: 500,
            easing: "easeOut",
          }}
          slotProps={{
            legend: {
              hidden: true,
            },
          }}
        />
      </CardContent>
    </Card>
  );
});

export default PageViewsBarChart;

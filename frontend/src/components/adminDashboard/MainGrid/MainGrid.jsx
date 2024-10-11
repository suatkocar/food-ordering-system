import * as React from "react";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { useDispatch, useSelector } from "react-redux";
import { fetchOrderStats } from "../../../redux/slices/orderStatsSlice";
import { fetchRevenueStats } from "../../../redux/slices/revenueStatsSlice";
import { fetchProfitStats } from "../../../redux/slices/profitStatsSlice";
import StatCard from "./StatCard";
import SessionsChart from "./SessionsChart";
import PageViewsBarChart from "./PageViewsBarChart";
import Chip from "@mui/material/Chip";
import OrderSeasonsChart from "./OrderSeasonsChart";
import TreeMapComponent from "./TreeMapComponent";
import BubbleChartComponent from "./BubbleChartComponent";
import CircularProgress from "@mui/material/CircularProgress";

function formatCurrency(value) {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
  }).format(value);
}

function getLastValidValue(data, index) {
  for (let i = index - 1; i >= 0; i--) {
    if (data[i].total_orders !== 0) {
      return Number(data[i].total_orders);
    }
  }
  return 0;
}

function getLastValidRevenueValue(data, index) {
  for (let i = index - 1; i >= 0; i--) {
    if (data[i].total_revenue !== 0) {
      return Number(data[i].total_revenue);
    }
  }
  return 0;
}

function getLastValidProfitValue(data, index) {
  for (let i = index - 1; i >= 0; i--) {
    if (data[i].total_profit !== 0) {
      return Number(data[i].total_profit);
    }
  }
  return 0;
}

function calculatePercentageChange(currentValue, previousValue) {
  if (previousValue === 0) {
    return currentValue === 0 ? 0 : 100;
  }
  const change = ((currentValue - previousValue) / previousValue) * 100;
  return isNaN(change) ? 0 : change.toFixed(2);
}

const getCurrentWeek = () => {
  const today = new Date();
  const oneJan = new Date(today.getFullYear(), 0, 1);
  const numberOfDays = Math.floor((today - oneJan) / (24 * 60 * 60 * 1000));
  return Math.ceil((numberOfDays + 1) / 7);
};

const getCurrentMonth = () => {
  return new Date().getMonth() + 1;
};

const getCurrentYear = () => {
  return new Date().getFullYear();
};

const LazyBubbleChartComponent = React.lazy(() => 
  new Promise(resolve => {
    setTimeout(() => {
      resolve(import('./BubbleChartComponent'));
    }, 100);
  })
);

const MainGrid = React.memo(() => {
  const dispatch = useDispatch();
  const orderStats = useSelector(
    (state) => state.orderStats.data.current || []
  );
  const revenueStats = useSelector(
    (state) => state.revenueStats.data.current || []
  );
  const profitStats = useSelector(
    (state) => state.profitStats.data.current || []
  );
  const status = useSelector((state) => state.orderStats.status);

  const [interval, setInterval] = React.useState("daily");

  React.useEffect(() => {
    dispatch(fetchOrderStats(interval));
    dispatch(fetchRevenueStats(interval));
    dispatch(fetchProfitStats(interval));
  }, [dispatch, interval]);

  const sortedOrderStats = React.useMemo(() => {
    return [...orderStats].sort((a, b) => {
      if (interval === "daily") {
        return new Date(a.date) - new Date(b.date);
      } else if (interval === "weekly") {
        return a.week_number - b.week_number;
      } else if (interval === "monthly") {
        return a.month_number - b.month_number;
      } else if (interval === "yearly") {
        return a.year_number - b.year_number;
      }
      return 0;
    });
  }, [orderStats, interval]);

  const sortedRevenueStats = React.useMemo(() => {
    return [...revenueStats].sort((a, b) => {
      if (interval === "daily") {
        return new Date(a.date) - new Date(b.date);
      } else if (interval === "weekly") {
        return a.week_number - b.week_number;
      } else if (interval === "monthly") {
        return a.month_number - b.month_number;
      } else if (interval === "yearly") {
        return a.year_number - b.year_number;
      }
      return 0;
    });
  }, [revenueStats, interval]);

  const sortedProfitStats = React.useMemo(() => {
    return [...profitStats].sort((a, b) => {
      if (interval === "daily") {
        return new Date(a.date) - new Date(b.date);
      } else if (interval === "weekly") {
        return a.week_number - b.week_number;
      } else if (interval === "monthly") {
        return a.month_number - b.month_number;
      } else if (interval === "yearly") {
        return a.year_number - b.year_number;
      }
      return 0;
    });
  }, [profitStats, interval]);

  const truncatedOrderStats = React.useMemo(() => {
    return interval === "yearly"
      ? sortedOrderStats.slice(-5)
      : interval === "monthly"
        ? sortedOrderStats.slice(-12)
        : interval === "weekly"
          ? sortedOrderStats.slice(-getCurrentWeek())
          : sortedOrderStats.slice(-30);
  }, [sortedOrderStats, interval]);

  const truncatedRevenueStats = React.useMemo(() => {
    return interval === "yearly"
      ? sortedRevenueStats.slice(-5)
      : interval === "monthly"
        ? sortedRevenueStats.slice(-12)
        : interval === "weekly"
          ? sortedRevenueStats.slice(-getCurrentWeek())
          : sortedRevenueStats.slice(-30);
  }, [sortedRevenueStats, interval]);

  const truncatedProfitStats = React.useMemo(() => {
    return interval === "yearly"
      ? sortedProfitStats.slice(-5)
      : interval === "monthly"
        ? sortedProfitStats.slice(-12)
        : interval === "weekly"
          ? sortedProfitStats.slice(-getCurrentWeek())
          : sortedProfitStats.slice(-30);
  }, [sortedProfitStats, interval]);

  const totalOrders = truncatedOrderStats.reduce(
    (acc, curr) => acc + Number(curr.total_orders),
    0
  );
  const avgOrders = truncatedOrderStats.length
    ? totalOrders / truncatedOrderStats.length
    : 0;

  let currentOrders = 0;
  let previousOrders = 0;

  if (interval === "daily") {
    if (truncatedOrderStats.length >= 1) {
      currentOrders = Number(
        truncatedOrderStats[truncatedOrderStats.length - 1].total_orders
      );
    }
    if (currentOrders === 0 && truncatedOrderStats.length >= 3) {
      currentOrders = getLastValidValue(
        truncatedOrderStats,
        truncatedOrderStats.length - 1
      );
      previousOrders = getLastValidValue(
        truncatedOrderStats,
        truncatedOrderStats.length - 2
      );
    } else {
      previousOrders =
        truncatedOrderStats.length >= 2
          ? Number(
              truncatedOrderStats[truncatedOrderStats.length - 2].total_orders
            )
          : 0;
    }
  } else if (interval === "weekly") {
    const currentWeek = getCurrentWeek();
    const currentWeekData = sortedOrderStats.find(
      (stat) => stat.week_number === currentWeek
    );
    const previousWeekData = sortedOrderStats.find(
      (stat) => stat.week_number === currentWeek - 1
    );
    currentOrders = currentWeekData ? Number(currentWeekData.total_orders) : 0;
    previousOrders = previousWeekData
      ? Number(previousWeekData.total_orders)
      : 0;
    if (currentOrders === 0 && currentWeekData) {
      currentOrders = getLastValidValue(
        sortedOrderStats.slice(0, currentWeekData.length)
      );
      previousOrders = getLastValidValue(
        sortedOrderStats.slice(0, currentWeekData.length - 1)
      );
    }
  } else if (interval === "monthly") {
    const currentMonth = getCurrentMonth();
    const currentMonthData = sortedOrderStats.find(
      (stat) => stat.month_number === currentMonth
    );
    const previousMonthData = sortedOrderStats.find(
      (stat) => stat.month_number === currentMonth - 1
    );
    currentOrders = currentMonthData
      ? Number(currentMonthData.total_orders)
      : 0;
    previousOrders = previousMonthData
      ? Number(previousMonthData.total_orders)
      : 0;
    if (currentOrders === 0 && currentMonthData) {
      currentOrders = getLastValidValue(
        sortedOrderStats.slice(0, currentMonthData.length)
      );
      previousOrders = getLastValidValue(
        sortedOrderStats.slice(0, currentMonthData.length - 1)
      );
    }
  } else if (interval === "yearly") {
    const currentYear = new Date().getFullYear();
    const previousYear = currentYear - 1;
    const currentYearData = sortedOrderStats.find(
      (stat) => stat.year_number === currentYear
    );
    const previousYearData = sortedOrderStats.find(
      (stat) => stat.year_number === previousYear
    );
    currentOrders = currentYearData ? Number(currentYearData.total_orders) : 0;
    previousOrders = previousYearData
      ? Number(previousYearData.total_orders)
      : 0;
    if (currentOrders === 0) {
      currentOrders = getLastValidValue(
        sortedOrderStats,
        sortedOrderStats.length
      );
    }
    if (previousOrders === 0) {
      previousOrders = getLastValidValue(
        sortedOrderStats,
        sortedOrderStats.length - 1
      );
    }
  }

  const totalRevenue = truncatedRevenueStats.reduce(
    (acc, curr) => acc + Number(curr.total_revenue),
    0
  );
  const avgRevenue = truncatedRevenueStats.length
    ? totalRevenue / truncatedRevenueStats.length
    : 0;

  let currentRevenue = 0;
  let previousRevenue = 0;

  if (interval === "daily") {
    if (truncatedRevenueStats.length >= 1) {
      currentRevenue = Number(
        truncatedRevenueStats[truncatedRevenueStats.length - 1].total_revenue
      );
    }
    if (currentRevenue === 0 && truncatedRevenueStats.length >= 3) {
      currentRevenue = getLastValidRevenueValue(
        truncatedRevenueStats,
        truncatedRevenueStats.length - 1
      );
      previousRevenue = getLastValidRevenueValue(
        truncatedRevenueStats,
        truncatedRevenueStats.length - 2
      );
    } else {
      previousRevenue =
        truncatedRevenueStats.length >= 2
          ? Number(
              truncatedRevenueStats[truncatedRevenueStats.length - 2]
                .total_revenue
            )
          : 0;
    }
  } else if (interval === "weekly") {
    const currentWeek = getCurrentWeek();
    const currentWeekData = sortedRevenueStats.find(
      (stat) => stat.week_number === currentWeek
    );
    const previousWeekData = sortedRevenueStats.find(
      (stat) => stat.week_number === currentWeek - 1
    );
    currentRevenue = currentWeekData
      ? Number(currentWeekData.total_revenue)
      : 0;
    previousRevenue = previousWeekData
      ? Number(previousWeekData.total_revenue)
      : 0;
    if (currentRevenue === 0 && currentWeekData) {
      currentRevenue = getLastValidRevenueValue(
        sortedRevenueStats.slice(0, currentWeekData.length)
      );
      previousRevenue = getLastValidRevenueValue(
        sortedRevenueStats.slice(0, currentWeekData.length - 1)
      );
    }
  } else if (interval === "monthly") {
    const currentMonth = getCurrentMonth();
    const currentMonthData = sortedRevenueStats.find(
      (stat) => stat.month_number === currentMonth
    );
    const previousMonthData = sortedRevenueStats.find(
      (stat) => stat.month_number === currentMonth - 1
    );
    currentRevenue = currentMonthData
      ? Number(currentMonthData.total_revenue)
      : 0;
    previousRevenue = previousMonthData
      ? Number(previousMonthData.total_revenue)
      : 0;
    if (currentRevenue === 0 && currentMonthData) {
      currentRevenue = getLastValidRevenueValue(
        sortedRevenueStats.slice(0, currentMonthData.length)
      );
      previousRevenue = getLastValidRevenueValue(
        sortedRevenueStats.slice(0, currentMonthData.length - 1)
      );
    }
  } else if (interval === "yearly") {
    const currentYear = getCurrentYear();
    const previousYear = currentYear - 1;
    const currentYearData = sortedRevenueStats.find(
      (stat) => stat.year_number === currentYear
    );
    const previousYearData = sortedRevenueStats.find(
      (stat) => stat.year_number === previousYear
    );
    currentRevenue = currentYearData
      ? Number(currentYearData.total_revenue)
      : 0;
    previousRevenue = previousYearData
      ? Number(previousYearData.total_revenue)
      : 0;
    if (currentRevenue === 0) {
      currentRevenue = getLastValidRevenueValue(
        sortedRevenueStats,
        sortedRevenueStats.length
      );
    }
    if (previousRevenue === 0) {
      previousRevenue = getLastValidRevenueValue(
        sortedRevenueStats,
        sortedRevenueStats.length - 1
      );
    }
  }

  const totalProfit = truncatedProfitStats.reduce(
    (acc, curr) => acc + Number(curr.total_profit),
    0
  );
  const avgProfit = truncatedProfitStats.length
    ? totalProfit / truncatedProfitStats.length
    : 0;

  let currentProfit = 0;
  let previousProfit = 0;

  if (interval === "daily") {
    if (truncatedProfitStats.length >= 1) {
      currentProfit = Number(
        truncatedProfitStats[truncatedProfitStats.length - 1].total_profit
      );
    }
    if (currentProfit === 0 && truncatedProfitStats.length >= 3) {
      currentProfit = getLastValidProfitValue(
        truncatedProfitStats,
        truncatedProfitStats.length - 1
      );
      previousProfit = getLastValidProfitValue(
        truncatedProfitStats,
        truncatedProfitStats.length - 2
      );
    } else {
      previousProfit =
        truncatedProfitStats.length >= 2
          ? Number(
              truncatedProfitStats[truncatedProfitStats.length - 2].total_profit
            )
          : 0;
    }
  } else if (interval === "weekly") {
    const currentWeek = getCurrentWeek();
    const currentWeekData = sortedProfitStats.find(
      (stat) => stat.week_number === currentWeek
    );
    const previousWeekData = sortedProfitStats.find(
      (stat) => stat.week_number === currentWeek - 1
    );
    currentProfit = currentWeekData ? Number(currentWeekData.total_profit) : 0;
    previousProfit = previousWeekData
      ? Number(previousWeekData.total_profit)
      : 0;
    if (currentProfit === 0 && currentWeekData) {
      currentProfit = getLastValidProfitValue(
        sortedProfitStats.slice(0, currentWeekData.length)
      );
      previousProfit = getLastValidProfitValue(
        sortedProfitStats.slice(0, currentWeekData.length - 1)
      );
    }
  } else if (interval === "monthly") {
    const currentMonth = getCurrentMonth();
    const currentMonthData = sortedProfitStats.find(
      (stat) => stat.month_number === currentMonth
    );
    const previousMonthData = sortedProfitStats.find(
      (stat) => stat.month_number === currentMonth - 1
    );
    currentProfit = currentMonthData
      ? Number(currentMonthData.total_profit)
      : 0;
    previousProfit = previousMonthData
      ? Number(previousMonthData.total_profit)
      : 0;
    if (currentProfit === 0 && currentMonthData) {
      currentProfit = getLastValidProfitValue(
        sortedProfitStats.slice(0, currentMonthData.length)
      );
      previousProfit = getLastValidProfitValue(
        sortedProfitStats.slice(0, currentMonthData.length - 1)
      );
    }
  } else if (interval === "yearly") {
    const currentYear = getCurrentYear();
    const previousYear = currentYear - 1;
    const currentYearData = sortedProfitStats.find(
      (stat) => stat.year_number === currentYear
    );
    const previousYearData = sortedProfitStats.find(
      (stat) => stat.year_number === previousYear
    );
    currentProfit = currentYearData ? Number(currentYearData.total_profit) : 0;
    previousProfit = previousYearData
      ? Number(previousYearData.total_profit)
      : 0;
    if (currentProfit === 0) {
      currentProfit = getLastValidProfitValue(
        sortedProfitStats,
        sortedProfitStats.length
      );
    }
    if (previousProfit === 0) {
      previousProfit = getLastValidProfitValue(
        sortedProfitStats,
        sortedProfitStats.length - 1
      );
    }
  }

  const totalRevenueFormatted = formatCurrency(totalRevenue);
  const currentRevenueFormatted = formatCurrency(currentRevenue);
  const totalProfitFormatted = formatCurrency(totalProfit);
  const currentProfitFormatted = formatCurrency(currentProfit);

  const percentageChange = calculatePercentageChange(
    currentOrders,
    previousOrders
  );

  const percentageChangeRevenue = calculatePercentageChange(
    currentRevenue,
    previousRevenue
  );

  const percentageChangeProfit = calculatePercentageChange(
    currentProfit,
    previousProfit
  );

  function getCompleteWeeklyData(data) {
    const totalWeeks = 52;
    const completeData = Array.from({ length: totalWeeks }, (_, index) => {
      const weekData = data.find((d) => d.week_number === index + 1);
      return weekData ? Number(weekData.total_orders) : 0;
    });

    return completeData;
  }

  function getCompleteWeeklyRevenueData(data) {
    const totalWeeks = 52;
    const completeData = Array.from({ length: totalWeeks }, (_, index) => {
      const weekData = data.find((d) => d.week_number === index + 1);
      return weekData ? Number(weekData.total_revenue) : 0;
    });

    return completeData;
  }

  function getCompleteWeeklyProfitData(data) {
    const totalWeeks = 52;
    const completeData = Array.from({ length: totalWeeks }, (_, index) => {
      const weekData = data.find((d) => d.week_number === index + 1);
      return weekData ? Number(weekData.total_profit) : 0;
    });

    return completeData;
  }

  const completeWeeklyData = React.useMemo(
    () => getCompleteWeeklyData(sortedOrderStats),
    [sortedOrderStats]
  );

  const completeData = React.useMemo(() => {
    return interval === "weekly"
      ? completeWeeklyData
      : truncatedOrderStats.map((stat) => Number(stat.total_orders));
  }, [truncatedOrderStats, interval, completeWeeklyData]);

  const completeRevenueData = React.useMemo(() => {
    return interval === "weekly"
      ? getCompleteWeeklyRevenueData(sortedRevenueStats)
      : truncatedRevenueStats.map((stat) => Number(stat.total_revenue));
  }, [truncatedRevenueStats, interval, sortedRevenueStats]);

  const completeProfitData = React.useMemo(() => {
    return interval === "weekly"
      ? getCompleteWeeklyProfitData(sortedProfitStats)
      : truncatedProfitStats.map((stat) => Number(stat.total_profit));
  }, [truncatedProfitStats, interval, sortedProfitStats]);

  const dates = React.useMemo(() => {
    if (interval === "daily") {
      return truncatedOrderStats.map((stat) => String(stat.date));
    }
    if (interval === "weekly") {
      return Array.from({ length: 52 }, (_, i) => `Week ${i + 1}`);
    }
    if (interval === "monthly") {
      return truncatedOrderStats.map((stat) => `Month ${stat.month_number}`);
    }
    if (interval === "yearly") {
      return truncatedOrderStats.map((stat) => `Year ${stat.year_number}`);
    }
    return [];
  }, [truncatedOrderStats, interval]);

  const revenueDates = React.useMemo(() => {
    if (interval === "daily") {
      return truncatedRevenueStats.map((stat) => String(stat.date));
    }
    if (interval === "weekly") {
      return Array.from({ length: 52 }, (_, i) => `Week ${i + 1}`);
    }
    if (interval === "monthly") {
      return truncatedRevenueStats.map((stat) => `Month ${stat.month_number}`);
    }
    if (interval === "yearly") {
      return truncatedRevenueStats.map((stat) => `Year ${stat.year_number}`);
    }
    return [];
  }, [truncatedRevenueStats, interval]);

  const profitDates = React.useMemo(() => {
    if (interval === "daily") {
      return truncatedProfitStats.map((stat) => String(stat.date));
    }
    if (interval === "weekly") {
      return Array.from({ length: 52 }, (_, i) => `Week ${i + 1}`);
    }
    if (interval === "monthly") {
      return truncatedProfitStats.map((stat) => `Month ${stat.month_number}`);
    }
    if (interval === "yearly") {
      return truncatedProfitStats.map((stat) => `Year ${stat.year_number}`);
    }
    return [];
  }, [truncatedProfitStats, interval]);

  const filteredDates = dates.filter((date) => date !== "Invalid Date");
  const filteredRevenueDates = revenueDates.filter(
    (date) => date !== "Invalid Date"
  );
  const filteredProfitDates = profitDates.filter(
    (date) => date !== "Invalid Date"
  );

  const statCards = [
    {
      title: "Total Orders",
      value: totalOrders.toString(),
      trend:
        currentOrders > previousOrders
          ? "up"
          : currentOrders < previousOrders
            ? "down"
            : "neutral",
      interval,
      data: completeData,
      dates: filteredDates,
      previousValue: Number(percentageChange),
      locale: "en-GB",
    },
    {
      title: "Average Orders",
      value: avgOrders.toFixed(2),
      trend:
        avgOrders >
        previousOrders / (previousOrders ? truncatedOrderStats.length : 1)
          ? "up"
          : avgOrders <
              previousOrders / (previousOrders ? truncatedOrderStats.length : 1)
            ? "down"
            : "neutral",
      interval,
      data: completeData,
      dates: filteredDates,
      previousValue: Number(percentageChange),
      locale: "en-GB",
    },
    {
      title: "Total Revenue",
      value: totalRevenueFormatted,
      trend:
        currentRevenue > previousRevenue
          ? "up"
          : currentRevenue < previousRevenue
            ? "down"
            : "neutral",
      interval,
      data: completeRevenueData,
      dates: filteredRevenueDates,
      previousValue: Number(percentageChangeRevenue),
      locale: "en-GB",
    },
    {
      title: "Total Profit",
      value: totalProfitFormatted,
      trend:
        currentProfit > previousProfit
          ? "up"
          : currentProfit < previousProfit
            ? "down"
            : "neutral",
      interval,
      data: completeProfitData,
      dates: filteredProfitDates,
      previousValue: Number(percentageChangeProfit),
      locale: "en-GB",
    },
  ];

  if (status === "loading") {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ 
      width: "100%", 
      maxWidth: { sm: "100%", md: "1700px" },
      display: "flex",
      flexDirection: "column",
      minHeight: "100%",
      paddingBottom: { xs: "80px", sm: "40px" },
    }}>

      <Typography component="h2" variant="h6" sx={{ mb: 2 }}>
        Overview -{" "}
        {interval === "yearly"
          ? `Last 5 Years`
          : interval === "monthly"
            ? `Monthly (Current Year)`
            : interval === "weekly"
              ? `Weekly (Current Year)`
              : "Last 30 Days"}
      </Typography>

      <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
        <Chip
          label="Daily"
          onClick={() => {
            setInterval("daily");
          }}
          color={interval === "daily" ? "primary" : "default"}
        />
        <Chip
          label="Weekly"
          onClick={() => {
            setInterval("weekly");
          }}
          color={interval === "weekly" ? "primary" : "default"}
        />
        <Chip
          label="Monthly"
          onClick={() => {
            setInterval("monthly");
          }}
          color={interval === "monthly" ? "primary" : "default"}
        />
        <Chip
          label="Yearly"
          onClick={() => {
            setInterval("yearly");
          }}
          color={interval === "yearly" ? "primary" : "default"}
        />
      </Stack>

      <Grid container spacing={2} columns={12} sx={{ mb: 2 }}>
        {statCards.map((card, index) => (
          <Grid item key={index} xs={12} sm={6} lg={3}>
            <StatCard {...card} />
          </Grid>
        ))}
        <Grid item xs={12} lg={6}>
          <Stack gap={2} direction={{ xs: "column", sm: "row", lg: "column" }}>
            <SessionsChart />
          </Stack>
        </Grid>
        <Grid item xs={12} lg={6}>
          <Stack gap={2} direction={{ xs: "column", sm: "row", lg: "column" }}>
            <PageViewsBarChart />
          </Stack>
        </Grid>
        <Grid item xs={12} lg={3}>
          <Stack gap={2} direction={{ xs: "column", sm: "row", lg: "column" }}>
            <OrderSeasonsChart />
          </Stack>
        </Grid>
        <Grid item xs={12} lg={3}>
          <Stack gap={2} direction={{ xs: "column", sm: "row", lg: "column" }}>
            <TreeMapComponent />
          </Stack>
        </Grid>
        <Grid item xs={12} lg={6} sx={{ overflow: "visible" }}>
          <Stack
            gap={2}
            direction={{ xs: "column", sm: "row", lg: "column" }}
            sx={{ overflow: "visible" }}
          >
            <BubbleChartComponent />
          </Stack>
        </Grid>
      </Grid>
    </Box>
  );
});

export default MainGrid;

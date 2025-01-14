import * as React from "react";
import PropTypes from "prop-types";
import { useTheme } from "@mui/material/styles";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { SparkLineChart } from "@mui/x-charts/SparkLineChart";
import { areaElementClasses } from "@mui/x-charts/LineChart";

const monthNames = [
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
];

const yearNames = ["2020", "2021", "2022", "2023", "2024"];

function formatXAxisDates(dates, interval, locale = 'en-GB') {
  if (interval === "yearly") {
    return dates.map(year => year.toString());
  }
  if (interval === "daily") {
    return dates.map(date => {
      const dateObj = new Date(date);
      return dateObj.toLocaleDateString(locale, {
        day: 'numeric',
        month: 'long'
      });
    });
  } else if (interval === "weekly") {
    return dates.map((week, index) =>
      week ? `${week}` : `Week ${index + 1}`
    );
  } else if (interval === "monthly") {
    return dates.map((month, index) => monthNames[month - 1]);
  }
  return dates;
}

function AreaGradient({ color, id }) {
  return (
    <defs>
      <linearGradient id={id} x1="50%" y1="0%" x2="50%" y2="100%">
        <stop offset="0%" stopColor={color} stopOpacity={0.3} />
        <stop offset="100%" stopColor={color} stopOpacity={0} />
      </linearGradient>
    </defs>
  );
}

AreaGradient.propTypes = {
  color: PropTypes.string.isRequired,
  id: PropTypes.string.isRequired,
};

function getCompleteDataForInterval(data, interval) {
  if (interval === "daily") {
    const totalDays = 30;
    return {
      completeData: Array.from({ length: totalDays }, (_, i) =>
        data[i] !== undefined ? data[i] : 0
      ),
      years: [],
    };
  } else if (interval === "weekly") {
    const totalWeeks = 52;
    return {
      completeData: Array.from({ length: totalWeeks }, (_, i) =>
        data[i] !== undefined ? data[i] : 0
      ),
      years: [],
    };
  } else if (interval === "monthly") {
    const totalMonths = 12;
    return {
      completeData: Array.from({ length: totalMonths }, (_, i) =>
        data[i] !== undefined ? data[i] : 0
      ),
      years: [],
    };
  } else if (interval === "yearly") {
    const totalYears = 5;
    return {
      completeData: Array.from({ length: totalYears }, (_, i) =>
        data[i] !== undefined ? data[i] : 0
      ),
      years: [],
    };
  }

  return { completeData: data, years: [] };
}

function StatCard({
  title,
  value,
  interval,
  trend,
  data,
  dates,
  previousValue,
}) {
  const theme = useTheme();

  const trendColors = {
    up:
      theme.palette.mode === "light"
        ? theme.palette.success.main
        : theme.palette.success.dark,
    down:
      theme.palette.mode === "light"
        ? theme.palette.error.main
        : theme.palette.error.dark,
    neutral:
      theme.palette.mode === "light"
        ? theme.palette.grey[400]
        : theme.palette.grey[700],
  };

  const labelColors = {
    up: "success",
    down: "error",
    neutral: "default",
  };

  const appliedTrend = previousValue < 0 ? "down" : trend;
  const color = labelColors[appliedTrend];
  const chartColor = trendColors[appliedTrend];

  const { completeData } = getCompleteDataForInterval(data, interval);

  const formattedDates = interval === "yearly"
    ? yearNames
    : dates && dates.length > 0
      ? formatXAxisDates(dates, interval, 'en-GB')
      : ["No Data"];

  const completeDates = Array.from({ length: completeData.length }, (_, i) => {
    const formattedDate = formattedDates[i];
    if (formattedDate !== undefined) return formattedDate;

    if (interval === "yearly") {
      return yearNames[i];
    }

    return interval === "monthly" ? monthNames[i] : "N/A";
  });

  return (
    <Card variant="outlined" sx={{ height: "100%", flexGrow: 1 }}>
      <CardContent>
        <Typography component="h2" variant="subtitle2" gutterBottom>
          {title}
        </Typography>
        <Stack
          direction="column"
          sx={{ justifyContent: "space-between", flexGrow: "1", gap: 1 }}
        >
          <Stack>
            <Stack
              direction="row"
              sx={{ justifyContent: "space-between", alignItems: "center" }}
            >
              <Typography variant="h4" component="p">
                {value}
              </Typography>
              <Chip size="small" color={color} label={`${previousValue}%`} />
            </Stack>
            <Typography variant="caption" sx={{ color: "text.secondary" }}>
              {interval === "yearly"
                ? "Last 5 Years"
                : interval === "monthly"
                  ? "Current Year (Monthly)"
                  : interval === "weekly"
                    ? "Current Year (Weekly)"
                    : "Last 30 Days"}
            </Typography>
          </Stack>
          <Box sx={{ width: "100%", height: 50 }}>
            <SparkLineChart
              colors={[chartColor]}
              data={completeData}
              area
              showHighlight
              showTooltip
              xAxis={{
                scaleType: "band",
                data: completeDates,
              }}
              sx={{
                [`& .${areaElementClasses.root}`]: {
                  fill: `url(#area-gradient-${value})`,
                },
              }}
            >
              <AreaGradient color={chartColor} id={`area-gradient-${value}`} />
            </SparkLineChart>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}

StatCard.propTypes = {
  data: PropTypes.arrayOf(PropTypes.number).isRequired,
  dates: PropTypes.arrayOf(PropTypes.string).isRequired,
  interval: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  trend: PropTypes.oneOf(["down", "neutral", "up"]).isRequired,
  value: PropTypes.string.isRequired,
  previousValue: PropTypes.number.isRequired,
};

export default StatCard;

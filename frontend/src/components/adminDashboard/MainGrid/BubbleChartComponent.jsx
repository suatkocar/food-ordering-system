import React, { useRef, useState, useEffect } from "react";
import { useSelector } from "react-redux";
import {
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  Tooltip,
  CartesianGrid,
  Cell,
} from "recharts";
import Typography from "@mui/material/Typography";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import { format, parseISO } from "date-fns";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";

const COLORS = [
  "#8884d8",
  "#82ca9d",
  "#ffc658",
  "#d84d8b",
  "#00c49f",
  "#ff7300",
  "#0088fe",
  "#a4de6c",
  "#cc99ff",
  "#ff99cc",
  "#99ccff",
];

const CustomTooltip = ({ active, payload, theme }) => {
  if (active && payload && payload.length) {
    const { name, total_sales, discount_percentage, StartDate, EndDate } =
      payload[0].payload;
    return (
      <div
        className="custom-tooltip"
        style={{
          backgroundColor: theme.palette.background.paper,
          color: theme.palette.text.primary,
          border: `1px solid ${theme.palette.divider}`,
          padding: "10px",
        }}
      >
        <p>
          <strong>Product Name:</strong> {name}
        </p>
        <p>
          <strong>Total Sales in the Last 30 Days:</strong> {total_sales}
        </p>
        <p>
          <strong>Discount Percentage:</strong> {discount_percentage}%
        </p>
        <p>
          <strong>Promotion Period:</strong>{" "}
          {format(parseISO(StartDate), "dd MMM yyyy")} -{" "}
          {format(parseISO(EndDate), "dd MMM yyyy")}
        </p>
      </div>
    );
  }
  return null;
};

export default function BubbleChartComponent() {
  const { promotionsData, loading, error } = useSelector(
    (state) => state.insights
  );
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const scrollRef = useRef(null);
  const containerRef = useRef(null);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [maxScroll, setMaxScroll] = useState(0);
  const [showProgress, setShowProgress] = useState(false);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (!scrollRef.current) return;
      const maxScrollLeft =
        scrollRef.current.scrollWidth - scrollRef.current.clientWidth;
      setScrollPosition(scrollRef.current.scrollLeft);
      setMaxScroll(maxScrollLeft);
      if (
        scrollRef.current.scrollLeft > 0 &&
        scrollRef.current.scrollLeft < maxScrollLeft
      ) {
        setShowProgress(true);
        setShowLeftArrow(false);
      } else if (scrollRef.current.scrollLeft >= maxScrollLeft) {
        setShowProgress(false);
        setShowLeftArrow(true);
      } else {
        setShowProgress(false);
        setShowLeftArrow(false);
      }
    };

    const handleVisibility = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      setIsInView(rect.top >= 0 && rect.bottom <= window.innerHeight);
    };

    if (scrollRef.current) {
      scrollRef.current.addEventListener("scroll", handleScroll);
      window.addEventListener("scroll", handleVisibility);
      handleScroll();
      handleVisibility();
    }

    return () => {
      if (scrollRef.current) {
        scrollRef.current.removeEventListener("scroll", handleScroll);
      }
      window.removeEventListener("scroll", handleVisibility);
    };
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  const data = promotionsData.map((item) => ({
    name: item.product_name,
    total_sales: item.total_sales,
    discount_percentage: item.discount_percentage,
    StartDate: item.StartDate
      ? format(parseISO(item.StartDate), "yyyy-MM-dd")
      : "Invalid Date",
    EndDate: item.EndDate
      ? format(parseISO(item.EndDate), "yyyy-MM-dd")
      : "Invalid Date",
  }));

  const chartContent = (
    <ScatterChart
      margin={{ top: 40, right: 50, bottom: 150, left: isMobile ? 1 : 50 }}
    >
      <CartesianGrid />
      <XAxis
        type="category"
        dataKey="name"
        name="Product Name"
        tick={{
          angle: isMobile ? -45 : -45,
          textAnchor: "end",
          fill: theme.palette.text.primary,
          fontSize: isMobile ? 12 : 12,
        }}
        interval={0}
        tickMargin={10}
        height={isMobile ? 1 : 60}
      />
      <YAxis
        type="number"
        dataKey="total_sales"
        name="Total Sales"
        tick={{ fill: theme.palette.text.primary }}
      />
      <ZAxis
        type="number"
        dataKey="discount_percentage"
        range={[50, 500]}
        name="Discount (%)"
      />
      <Tooltip
        content={<CustomTooltip theme={theme} />}
        cursor={{ strokeDasharray: "3 3" }}
      />
      <Scatter name="Products" data={data}>
        {data.map((entry, index) => (
          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
        ))}
      </Scatter>
    </ScatterChart>
  );

  return (
    <Card
      ref={containerRef}
      variant="outlined"
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: "8px",
        flexGrow: 1,
        minHeight: "530px",
        position: "relative",
        overflow: "visible",
        touchAction: isMobile ? "pan-x" : "auto",
      }}
    >
      <CardContent>
        <Typography
          component="h2"
          variant="subtitle2"
          sx={{ marginBottom: "1.5rem" }}
        >
          Active Promotions - Last 30 Days Sales
        </Typography>
        {isMobile ? (
          <div
            style={{
              overflowX: "auto",
              width: "100%",
              overflowY: "hidden",
              WebkitOverflowScrolling: "touch",
              scrollbarWidth: "none",
              msOverflowStyle: "none",
            }}
            ref={scrollRef}
          >
            <div style={{ width: data.length * 100, height: "450px" }}>
              <ResponsiveContainer width="100%" height="100%">
                {chartContent}
              </ResponsiveContainer>
            </div>
            {isInView && (
              <div className="progress-container">
                {!showProgress && !showLeftArrow && (
                  <ArrowForwardIosIcon className="scroll-arrow" />
                )}
                {showProgress && (
                  <div className="progress-bar">
                    <div
                      className="progress"
                      style={{
                        width: `${(scrollPosition / maxScroll) * 100}%`,
                      }}
                    ></div>
                  </div>
                )}
                {showLeftArrow && (
                  <ArrowBackIosIcon className="scroll-arrow-left" />
                )}
              </div>
            )}
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={450}>
            {chartContent}
          </ResponsiveContainer>
        )}
      </CardContent>
      <style jsx>{`
        .progress-container {
          display: flex;
          align-items: center;
          justify-content: center;
          position: absolute;
          bottom: 20px;
          left: 50%;
          transform: translateX(-50%);
          width: 80%;
          pointer-events: none;
        }

        .progress-bar {
          flex-grow: 1;
          height: 5px;
          background-color: ${theme.palette.grey[300]};
          border-radius: 5px;
          margin-right: 10px;
          pointer-events: auto;
        }

        .progress {
          height: 100%;
          background-color: ${theme.palette.primary.main};
          border-radius: 5px;
        }

        .scroll-arrow,
        .scroll-arrow-left {
          animation: bounce 1s infinite;
          pointer-events: auto;
        }

        @keyframes bounce {
          0%,
          100% {
            transform: translateX(0);
          }
          50% {
            transform: translateX(20px);
          }
        }

        .scroll-arrow-left {
          animation: bounce-left 1s infinite;
        }

        @keyframes bounce-left {
          0%,
          100% {
            transform: translateX(0);
          }
          50% {
            transform: translateX(-20px);
          }
        }

        /* Hide scrollbar for Chrome, Safari and Opera */
        div::-webkit-scrollbar {
          display: none;
        }

        /* Hide scrollbar for IE, Edge and Firefox */
        div {
          -ms-overflow-style: none; /* IE and Edge */
          scrollbar-width: none; /* Firefox */
        }
      `}</style>
    </Card>
  );
}

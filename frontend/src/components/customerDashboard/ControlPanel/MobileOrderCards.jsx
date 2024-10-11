import React from "react";
import { Box, Typography, CircularProgress } from "@mui/material";
import { styled } from "@mui/material/styles";

const orderStatusColors = {
  Pending: "#FFA500",
  Processing: "#1E90FF",
  Shipped: "#32CD32",
  Delivered: "#008000",
  Cancelled: "#FF0000",
};

const getContrastColor = (hexColor) => {
  const r = parseInt(hexColor.slice(1, 3), 16);
  const g = parseInt(hexColor.slice(3, 5), 16);
  const b = parseInt(hexColor.slice(5, 7), 16);

  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

  return luminance > 0.5 ? "#000000" : "#FFFFFF";
};

const MobileCard = styled(Box)(({ theme }) => ({
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: theme.shape.borderRadius,
  padding: theme.spacing(3),
  marginBottom: theme.spacing(3),
  position: "relative",
}));

const FieldLabel = styled(Typography)(({ theme }) => ({
  fontWeight: "bold",
  marginBottom: theme.spacing(0.5),
  minWidth: "120px",
}));

const FieldValue = styled(Box)(({ theme }) => ({
  flex: 1,
  display: "flex",
  alignItems: "center",
  paddingLeft: theme.spacing(1.5),
}));

const StyledTypography = styled(Typography)(({ theme, color, fontWeight }) => ({
  fontSize: "1rem",
  color: color || "inherit",
  fontWeight: fontWeight || "normal",
}));

const MobileOrderCards = ({
  rows = [],
  handleImageClick,
  formatCurrency,
  isMobile,
  handleItemSelect,
  selectedItems = [],
  currentTab = "",
  formatTime,
  handleMobileEdit,
  getRowId,
  orderStatusOptions = [],
  loading,
}) => {
  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="100%"
      >
        <CircularProgress />
      </Box>
    );
  }

  const formatTimeWithoutSeconds = (timeString) => {
    if (!timeString) return "";
    const [hours, minutes] = timeString.split(":");
    return `${hours}:${minutes}`;
  };

  if (!Array.isArray(rows) || rows.length === 0) {
    return <Typography>No data available</Typography>;
  }

  return (
    <Box>
      {rows.map((row) => {
        const id = typeof getRowId === "function" ? getRowId(row) : row.id;
        const isSelected =
          Array.isArray(selectedItems) && selectedItems.includes(id);
        return (
          <MobileCard
            key={id}
            onClick={() =>
              typeof handleItemSelect === "function" && handleItemSelect(row)
            }
            sx={{
              backgroundColor: (theme) =>
                isSelected
                  ? theme.palette.mode === "dark"
                    ? theme.palette.grey[800]
                    : theme.palette.grey[200]
                  : "inherit",
              color: (theme) => theme.palette.text.primary,
            }}
          >
            {Object.keys(row).map((field) => {
              if (
                field === "ProductImages" ||
                field === "CustomerID" ||
                field === "ProductIDs"
              )
                return null;

              const isIdField = field.toLowerCase().includes("id");
              const isProfitOrTotal = field === "Profit" || field === "Total";
              const isTimeField = field === "OrderTime";

              if (field === "OrderStatus") {
                const status = row[field];
                const backgroundColor = orderStatusColors[status] || "#808080";
                const color = getContrastColor(backgroundColor);
                return (
                  <Box key={field} mb={2} display="flex" alignItems="center">
                    <FieldLabel>{field}:</FieldLabel>
                    <FieldValue>
                      <Box
                        sx={{
                          width: "100%",
                          display: "flex",
                          justifyContent: "flex-start",
                        }}
                      >
                        <Box
                          component="span"
                          sx={{
                            backgroundColor,
                            color,
                            padding: "6px 16px",
                            borderRadius: "100px",
                            fontWeight: "bold",
                            display: "inline-block",
                            minWidth: "100px",
                            textAlign: "center",
                            marginLeft: "-16px",
                          }}
                        >
                          {status}
                        </Box>
                      </Box>
                    </FieldValue>
                  </Box>
                );
              }

              return (
                <Box key={field} mb={2} display="flex" alignItems="flex-start">
                  <FieldLabel>{field}:</FieldLabel>
                  <FieldValue>
                    <StyledTypography
                      component="div"
                      color={
                        currentTab === "orders" && field === "Total"
                          ? "green"
                          : undefined
                      }
                      fontWeight={
                        isIdField || isProfitOrTotal ? "bold" : "normal"
                      }
                    >
                      {isProfitOrTotal
                        ? typeof formatCurrency === "function"
                          ? formatCurrency(row[field])
                          : row[field]
                        : isTimeField
                          ? formatTimeWithoutSeconds(row[field])
                          : field === "OrderDetails"
                            ? row[field]
                                .split(", ")
                                .map((detail, index) => (
                                  <Box key={index}>{detail}</Box>
                                ))
                            : row[field] !== null && row[field] !== undefined
                              ? row[field]
                              : ""}
                    </StyledTypography>
                  </FieldValue>
                </Box>
              );
            })}

            {currentTab === "orders" && row.ProductImages && (
              <Box display="flex" mt={3} sx={{ overflowX: "auto" }}>
                {row.ProductImages.map((image, index) => (
                  <Box key={index} sx={{ flexShrink: 0, mr: 2 }}>
                    <img
                      src={`${image}?${new Date().getTime()}`}
                      alt="Product"
                      style={{
                        width: "100px",
                        height: "100px",
                        objectFit: "cover",
                        cursor: "pointer",
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        typeof handleImageClick === "function" &&
                          handleImageClick(image);
                      }}
                    />
                  </Box>
                ))}
              </Box>
            )}
          </MobileCard>
        );
      })}
    </Box>
  );
};

export default MobileOrderCards;

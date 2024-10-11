import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchCustomerOrders,
  updateOrderInStore,
} from "../../../redux/slices/orderSlice";
import {
  Box,
  CircularProgress,
  useMediaQuery,
  useTheme,
  Dialog,
  DialogContent,
  Pagination,
} from "@mui/material";
import { useSnackbar } from "notistack";
import MobileOrderCards from "./MobileOrderCards";
import DesktopDataGrid from "./DesktopDataGrid";
import { styled } from "@mui/material/styles";
import { setupWebSocket } from "../../../api/websocket";

const orderStatusColors = {
  "Pending": "#FFA500",
  "Processing": "#1E90FF",
  "Shipped": "#32CD32",
  "Delivered": "#008000",
  "Cancelled": "#FF0000",
};

const getContrastColor = (hexColor) => {
  const r = parseInt(hexColor.slice(1, 3), 16);
  const g = parseInt(hexColor.slice(3, 5), 16);
  const b = parseInt(hexColor.slice(5, 7), 16);
  
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  
  return luminance > 0.5 ? '#000000' : '#FFFFFF';
};


const FullSizeDialogContent = styled(DialogContent)({
  padding: 0,
  height: "100%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  "&:first-of-type": {
    paddingTop: 0,
  },
});

const FullSizeImage = styled("img")({
  width: "100%",
  height: "100%",
  objectFit: "contain",
});

const ImageContainer = styled("div")({
  cursor: "pointer",
});

const CustomizedDataGrid = () => {
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const orders = useSelector((state) => state.orders.items);
  const loadingOrders = useSelector((state) => state.orders.loading);
  const userId = useSelector((state) => state.user.user.id);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [openImageDialog, setOpenImageDialog] = useState(false);
  const [selectedImageUrl, setSelectedImageUrl] = useState("");
  const [page, setPage] = useState(0);
  const pageSize = 20;

  const rows = useMemo(() => {
    return orders.map((order) => ({
      ...order,
      Total: order.Total ? parseFloat(order.Total) : 0,
    }));
  }, [orders]);

  useEffect(() => {
    if (userId) {
      dispatch(fetchCustomerOrders(userId));

      const socket = setupWebSocket((message) => {
        if (
          message.type === "order-update" &&
          message.data.CustomerID === userId
        ) {
          dispatch(updateOrderInStore(message.data));
          const newStatus = message.data.OrderStatus;
          const backgroundColor = orderStatusColors[newStatus] || "#808080";
          const color = getContrastColor(backgroundColor);
          enqueueSnackbar(
            `Order #${message.data.OrderID} Updated: ${newStatus}`,
            {
              variant: "default",
              autoHideDuration: 3000,
              style: {
                backgroundColor,
                color,
              },
            }
          );
        }
      });

      return () => {
        if (socket && socket.readyState === WebSocket.OPEN) {
          socket.close();
        }
      };
    }
  }, [dispatch, userId, enqueueSnackbar]);

  const formatCurrency = (value) => {
    if (typeof value === "number") {
      return `£${value.toFixed(2)}`;
    }
    if (typeof value === "string") {
      const numberValue = parseFloat(value);
      if (!isNaN(numberValue)) {
        return `£${numberValue.toFixed(2)}`;
      }
    }
    return value || "N/A";
  };

  const formatTime = (timeString) => {
    const [hours, minutes] = timeString.split(":");
    return `${hours}:${minutes}`;
  };

  const handleImageClick = (imageUrl) => {
    setSelectedImageUrl(imageUrl);
    setOpenImageDialog(true);
  };

  const handleCloseImageDialog = () => {
    setOpenImageDialog(false);
  };

  const handlePageChange = (event, newPage) => {
    setPage(newPage - 1);
  };

  const columns = useMemo(
    () => [
      {
        field: "ProductImages",
        headerName: "Images",
        flex: 2,
        headerAlign: "center",
        align: "left",
        cellClassName: "super-app-theme--cell",
        renderCell: (params) => (
          <Box
            display="flex"
            flexWrap="wrap"
            gap={1}
            sx={{
              maxWidth: "100%",
              overflow: "auto",
              padding: "10px",
            }}
          >
            {params.value.map((image, index) => (
              <ImageContainer
                key={index}
                onClick={() => handleImageClick(image)}
                sx={{ width: "80px", height: "80px" }}
              >
                <img
                  src={image}
                  alt="Product"
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              </ImageContainer>
            ))}
          </Box>
        ),
      },
      {
        field: "OrderID",
        headerName: "Order Number",
        flex: 1,
        headerAlign: "center",
        align: "center",
        cellClassName: "super-app-theme--cell",
      },
      {
        field: "OrderDate",
        headerName: "Order Date",
        flex: 1,
        headerAlign: "center",
        align: "center",
        cellClassName: "super-app-theme--cell",
      },
      {
        field: "OrderTime",
        headerName: "Order Time",
        flex: 1,
        headerAlign: "center",
        align: "center",
        cellClassName: "super-app-theme--cell",
        renderCell: (params) => {
          const formattedTime = formatTime(params.value);
          return <span>{formattedTime}</span>;
        },
      },
      {
        field: "OrderDetails",
        headerName: "Order Details",
        flex: 1.5,
        headerAlign: "center",
        align: "center",
        cellClassName: "super-app-theme--cell",
        renderCell: (params) => {
          const orderDetails = params.value.split(", ");
          return (
            <Box display="flex" flexDirection="column" alignItems="center">
              {orderDetails.map((detail, index) => (
                <Box key={index}>{detail}</Box>
              ))}
            </Box>
          );
        },
      },
      {
        field: "Total",
        headerName: "Total",
        flex: 1,
        headerAlign: "center",
        align: "center",
        cellClassName: "super-app-theme--cell",
        editable: false,
        renderCell: (params) => {
          const formattedValue = formatCurrency(params.value);
          return <span>{formattedValue}</span>;
        },
      },
      {
        field: "OrderStatus",
        headerName: "Order Status",
        flex: 1,
        headerAlign: "center",
        align: "center",
        cellClassName: "super-app-theme--cell",
        editable: false,
        renderCell: (params) => {
          const status = params.value;
          const backgroundColor = orderStatusColors[status] || "#808080";
          const color = getContrastColor(backgroundColor);//
          return (
            <Box
              sx={{
                backgroundColor,
                color,
                padding: "6px 16px",
                borderRadius: "100px",
                fontWeight: "bold",
                display: "inline-block",
                width: "auto",
                minWidth: "100px",
                textAlign: "center",
              }}
            >
              {status}
            </Box>
          );
        },
      },
    ],
    []
  );

  if (loadingOrders) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="400px"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (isMobile) {
    const paginatedRows = rows.slice(page * pageSize, (page + 1) * pageSize);
    return (
      <Box>
        <MobileOrderCards
          rows={paginatedRows}
          handleImageClick={handleImageClick}
          formatCurrency={formatCurrency}
          isMobile={isMobile}
          handleItemSelect={() => {}}
          selectedItems={[]}
          currentTab="orders"
          formatTime={formatTime}
          handleMobileEdit={() => {}}
          getRowId={(row) => row.OrderID}
          loading={loadingOrders}
        />
        <Pagination
          count={Math.ceil(rows.length / pageSize)}
          page={page + 1}
          onChange={handlePageChange}
          sx={{ mt: 2, display: "flex", justifyContent: "center" }}
        />
        <Dialog
          open={openImageDialog}
          onClose={handleCloseImageDialog}
          maxWidth="md"
          fullWidth
        >
          <FullSizeDialogContent>
            <FullSizeImage src={selectedImageUrl} alt="Product" />
          </FullSizeDialogContent>
        </Dialog>
      </Box>
    );
  }

  return (
    <Box sx={{ width: "100%" }}>
      <DesktopDataGrid
        rows={rows}
        columns={columns}
        getRowId={(row) => row.OrderID}
        loading={loadingOrders}
        onRowSelectionModelChange={(newSelection) => {
      
        }}
        selectedRowIds={[]}
        paginationModel={{ page, pageSize }}
        handlePaginationModelChange={({ page }) => setPage(page)}
        rowCount={rows.length}
        getRowHeight={() => "auto"}
      />
      <Pagination
        count={Math.ceil(rows.length / pageSize)}
        page={page + 1}
        onChange={handlePageChange}
        sx={{ mt: 2, display: "flex", justifyContent: "center" }}
      />
      <Dialog
        open={openImageDialog}
        onClose={handleCloseImageDialog}
        maxWidth="md"
        fullWidth
      >
        <FullSizeDialogContent>
          <FullSizeImage src={selectedImageUrl} alt="Product" />
        </FullSizeDialogContent>
      </Dialog>
    </Box>
  );
};

export default CustomizedDataGrid;

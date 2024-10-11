import React, { useEffect, useMemo, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  fetchCustomers,
  updateCustomer,
  deleteCustomer,
  createCustomer,
} from "../../../redux/slices/customerSlice";
import {
  fetchAllProducts,
  updateProduct,
  deleteProduct,
  createProduct,
} from "../../../redux/slices/productsSlice";
import {
  fetchOrders,
  createOrder,
  updateOrder,
  deleteOrder,
  addOrderFromWebSocket,
  clearNewOrderFlag,
} from "../../../redux/slices/orderSlice";
import {
  Tabs,
  Tab,
  Box,
  CircularProgress,
  Snackbar,
  Select,
  MenuItem,
  Button,
} from "@mui/material";
import { useTheme, styled } from "@mui/material/styles";
import Pagination from "@mui/material/Pagination";
import FixedToolbar from "./FixedToolbar";
import DesktopDataGrid from "./DesktopDataGrid";
import MobileOrderCards from "./MobileOrderCards";
import ImageModal from "./ImageModal";
import AddNewProductDialog from "./AddNewProductDialog";
import AddNewOrderDialog from "./AddNewOrderDialog";
import AddNewCustomerDialog from "./AddNewCustomerDialog";
import EditCustomerDialog from "./EditCustomerDialog";
import EditOrderDialog from "./EditOrderDialog";
import CustomAlert from "../../global/CustomAlert";
import { useSnackbar } from "notistack";
import axiosInstance from "../../../api/axiosInstance";
import { useMediaQuery } from "@mui/material";
import debounce from "lodash.debounce";
import { setupWebSocket } from "../../../api/websocket";

const StyledSelect = styled(Select)(({ theme }) => ({
  height: "100%",
  width: "100%",
  "&.MuiOutlinedInput-root": {
    "& fieldset": {
      border: "none",
    },
    "&:hover fieldset": {
      border: "none",
    },
    "&.Mui-focused fieldset": {
      border: "none",
    },
  },
  "&.MuiInputBase-root": {
    "&.Mui-focused": {
      backgroundColor: "transparent",
    },
  },
  "& .MuiSelect-select": {
    height: "100%",
    display: "flex",
    alignItems: "center",
    paddingLeft: theme.spacing(1),
    paddingRight: theme.spacing(1),
  },
}));

const CustomizedDataGrid = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));


  const { token } = useSelector((state) => state.user);
  const customers = useSelector((state) => state.customers.items);
  const products = useSelector((state) => state.products.items);
  const orders = useSelector((state) => state.orders.items);
  const ordersStatus = useSelector((state) => state.orders.status);
  const totalCustomers = useSelector((state) => state.customers.total);
  const totalProducts = useSelector((state) => state.products.total);
  const totalOrders = useSelector((state) => state.orders.total);
  const loadingCustomers = useSelector(
    (state) => state.customers.status === "loading"
  );
  const loadingProducts = useSelector(
    (state) => state.products.status === "loading"
  );
  const loadingOrders = useSelector(
    (state) => state.orders.status === "loading"
  );


  const [currentTab, setCurrentTab] = useState("products");
  const [selectedRowIds, setSelectedRowIds] = useState([]);
  const [paginationModel, setPaginationModel] = useState({
    page: 1,
    pageSize: 20,
  });
  const [openImageModal, setOpenImageModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("info");
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();

  const isLoading = useMemo(() => {
    switch (currentTab) {
      case "products":
        return loadingProducts || loading;
      case "orders":
        return loadingOrders || loading;
      case "customers":
        return loadingCustomers || loading;
      default:
        return loading;
    }
  }, [currentTab, loadingProducts, loadingOrders, loadingCustomers, loading]);


  const [newProductDialogOpen, setNewProductDialogOpen] = useState(false);
  const [newOrderDialogOpen, setNewOrderDialogOpen] = useState(false);
  const [newCustomerDialogOpen, setNewCustomerDialogOpen] = useState(false);
  const [newProduct, setNewProduct] = useState({
    Name: "",
    Category: "",
    Cost: "",
    Price: "",
    DynamicPrice: "",
    Ranking: "",
    StockLevel: "",
  });
  const [newOrder, setNewOrder] = useState({
    CustomerID: "",
    ProductID: "",
    Quantity: "",
  });
  const [newCustomer, setNewCustomer] = useState({
    Name: "",
    Email: "",
    Address: "",
    Phone: "",
  });


  const [editCustomerDialogOpen, setEditCustomerDialogOpen] = useState(false);
  const [editOrderDialogOpen, setEditOrderDialogOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const categoryOptions = [
    "Main Course",
    "Side Dish",
    "Appetizer",
    "Dessert",
    "Beverage",
  ];

  const orderStatusOptions = [
    "Pending",
    "Processing",
    "Shipped",
    "Delivered",
    "Cancelled",
  ];

  const totalRows = useMemo(() => {
    switch (currentTab) {
      case "products":
        return totalProducts;
      case "orders":
        return totalOrders;
      case "customers":
        return totalCustomers;
      default:
        return 0;
    }
  }, [currentTab, totalProducts, totalOrders, totalCustomers]);


  const rows = useMemo(() => {
    switch (currentTab) {
      case "products":
        return products || [];
      case "orders":
        return orders || [];
      case "customers":
        return customers || [];
      default:
        return [];
    }
  }, [currentTab, products, orders, customers]);


  const fetchData = useCallback(() => {
    setLoading(true);
    let action;
    switch (currentTab) {
      case "products":
        action = fetchAllProducts;
        break;
      case "orders":
        action = fetchOrders;
        break;
      case "customers":
        action = fetchCustomers;
        break;
      default:
        console.error("Invalid tab");
        setLoading(false);
        return;
    }

    dispatch(
      action({
        page: paginationModel.page,
        pageSize: paginationModel.pageSize,
        search: searchText,
      })
    )
      .unwrap()
      .then(() => {
        setTimeout(() => setLoading(false), 500);
      })
      .catch((error) => {
        console.error(`Error fetching ${currentTab}:`, error);
        setTimeout(() => setLoading(false), 500);
        if (error.status === 401 || error.status === 403) {
          setSnackbarMessage("Your session has expired. Please log in again.");
          setSnackbarSeverity("warning");
          setSnackbarOpen(true);
          setTimeout(() => {
            navigate("/signin");
          }, 3000);
        } else {
          setSnackbarMessage(`Error fetching ${currentTab}: ${error.message}`);
          setSnackbarSeverity("error");
          setSnackbarOpen(true);
        }
      });
  }, [
    currentTab,
    dispatch,
    paginationModel.page,
    paginationModel.pageSize,
    searchText,
    navigate,
    setSnackbarMessage,
    setSnackbarSeverity,
    setSnackbarOpen,
  ]);


  const debouncedFetchData = useMemo(
    () => debounce(fetchData, 300),
    [fetchData]
  );


  useEffect(() => {
    if (token) {
      axiosInstance.defaults.headers.common["Authorization"] =
        `Bearer ${token}`;
    } else {
      delete axiosInstance.defaults.headers.common["Authorization"];
    }
  }, [token]);

  useEffect(() => {
    if (currentTab === "orders") {
      dispatch(
        fetchOrders({
          page: paginationModel.page,
          pageSize: paginationModel.pageSize,
          search: searchText,
        })
      );
    } else {
      fetchData();
    }
  }, [
    currentTab,
    paginationModel.page,
    paginationModel.pageSize,
    searchText,
    dispatch,
  ]);

  useEffect(() => {
    const socket = setupWebSocket((message) => {
      console.log("WebSocket message received:", message);
      switch (message.type) {
        case "new-order":
          dispatch(addOrderFromWebSocket(message.data));
          enqueueSnackbar("New Order Received!", {
            variant: "info",
          });
          break;
        default:
          console.log("Unhandled WebSocket message type:", message.type);
      }
    });

    return () => {
      if (socket && socket.readyState === WebSocket.OPEN) {
        socket.close();
      }
    };
  }, [dispatch, enqueueSnackbar]);

  useEffect(() => {
    if (orders.length > 0 && orders[0].isNew) {
      dispatch(clearNewOrderFlag(orders[0].OrderID));
    }
  }, [orders, dispatch]);

  useEffect(() => {
    console.log("Orders data updated:", orders);
  }, [orders]);


  useEffect(() => {
    debouncedFetchData();
  }, [searchText, debouncedFetchData]);


  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
    setSelectedRowIds([]);
    setPaginationModel({
      page: 1,
      pageSize: 20,
    });
  };


  const handleRowSelection = (newSelection) => {
    setSelectedRowIds(newSelection);
  };


  const handleImageClick = (imageUrl) => {
    setSelectedImage(imageUrl);
    setOpenImageModal(true);
  };


  const handleCloseImageModal = () => {
    setOpenImageModal(false);
    setSelectedImage(null);
  };

 
  const handleDelete = () => {
    if (selectedRowIds.length === 0) return;

    let action;
    let itemName;
    switch (currentTab) {
      case "products":
        action = deleteProduct;
        itemName = "Product";
        break;
      case "orders":
        action = deleteOrder;
        itemName = "Order";
        break;
      case "customers":
        action = deleteCustomer;
        itemName = "Customer";
        break;
      default:
        console.error("Invalid tab for deletion");
        return;
    }

    Promise.all(selectedRowIds.map((id) => dispatch(action(id)).unwrap()))
      .then(() => {
        setSnackbarMessage(`Selected ${itemName}s deleted successfully`);
        setSnackbarSeverity("success");
        setSnackbarOpen(true);
        setSelectedRowIds([]);
        fetchData();
      })
      .catch((error) => {
        console.error(`Error deleting ${itemName}s:`, error);
        setSnackbarMessage(`Error deleting ${itemName}s: ${error.message}`);
        setSnackbarSeverity("error");
        setSnackbarOpen(true);
      });
  };

 
  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

 
  const handleAddNewProduct = () => {
    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("Name", newProduct.Name);
    formData.append("Category", newProduct.Category);
    formData.append("Cost", newProduct.Cost);
    formData.append("Price", newProduct.Price);
    formData.append("DynamicPrice", newProduct.DynamicPrice);
    formData.append("Ranking", newProduct.Ranking);
    formData.append("StockLevel", newProduct.StockLevel);

    dispatch(createProduct(formData))
      .unwrap()
      .then(() => {
        setSnackbarMessage("Product created successfully");
        setSnackbarSeverity("success");
        setSnackbarOpen(true);
        setNewProductDialogOpen(false);
        setNewProduct({
          Name: "",
          Category: "",
          Cost: "",
          Price: "",
          DynamicPrice: "",
          Ranking: "",
          StockLevel: "",
        });
        setSelectedFile(null);
        setImagePreview(null);
        fetchData();
      })
      .catch((error) => {
        setSnackbarMessage(`Error creating product: ${error.message}`);
        setSnackbarSeverity("error");
        setSnackbarOpen(true);
      });
  };


  const handleAddNewOrder = () => {
    const orderData = {
      CustomerID: newOrder.CustomerID,
      ProductID: newOrder.ProductID,
      Quantity: parseInt(newOrder.Quantity, 10),
      OrderDate: new Date().toISOString(),
    };

    const handleOrderChange = (e) => {
      const { name, value } = e.target;
      setSelectedOrder((prevOrder) => ({
        ...prevOrder,
        [name]: value,
      }));
    };

    dispatch(createOrder(orderData))
      .unwrap()
      .then(() => {
        setSnackbarMessage("Order created successfully");
        setSnackbarSeverity("success");
        setSnackbarOpen(true);
        setNewOrderDialogOpen(false);
        setNewOrder({
          CustomerID: "",
          ProductID: "",
          Quantity: "",
        });
        fetchData();
      })
      .catch((error) => {
        setSnackbarMessage(`Error creating order: ${error.message}`);
        setSnackbarSeverity("error");
        setSnackbarOpen(true);
      });
  };

 
  const handleAddNewCustomer = () => {
    const customerData = {
      Name: newCustomer.Name,
      Email: newCustomer.Email,
      Address: newCustomer.Address,
      Phone: newCustomer.Phone,
    };

    dispatch(createCustomer(customerData))
      .unwrap()
      .then(() => {
        setSnackbarMessage("Customer created successfully");
        setSnackbarSeverity("success");
        setSnackbarOpen(true);
        setNewCustomerDialogOpen(false);
        setNewCustomer({
          Name: "",
          Email: "",
          Address: "",
          Phone: "",
        });
        fetchData();
      })
      .catch((error) => {
        setSnackbarMessage(`Error creating customer: ${error.message}`);
        setSnackbarSeverity("error");
        setSnackbarOpen(true);
      });
  };


  const handleSaveCustomer = () => {
    if (!selectedCustomer) return;

    dispatch(updateCustomer(selectedCustomer))
      .unwrap()
      .then(() => {
        setSnackbarMessage("Customer updated successfully");
        setSnackbarSeverity("success");
        setSnackbarOpen(true);
        setEditCustomerDialogOpen(false);
        setSelectedCustomer(null);
        fetchData();
      })
      .catch((error) => {
        setSnackbarMessage(`Error updating customer: ${error.message}`);
        setSnackbarSeverity("error");
        setSnackbarOpen(true);
      });
  };

 
  const handleSaveOrder = () => {
    if (!selectedOrder) return;

    dispatch(updateOrder(selectedOrder))
      .unwrap()
      .then(() => {
        setSnackbarMessage("Order updated successfully");
        setSnackbarSeverity("success");
        setSnackbarOpen(true);
        setEditOrderDialogOpen(false);
        setSelectedOrder(null);
        fetchData();
      })
      .catch((error) => {
        setSnackbarMessage(`Error updating order: ${error.message}`);
        setSnackbarSeverity("error");
        setSnackbarOpen(true);
      });
  };


  const getRowId = (row) => {
    if (currentTab === "products") return row.ProductID;
    if (currentTab === "orders") return row.OrderID || row.orderId;
    if (currentTab === "customers") return row.CustomerID;
    return row.id;
  };

  const totalPages = useMemo(() => {
    switch (currentTab) {
      case "products":
        return Math.ceil(totalProducts / paginationModel.pageSize);
      case "orders":
        return Math.ceil(totalOrders / paginationModel.pageSize);
      case "customers":
        return Math.ceil(totalCustomers / paginationModel.pageSize);
      default:
        return 0;
    }
  }, [
    currentTab,
    totalProducts,
    totalOrders,
    totalCustomers,
    paginationModel.pageSize,
  ]);


  const formatCurrencyMemo = useMemo(() => {
    return (value) => {
      if (typeof value === "number") {
        return `£${value.toFixed(2)}`;
      }
      if (typeof value === "string") {
        const numberValue = parseFloat(value.replace(/[^0-9.-]+/g, ""));
        if (!isNaN(numberValue)) {
          return `£${numberValue.toFixed(2)}`;
        }
      }
      return "N/A";
    };
  }, []);

  const formatTime = useCallback((timeString) => {
    if (!timeString) return "";
    const [hours, minutes] = timeString.split(":");
    return `${hours.padStart(2, "0")}:${minutes.padStart(2, "0")}`;
  }, []);


  const columns = useMemo(() => {
    if (currentTab === "products") {
      return [
        {
          field: "imagePath",
          headerName: "Images",
          headerAlign: "center",
          align: "center",
          width: 140,
          renderCell: (params) => {
            const images = Array.isArray(params.value)
              ? params.value
              : params.value
                ? [params.value]
                : [];

            return (
              <Box
                display="flex"
                flexWrap="wrap"
                justifyContent="center"
                alignItems="center"
                sx={{
                  width: "100%",
                  height: "100%",
                  padding: 0,
                  margin: 0,
                }}
              >
                {images.length > 0 ? (
                  images.map((image, index) => (
                    <Box
                      key={index}
                      onClick={() =>
                        handleImageClick(`${image}?${new Date().getTime()}`)
                      }
                      sx={{
                        width: "100%",
                        height: "100%",
                        overflow: "hidden",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "pointer",
                      }}
                    >
                      <img
                        src={`${image}?${new Date().getTime()}`}
                        alt="Product"
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
                    </Box>
                  ))
                ) : (
                  <Typography variant="caption">No Image</Typography>
                )}
              </Box>
            );
          },
        },
        {
          field: "ProductID",
          headerName: "Product ID",
          width: 120,
          headerAlign: "center",
          align: "center",
          editable: false,
        },
        {
          field: "Name",
          headerName: "Name",
          width: 200,
          headerAlign: "center",
          align: "center",
          editable: true,
        },
        {
          field: "Category",
          headerName: "Category",
          width: 150,
          headerAlign: "center",
          align: "center",
          editable: true,
        },
        {
          field: "Cost",
          headerName: "Cost",
          width: 120,
          headerAlign: "center",
          align: "center",
          editable: true,
        },
        {
          field: "Price",
          headerName: "Price",
          width: 120,
          headerAlign: "center",
          align: "center",
          editable: true,
        },
        {
          field: "DynamicPrice",
          headerName: "Dynamic Price",
          width: 150,
          headerAlign: "center",
          align: "center",
          editable: true,
        },
        {
          field: "Profit",
          headerName: "Profit",
          width: 120,
          headerAlign: "center",
          align: "center",
          editable: false,
        },
        {
          field: "Ranking",
          headerName: "Ranking",
          width: 144,
          headerAlign: "center",
          align: "center",
          editable: true,
        },
        {
          field: "StockLevel",
          headerName: "Stock Level",
          width: 150,
          headerAlign: "center",
          align: "center",
          editable: true,
        },
        {
          field: "LastUpdated",
          headerName: "Last Updated",
          width: 200,
          headerAlign: "center",
          align: "center",
          editable: false,
        },
      ];
    } else if (currentTab === "orders") {
      return [
        {
          field: "ProductImages",
          headerName: "Images",
          flex: 3,
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
              {params.value &&
                params.value.map((image, index) => (
                  <Box
                    key={index}
                    onClick={() => handleImageClick(image)}
                    sx={{ width: "80px", height: "80px", cursor: "pointer" }}
                  >
                    <img
                      src={image}
                      alt="Product"
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                  </Box>
                ))}
            </Box>
          ),
        },
        {
          field: "OrderID",
          headerName: "Order ID",
          display: "flex",
          width: 60,
          headerAlign: "center",
          align: "center",
          editable: false,
        },
        {
          field: "CustomerID",
          headerName: "Customer ID",
          display: "flex",
          width: 140,
          headerAlign: "center",
          align: "center",
          editable: true,
        },
        {
          field: "CustomerName",
          headerName: "Customer Name",
          display: "flex",
          width: 120,
          headerAlign: "center",
          align: "center",
          editable: true,
        },
        {
          field: "OrderDate",
          headerName: "Order Date",
          display: "flex",
          width: 140,
          headerAlign: "center",
          align: "center",
          editable: false,
        },
        {
          field: "OrderTime",
          headerName: "Order Time",
          display: "flex",
          width: 80,
          headerAlign: "center",
          align: "center",
          editable: false,
          renderCell: (params) => {
            const formattedTime = formatTime(params.value);
            return <span>{formattedTime}</span>;
          },
        },
        {
          field: "Total",
          headerName: "Total",
          display: "flex",
          width: 120,
          headerAlign: "center",
          align: "center",
          editable: false,
          type: "number",
          renderCell: (params) => formatCurrencyMemo(params.value),
        },
        {
          field: "OrderDetails",
          headerName: "Order Details",
          display: "flex",
          flex: 1.5,
          headerAlign: "center",
          align: "center",
          editable: false,
          renderCell: (params) => {
            const orderDetails = params.value ? params.value.split(", ") : [];
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
          field: "OrderStatus",
          headerName: "Order Status",
          display: "flex",
          width: 160,
          headerAlign: "center",
          align: "center",
          editable: true,
          renderCell: (params) => (
            <OrderStatusSelect
              value={params.value}
              onChange={(e) => {
                const updatedRow = {
                  ...params.row,
                  OrderStatus: e.target.value,
                };
                processRowUpdate(updatedRow, params.row);
              }}
              onClick={(e) => e.stopPropagation()}
              orderStatusOptions={orderStatusOptions}
            />
          ),
        },
      ];
    } else if (currentTab === "customers") {
      return [
        {
          field: "CustomerID",
          headerName: "Customer ID",
          width: 200,
          headerAlign: "center",
          align: "center",
          editable: false,
        },
        {
          field: "Name",
          headerName: "Name",
          width: 320,
          headerAlign: "center",
          align: "center",
          editable: true,
        },
        {
          field: "Email",
          headerName: "Email",
          width: 320,
          headerAlign: "center",
          align: "center",
          editable: true,
        },
        {
          field: "Phone",
          headerName: "Phone",
          width: 320,
          headerAlign: "center",
          align: "center",
          editable: true,
        },
        {
          field: "Address",
          headerName: "Address",
          width: 454,
          headerAlign: "center",
          align: "left",
          editable: true,
        },
      ];
    }
    return [];
  }, [currentTab, formatCurrencyMemo, formatTime]);

  const processRowUpdate = useCallback(
    (newRow, oldRow) => {
      if (currentTab === "products") {
        const updatedRow = { ...oldRow, ...newRow };
        const parseCurrency = (value) => {
          if (typeof value === "string") {
            return parseFloat(value.replace(/[^0-9.-]+/g, ""));
          }
          return value;
        };
        updatedRow.Price = parseCurrency(updatedRow.Price);
        updatedRow.DynamicPrice = parseCurrency(updatedRow.DynamicPrice);
        updatedRow.Cost = parseCurrency(updatedRow.Cost);
        updatedRow.Profit =
          updatedRow.DynamicPrice !== undefined && updatedRow.Cost !== undefined
            ? (updatedRow.DynamicPrice - updatedRow.Cost).toFixed(2)
            : "N/A";

        const { ProductID, imagePath, ...dataToUpdate } = updatedRow;

        return new Promise((resolve, reject) => {
          dispatch(updateProduct({ ...dataToUpdate, ProductID }))
            .unwrap()
            .then((updatedProduct) => {
              setSnackbarMessage("Product updated successfully");
              setSnackbarSeverity("success");
              setSnackbarOpen(true);
              resolve(updatedProduct);
            })
            .catch((error) => {
              setSnackbarMessage(`Error updating product: ${error.message}`);
              setSnackbarSeverity("error");
              setSnackbarOpen(true);
              reject(error);
            })
            .finally(() => {
              fetchData();
            });
        });
      } else if (currentTab === "orders") {
        const updatedRow = { ...oldRow, ...newRow };

        const formatDate = (dateString) => {
          const date = new Date(dateString);
          if (isNaN(date.getTime())) {
            return dateString;
          }
          return date.toISOString().split("T")[0];
        };

        const formatTimeFunc = (timeString) => {
          if (!timeString) return "";
          const [hours, minutes] = timeString.split(":");
          return `${hours.padStart(2, "0")}:${minutes.padStart(2, "0")}`;
        };

        const orderToUpdate = {
          OrderID: updatedRow.OrderID,
        };

        if (newRow.CustomerID !== oldRow.CustomerID) {
          orderToUpdate.CustomerID = newRow.CustomerID;
        }

        if (
          newRow.OrderDate !== oldRow.OrderDate ||
          newRow.OrderTime !== oldRow.OrderTime
        ) {
          const date = formatDate(newRow.OrderDate || oldRow.OrderDate);
          const time = formatTimeFunc(newRow.OrderTime || oldRow.OrderTime);
          orderToUpdate.OrderDate = `${date} ${time}`;
        }

        if (newRow.OrderStatus !== oldRow.OrderStatus) {
          orderToUpdate.OrderStatus = newRow.OrderStatus;
        }

        return new Promise((resolve, reject) => {
          dispatch(updateOrder(orderToUpdate))
            .unwrap()
            .then((updatedOrder) => {
              if (!updatedOrder) {
                throw new Error("Failed to update order");
              }
              setSnackbarMessage("Order updated successfully");
              setSnackbarSeverity("success");
              setSnackbarOpen(true);
              resolve(updatedOrder);
            })
            .catch((error) => {
              console.error("Error updating order:", error);
              setSnackbarMessage(`Error updating order: ${error.message}`);
              setSnackbarSeverity("error");
              setSnackbarOpen(true);
              reject(error);
            })
            .finally(() => {
              fetchData();
            });
        });
      } else if (currentTab === "customers") {
        const updatedRow = { ...oldRow, ...newRow };
        const { CustomerID, Password, ...dataToUpdate } = updatedRow;

        const filteredData = Object.entries(dataToUpdate).reduce(
          (acc, [key, value]) => {
            if (value !== undefined) {
              acc[key] = value;
            }
            return acc;
          },
          {}
        );

        return new Promise((resolve, reject) => {
          dispatch(updateCustomer({ ...filteredData, id: CustomerID }))
            .unwrap()
            .then((updatedCustomer) => {
              setSnackbarMessage("Customer updated successfully");
              setSnackbarSeverity("success");
              setSnackbarOpen(true);
              resolve(updatedCustomer);
            })
            .catch((error) => {
              setSnackbarMessage(`Error updating customer: ${error.message}`);
              setSnackbarSeverity("error");
              setSnackbarOpen(true);
              reject(error);
            })
            .finally(() => {
              fetchData();
            });
        });
      }
      return Promise.resolve(oldRow);
    },
    [
      currentTab,
      dispatch,
      fetchData,
      setSnackbarMessage,
      setSnackbarSeverity,
      setSnackbarOpen,
      products,
    ]
  );

  const handleProcessRowUpdateError = useCallback((error) => {
    console.error("Error during row update:", error);
    setSnackbarMessage(`Error updating row: ${error.message}`);
    setSnackbarSeverity("error");
    setSnackbarOpen(true);
  }, []);

 
  const handleAddNew = () => {
    if (currentTab === "products") {
      setNewProductDialogOpen(true);
    } else if (currentTab === "orders") {
      setNewOrderDialogOpen(true);
    } else if (currentTab === "customers") {
      setNewCustomerDialogOpen(true);
    }
  };


  const handleItemSelect = (row) => {
    const id = getRowId(row);
    setSelectedRowIds((prevSelected) =>
      prevSelected.includes(id)
        ? prevSelected.filter((item) => item !== id)
        : [...prevSelected, id]
    );
  };


  const handleEdit = (row) => {
    if (currentTab === "customers") {
      setSelectedCustomer(row);
      setEditCustomerDialogOpen(true);
    } else if (currentTab === "orders") {
      setSelectedOrder(row);
      setEditOrderDialogOpen(true);
    } else {
      console.warn("Edit functionality not implemented for this tab");
    }
  };


  const handleMobileEdit = useCallback(
    (row, field, value) => {
      const updatedRow = { ...row, [field]: value };
      processRowUpdate(updatedRow, row)
        .then(() => {
          setSnackbarMessage(`${field} updated successfully`);
          setSnackbarSeverity("success");
          setSnackbarOpen(true);
          fetchData();
        })
        .catch((error) => {
          setSnackbarMessage(`Error updating ${field}: ${error.message}`);
          setSnackbarSeverity("error");
          setSnackbarOpen(true);
        });
    },
    [
      processRowUpdate,
      setSnackbarMessage,
      setSnackbarSeverity,
      setSnackbarOpen,
      fetchData,
    ]
  );

 
  const getRowHeight = () => {
    if (currentTab === "orders") return 140;
    if (currentTab === "products") return 140;
    return 52;
  };

  const OrderStatusSelect = ({ value, onChange, orderStatusOptions }) => (
    <StyledSelect value={value || ""} onChange={onChange} fullWidth>
      {orderStatusOptions.map((option) => (
        <MenuItem key={option} value={option}>
          {option}
        </MenuItem>
      ))}
    </StyledSelect>
  );

 
  const handleSearchChange = (event) => {
    setSearchText(event.target.value);
  };

  return (
    <Box
      sx={{
        width: "100%",
        height: "calc(100vh - 200px)",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Tabs and FixedToolbar */}
      <Box>
        <Tabs value={currentTab} onChange={handleTabChange} centered>
          <Tab label="Products" value="products" />
          <Tab label="Orders" value="orders" />
          <Tab label="Customers" value="customers" />
        </Tabs>
        <FixedToolbar
          onAddNew={handleAddNew}
          onDelete={handleDelete}
          disableDelete={selectedRowIds.length === 0}
          isMobile={isMobile}
          searchText={searchText}
          handleSearchChange={handleSearchChange}
        />
      </Box>

      {/* Main Content Area */}
      <Box sx={{ flexGrow: 1, overflow: "auto", padding: 2 }}>
        {isLoading ? (
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            height="100%"
          >
            <CircularProgress />
          </Box>
        ) : (
          <>
            {isMobile ? (
              <>
                {/* Pagination for Mobile */}
                <Box display="flex" justifyContent="center" mb={2}>
                  <Pagination
                    count={totalPages}
                    page={paginationModel.page}
                    onChange={(event, value) =>
                      setPaginationModel((prev) => ({ ...prev, page: value }))
                    }
                    color="primary"
                    size={isMobile ? "small" : "medium"}
                    showFirstButton
                    showLastButton
                  />
                </Box>
                <MobileOrderCards
                  rows={rows || []}
                  handleImageClick={handleImageClick}
                  formatCurrency={formatCurrencyMemo}
                  isMobile={isMobile}
                  handleItemSelect={handleItemSelect}
                  selectedItems={selectedRowIds}
                  handleEdit={handleEdit}
                  currentTab={currentTab}
                  formatTime={formatTime}
                  handleMobileEdit={handleMobileEdit}
                  getRowId={getRowId}
                  orderStatusOptions={orderStatusOptions}
                  loading={loading}
                />
                {/* Pagination for Mobile */}
                <Box display="flex" justifyContent="center" mt={2}>
                  <Pagination
                    count={totalPages}
                    page={paginationModel.page}
                    onChange={(event, value) =>
                      setPaginationModel((prev) => ({ ...prev, page: value }))
                    }
                    color="primary"
                    size={isMobile ? "small" : "medium"}
                    showFirstButton
                    showLastButton
                  />
                </Box>
              </>
            ) : (
              <DesktopDataGrid
                height={`calc(100vh - 200px)`}
                rows={rows}
                columns={columns}
                getRowId={getRowId}
                loading={loading}
                processRowUpdate={processRowUpdate}
                handleProcessRowUpdateError={handleProcessRowUpdateError}
                onRowSelectionModelChange={handleRowSelection}
                selectedRowIds={selectedRowIds}
                paginationModel={paginationModel}
                handlePaginationModelChange={(model) =>
                  setPaginationModel(model)
                }
                rowCount={totalRows}
                getRowHeight={getRowHeight}
                rowHeight={
                  typeof getRowHeight === "function"
                    ? getRowHeight()
                    : undefined
                }
                orderStatusOptions={orderStatusOptions}
              />
            )}
          </>
        )}
      </Box>

      {/* Image Modal */}
      <ImageModal
        open={openImageModal}
        handleClose={handleCloseImageModal}
        selectedImage={selectedImage}
        handleFileChange={handleFileSelect}
      />

      {/* Add New Product Dialog */}
      <AddNewProductDialog
        open={newProductDialogOpen}
        handleClose={() => setNewProductDialogOpen(false)}
        newProduct={newProduct}
        handleNewProductChange={(e) =>
          setNewProduct({ ...newProduct, [e.target.name]: e.target.value })
        }
        handleCategoryChange={(e) =>
          setNewProduct({ ...newProduct, Category: e.target.value })
        }
        handleFileSelect={handleFileSelect}
        imagePreview={imagePreview}
        handleAddNewProduct={handleAddNewProduct}
        categoryOptions={categoryOptions}
      />

      {/* Add New Order Dialog */}
      <AddNewOrderDialog
        open={newOrderDialogOpen}
        handleClose={() => setNewOrderDialogOpen(false)}
        newOrder={newOrder}
        handleNewOrderChange={(e) =>
          setNewOrder({ ...newOrder, [e.target.name]: e.target.value })
        }
        handleAddNewOrder={handleAddNewOrder}
      />

      {/* Edit Order Dialog */}
      <EditOrderDialog
        open={editOrderDialogOpen}
        handleClose={() => setEditOrderDialogOpen(false)}
        orderData={selectedOrder}
        handleOrderChange={(e) =>
          setSelectedOrder({
            ...selectedOrder,
            [e.target.name]: e.target.value,
          })
        }
        handleSaveOrder={handleSaveOrder}
      />

      {/* Add New Customer Dialog */}
      <AddNewCustomerDialog
        open={newCustomerDialogOpen}
        handleClose={() => setNewCustomerDialogOpen(false)}
        newCustomer={newCustomer}
        handleNewCustomerChange={(e) =>
          setNewCustomer({ ...newCustomer, [e.target.name]: e.target.value })
        }
        handleAddNewCustomer={handleAddNewCustomer}
      />

      {/* Edit Customer Dialog */}
      <EditCustomerDialog
        open={editCustomerDialogOpen}
        handleClose={() => setEditCustomerDialogOpen(false)}
        customerData={selectedCustomer}
        handleCustomerChange={(e) =>
          setSelectedCustomer({
            ...selectedCustomer,
            [e.target.name]: e.target.value,
          })
        }
        handleSaveCustomer={handleSaveCustomer}
      />

      {/* Snackbar for Notifications */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <CustomAlert
          onClose={() => setSnackbarOpen(false)}
          severity={snackbarSeverity}
          variantType="severity"
        >
          {snackbarMessage}
        </CustomAlert>
      </Snackbar>
    </Box>
  );
};

export default CustomizedDataGrid;

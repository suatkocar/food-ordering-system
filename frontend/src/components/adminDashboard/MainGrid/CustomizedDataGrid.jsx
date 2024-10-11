import React from "react";
import { DataGrid } from "@mui/x-data-grid";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchCustomers,
  updateCustomer,
} from "../../../redux/slices/customerSlice";
import {
  fetchAllProducts,
  updateProduct,
  uploadProductImage,
  deleteProduct,
  createProduct,
} from "../../../redux/slices/productsSlice";
import { fetchOrders } from "../../../redux/slices/orderSlice";
import {
  Tabs,
  Tab,
  Box,
  Dialog,
  DialogContent,
  IconButton,
  Button,
  TextField,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  Typography,
  CircularProgress,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import UploadIcon from "@mui/icons-material/Upload";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";

const OverlayIconButton = styled(IconButton)(({ theme }) => ({
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  backgroundColor:
    theme.palette.mode === "dark"
      ? "rgba(0, 0, 0, 0.7)"
      : "rgba(255, 255, 255, 0.7)",
  transition: "opacity 0.3s ease-in-out",
  opacity: 0,
  "&:hover": {
    backgroundColor:
      theme.palette.mode === "dark"
        ? "rgba(0, 0, 0, 1)"
        : "rgba(255, 255, 255, 1)",
  },
}));

const commonTextFieldSx = {
  "& label": {
    transform: "translate(10px, 10px)",
  },
  "& label.MuiInputLabel-shrink": {
    transform: "translate(0, -26px)",
  },
};

const UploadArea = styled(Box)(({ theme }) => ({
  border: `2px dashed ${theme.palette.grey[500]}`,
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  cursor: "pointer",
  borderRadius: theme.shape.borderRadius,
  height: 240,
  width: 240,
  margin: "0 auto",
  overflow: "hidden",
}));

const ImageContainer = styled("div")({
  position: "relative",
  width: "120px",
  height: "120px",
  cursor: "pointer",
  overflow: "hidden",
});

const ModalImageContainer = styled("div")({
  position: "relative",
  width: "100%",
  height: "100%",
  cursor: "pointer",
  "&:hover .overlay-icon": {
    opacity: 1,
  },
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  overflow: "hidden",
});

const StyledDataGrid = styled(DataGrid)(({ theme }) => ({
  "& .MuiDataGrid-cellEditable": {
    backgroundColor: theme.palette.action.hover,
  },
  "& .MuiDataGrid-footerContainer": {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  "& .MuiTablePagination-root": {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  "& .MuiTablePagination-toolbar": {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  "& .MuiTablePagination-selectLabel, .MuiTablePagination-displayedRows": {
    margin: 0,
    lineHeight: "normal",
  },
  "& .MuiTablePagination-actions": {
    display: "flex",
    alignItems: "center",
  },
}));

export default function CustomizedDataGrid() {
  const dispatch = useDispatch();
  const customers = useSelector((state) => state.customers.items);
  const products = useSelector((state) => state.products.items);
  const orders = useSelector((state) => state.orders.items);

  const [currentTab, setCurrentTab] = React.useState("products");
  const [loading, setLoading] = React.useState(false);
  const [open, setOpen] = React.useState(false);
  const [selectedImage, setSelectedImage] = React.useState(null);
  const [imagePreview, setImagePreview] = React.useState(null);
  const [selectedFile, setSelectedFile] = React.useState(null);
  const [updateTrigger, setUpdateTrigger] = React.useState(false);
  const [selectedProduct, setSelectedProduct] = React.useState(null);
  const [newProductDialogOpen, setNewProductDialogOpen] = React.useState(false);
  const [selectedRowIds, setSelectedRowIds] = React.useState([]);

  const [newProduct, setNewProduct] = React.useState({
    Name: "",
    Category: "",
    Cost: "",
    Price: "",
    DynamicPrice: "",
    Ranking: "",
    StockLevel: "",
  });

  const categoryOptions = [
    "Main Course",
    "Side Dish",
    "Appetizer",
    "Dessert",
    "Beverage",
  ];

  const [productsFetched, setProductsFetched] = React.useState(false);
  const [ordersFetched, setOrdersFetched] = React.useState(false);
  const [customersFetched, setCustomersFetched] = React.useState(false);

  React.useEffect(() => {
    let isMounted = true;

    if (currentTab === "products" && (!productsFetched || updateTrigger)) {
      setLoading(true);
      dispatch(fetchAllProducts()).then(() => {
        if (isMounted) {
          setLoading(false);
          setProductsFetched(true);
          setUpdateTrigger(false);
        }
      });
    } else if (currentTab === "orders" && (!ordersFetched || updateTrigger)) {
      setLoading(true);
      dispatch(fetchOrders()).then(() => {
        if (isMounted) {
          setLoading(false);
          setOrdersFetched(true);
          setUpdateTrigger(false);
        }
      });
    } else if (
      currentTab === "customers" &&
      (!customersFetched || updateTrigger)
    ) {
      setLoading(true);
      dispatch(fetchCustomers()).then(() => {
        if (isMounted) {
          setLoading(false);
          setCustomersFetched(true);
          setUpdateTrigger(false);
        }
      });
    }

    return () => {
      isMounted = false;
    };
  }, [
    dispatch,
    currentTab,
    productsFetched,
    ordersFetched,
    customersFetched,
    updateTrigger,
  ]);

  const handleChange = (event, newValue) => {
    setCurrentTab(newValue);
  };

  const handleImageClick = (product) => {
    setSelectedProduct(product);
    setSelectedImage(`${product.imagePath}?${new Date().getTime()}`);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedImage(null);
    setSelectedProduct(null);
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleFileChange = (event) => {
    if (event.target.files.length > 0 && selectedProduct) {
      const file = event.target.files[0];
      const formData = new FormData();
      formData.append("file", file);
      formData.append("ProductID", selectedProduct.ProductID);
      formData.append("Name", selectedProduct.Name);

      dispatch(uploadProductImage(formData)).then(() => {
        setUpdateTrigger((prev) => !prev);
        handleClose();
      });
    }
  };

  const handleDelete = () => {
    console.log("Selected IDs for deletion:", selectedRowIds);
    Promise.all(selectedRowIds.map((id) => dispatch(deleteProduct(id))))
      .then(() => {
        setUpdateTrigger((prev) => !prev);
      })
      .catch((error) => {
        console.error("Error deleting products:", error);
      });
  };

  const handleNewProductChange = (e) => {
    const { name, value } = e.target;
    setNewProduct((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCategoryChange = (event) => {
    setNewProduct((prev) => ({
      ...prev,
      Category: event.target.value,
    }));
  };

  const handleAddNewProduct = () => {
    dispatch(createProduct(newProduct)).then((response) => {
      const newProductId = response.payload.productId;
      if (selectedFile) {
        const formData = new FormData();
        formData.append("file", selectedFile);
        formData.append("ProductID", newProductId);
        formData.append("Name", newProduct.Name);

        dispatch(uploadProductImage(formData)).then(() => {
          setUpdateTrigger((prev) => !prev);
          setNewProductDialogOpen(false);
          setSelectedFile(null);
          setImagePreview(null);
          dispatch(fetchAllProducts());
          setNewProduct({
            Name: "",
            Category: "",
            Cost: "",
            Price: "",
            DynamicPrice: "",
            Ranking: "",
            StockLevel: "",
          });
        });
      }
    });
  };

  const formatCurrency = (value) => {
    if (typeof value === "number") {
      return `£${value.toFixed(2)}`;
    }
    return value;
  };

  const processProductRowUpdate = (newRow, oldRow) => {
    const updatedRow = { ...oldRow, ...newRow };
    updatedRow.Profit =
      updatedRow.DynamicPrice !== undefined && updatedRow.Cost !== undefined
        ? (updatedRow.DynamicPrice - updatedRow.Cost).toFixed(2)
        : "N/A";

    const { ProductID, imagePath, ...dataToUpdate } = updatedRow;

    return dispatch(updateProduct({ ...dataToUpdate, ProductID }))
      .then(() => {
        setUpdateTrigger(true);
        return updatedRow;
      })
      .catch((error) => {
        console.error("Error updating product:", error);
        return oldRow;
      });
  };

  const processCustomerRowUpdate = (newRow, oldRow) => {
    const updatedRow = { ...oldRow, ...newRow };
    const { CustomerID, Password, ...dataToUpdate } = updatedRow;

    return dispatch(updateCustomer({ ...dataToUpdate, CustomerID }))
      .then(() => {
        setUpdateTrigger((prev) => !prev);
        return updatedRow;
      })
      .catch((error) => {
        console.error("Error updating customer:", error);
        return oldRow;
      });
  };

  const columns = {
    products: [
      {
        field: "imagePath",
        headerName: "Image",
        width: 140,
        renderCell: (params) => (
          <ImageContainer onClick={() => handleImageClick(params.row)}>
            <img
              src={`${params.value}?${new Date().getTime()}`}
              alt={params.row.Name}
              style={{ width: "100%", height: "100%" }}
            />
          </ImageContainer>
        ),
      },
      { field: "ProductID", headerName: "ID", width: 110, editable: false },
      { field: "Name", headerName: "Name", width: 200, editable: true },
      { field: "Category", headerName: "Category", width: 160, editable: true },
      { field: "Cost", headerName: "Cost", width: 130, editable: true },
      { field: "Price", headerName: "Price", width: 130, editable: true },
      {
        field: "DynamicPrice",
        headerName: "Dynamic Price",
        width: 190,
        editable: true,
      },
      { field: "Profit", headerName: "Profit", width: 130, editable: false },
      { field: "Ranking", headerName: "Ranking", width: 150, editable: true },
      {
        field: "StockLevel",
        headerName: "Stock Level",
        width: 170,
        editable: true,
      },
      {
        field: "LastUpdated",
        headerName: "Last Updated",
        width: 190,
        editable: false,
      },
    ],
    orders: [
      { field: "OrderID", headerName: "Order ID", width: 150 },
      { field: "CustomerID", headerName: "Customer ID", width: 180 },
      { field: "CustomerName", headerName: "Customer Name", width: 200 },
      { field: "OrderDate", headerName: "Order Date", width: 170 },
      { field: "OrderTime", headerName: "Order Time", width: 170 },
      {
        field: "Total",
        headerName: "Total",
        width: 130,
        valueFormatter: ({ value }) => formatCurrency(value),
        type: "number",
        headerAlign: "left",
        align: "left",
      },
      { field: "OrderDetails", headerName: "Order Details", width: 1500 },
    ],
    customers: [
      { field: "CustomerID", headerName: "ID", width: 100, editable: false },
      { field: "Name", headerName: "Name", width: 200, editable: true },
      { field: "Email", headerName: "Email", width: 250, editable: true },
      { field: "Phone", headerName: "Phone", width: 220, editable: true },
      { field: "Address", headerName: "Address", width: 880, editable: true },
    ],
  };

  const rows = {
    products,
    orders,
    customers,
  };

  const getRowId = (row) => {
    if (currentTab === "products") return row.ProductID;
    if (currentTab === "orders") return row.OrderID;
    if (currentTab === "customers") return row.CustomerID;
  };

  const getRowHeight = () => {
    return currentTab === "products" ? 120 : 52;
  };

  const getAddButtonLabel = () => {
    if (currentTab === "products") return "Add New Product";
    if (currentTab === "orders") return "Add New Order";
    if (currentTab === "customers") return "Add New Customer";
  };

  const handleAddButtonClick = () => {
    if (currentTab === "products") {
      setNewProductDialogOpen(true);
    } else {
    }
  };

  return (
    <Box>
      <Tabs value={currentTab} onChange={handleChange} centered>
        <Tab label="Products" value="products" />
        <Tab label="Orders" value="orders" />
        <Tab label="Customers" value="customers" />
      </Tabs>

      {loading ? (
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          mt={10}
          height="400px"
        >
          <CircularProgress />
        </Box>
      ) : (
        <Box>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            mb={2}
          >
            <Button
              startIcon={<AddIcon />}
              variant="contained"
              color="primary"
              onClick={handleAddButtonClick}
            >
              {getAddButtonLabel()}
            </Button>
            <Button
              startIcon={<DeleteIcon />}
              variant="contained"
              color="secondary"
              onClick={handleDelete}
            >
              Delete Selected
            </Button>
          </Box>

          <StyledDataGrid
            autoHeight
            checkboxSelection
            rows={rows[currentTab]}
            columns={columns[currentTab]}
            getRowId={getRowId}
            getRowHeight={getRowHeight}
            getRowClassName={(params) =>
              params.indexRelativeToCurrentPage % 2 === 0 ? "even" : "odd"
            }
            initialState={{
              pagination: { paginationModel: { pageSize: 20 } },
              sorting: {
                sortModel: [{ field: "ProductID", sort: "asc" }],
              },
            }}
            pageSizeOptions={[10, 20, 50]}
            density="standard"
            processRowUpdate={
              currentTab === "products"
                ? processProductRowUpdate
                : processCustomerRowUpdate
            }
            onRowSelectionModelChange={(newSelectionModel) => {
              console.log("New selection:", newSelectionModel);
              setSelectedRowIds(newSelectionModel);
            }}
          />
        </Box>
      )}


      <input
        type="file"
        id="fileInput"
        style={{ display: "none" }}
        onChange={handleFileSelect}
      />

      {/* Image Modal */}
      <Dialog open={open} onClose={handleClose} maxWidth="lg">
        <DialogContent style={{ position: "relative", padding: 0 }}>
          {selectedImage && (
            <ModalImageContainer>
              <img
                src={selectedImage}
                alt="Selected Product"
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
              <OverlayIconButton className="overlay-icon" component="label">
                <UploadIcon />
                <input type="file" hidden onChange={handleFileChange} />
              </OverlayIconButton>
            </ModalImageContainer>
          )}
        </DialogContent>
      </Dialog>

      {/* New Product Modal */}
      <Dialog
        open={newProductDialogOpen}
        onClose={() => setNewProductDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={2}>
            <UploadArea
              onClick={() => document.getElementById("fileInput").click()}
            >
              {imagePreview ? (
                <img
                  src={imagePreview}
                  alt="Preview"
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              ) : (
                <Typography>Upload Image</Typography>
              )}
            </UploadArea>

            <input
              type="file"
              id="fileInput"
              style={{ display: "none" }}
              onChange={handleFileSelect}
            />
            <TextField
              label="Name"
              name="Name"
              value={newProduct.Name}
              onChange={handleNewProductChange}
              fullWidth
              margin="normal"
              sx={commonTextFieldSx}
            />
            <FormControl fullWidth margin="normal">
              <InputLabel shrink={false}></InputLabel>
              <Select
                name="Category"
                value={newProduct.Category}
                onChange={handleCategoryChange}
                displayEmpty
                renderValue={(selected) => {
                  if (selected.length === 0) {
                    return <>Category</>;
                  }
                  return selected;
                }}
              >
                {categoryOptions.map((category) => (
                  <MenuItem key={category} value={category}>
                    {category}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              label="Cost"
              name="Cost"
              value={newProduct.Cost}
              onChange={handleNewProductChange}
              fullWidth
              margin="normal"
              sx={commonTextFieldSx}
            />

            <TextField
              label="Price"
              name="Price"
              value={newProduct.Price}
              onChange={handleNewProductChange}
              fullWidth
              margin="normal"
              sx={commonTextFieldSx}
            />

            <TextField
              label="Dynamic Price"
              name="DynamicPrice"
              value={newProduct.DynamicPrice}
              onChange={handleNewProductChange}
              fullWidth
              margin="normal"
              sx={commonTextFieldSx}
            />

            <TextField
              label="Ranking"
              name="Ranking"
              value={newProduct.Ranking}
              onChange={handleNewProductChange}
              fullWidth
              margin="normal"
              sx={commonTextFieldSx}
            />

            <TextField
              label="Stock Level"
              name="StockLevel"
              value={newProduct.StockLevel}
              onChange={handleNewProductChange}
              fullWidth
              margin="normal"
              sx={commonTextFieldSx}
            />
            <Button
              variant="contained"
              color="primary"
              onClick={handleAddNewProduct}
            >
              Add Product
            </Button>
          </Box>
        </DialogContent>
      </Dialog>
    </Box>
  );
}

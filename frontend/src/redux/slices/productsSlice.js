import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../api/axiosInstance";

export const fetchAllProducts = createAsyncThunk(
  "products/fetchAllProducts",
  async ({ page, pageSize, search }) => {
    const response = await axiosInstance.get("/products", {
      params: { page, pageSize, search },
    });
    return response.data;
  }
);

export const fetchProducts = createAsyncThunk(
  "products/fetchProducts",
  async () => {
    const response = await axiosInstance.get("/products/ranking-promotion");
    return response.data;
  }
);

export const updateProduct = createAsyncThunk(
  "products/updateProduct",
  async (product) => {
    const response = await axiosInstance.post(`/products/update`, product);
    return response.data;
  }
);

export const uploadProductImage = createAsyncThunk(
  "products/uploadProductImage",
  async (formData) => {
    const response = await axiosInstance.post(
      "/products/upload-image",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  }
);

export const deleteProduct = createAsyncThunk(
  "products/deleteProduct",
  async (id) => {
    await axiosInstance.delete(`/products/${id}`);
    return id;
  }
);

export const createProduct = createAsyncThunk(
  "products/createProduct",
  async (product) => {
    const response = await axiosInstance.post(`/products/create`, product);
    return response.data.product;
  }
);

const productsSlice = createSlice({
  name: "products",
  initialState: {
    items: [],
    total: 0,
    currentPage: 1,
    pageSize: 20,
    totalPages: 0,
    status: "idle",
    error: null,
  },
  reducers: {
    updateProductsFromWebSocket: (state, action) => {
      state.items = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllProducts.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchAllProducts.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items = action.payload.items;
        state.total = action.payload.total;
        state.currentPage = action.payload.page;
        state.pageSize = action.payload.pageSize;
        state.totalPages = action.payload.totalPages;
      })
      .addCase(fetchAllProducts.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      })
      .addCase(fetchProducts.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items = action.payload;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      })
      .addCase(updateProduct.fulfilled, (state, action) => {
        const index = state.items.findIndex(item => item.ProductID === action.payload.ProductID);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })
      .addCase(uploadProductImage.fulfilled, (state, action) => {
      })
      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.items = state.items.filter(
          (item) => item.ProductID !== action.payload
        );
        state.total -= 1;
      })
      .addCase(createProduct.fulfilled, (state, action) => {
        state.items.push(action.payload);
        state.total += 1;
      });
  },
});

export const { updateProductsFromWebSocket } = productsSlice.actions;

export default productsSlice.reducer;

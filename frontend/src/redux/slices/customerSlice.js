import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../api/axiosInstance";

export const fetchCustomers = createAsyncThunk(
  "customers/fetchCustomers",
  async ({ page, pageSize, search }) => {
    const response = await axiosInstance.get("/customers", {
      params: { page, pageSize, search },
    });
    return response.data;
  }
);

export const createCustomer = createAsyncThunk(
  "customers/createCustomer",
  async (customer, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(`/customers`, customer);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response.data);
    }
  }
);

export const updateCustomer = createAsyncThunk(
  "customers/updateCustomer",
  async ({ id, ...customer }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.put(`/customers/${id}`, customer);
      return response.data;
    } catch (err) {
      console.error("Error in updateCustomer thunk:", err);
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const deleteCustomer = createAsyncThunk(
  "customers/deleteCustomer",
  async (id, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.delete(`/customers/${id}`);
      if (response.status === 200) {
        return id;
      } else {
        return rejectWithValue(response.data);
      }
    } catch (err) {
      console.error("Error deleting customer:", err);
      return rejectWithValue(err.response ? err.response.data : err.message);
    }
  }
);

const customerSlice = createSlice({
  name: "customers",
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
    updateCustomerFromWebSocket: (state, action) => {
      const index = state.items.findIndex(item => item.CustomerID === action.payload.CustomerID);
      if (index !== -1) {
        state.items[index] = action.payload;
      }
    },
    addCustomerFromWebSocket: (state, action) => {
      state.items.push(action.payload);
      state.total += 1;
    },
    removeCustomerFromWebSocket: (state, action) => {
      state.items = state.items.filter(item => item.CustomerID !== action.payload);
      state.total -= 1;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCustomers.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchCustomers.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items = action.payload.items;
        state.total = action.payload.total;
        state.currentPage = action.payload.page;
        state.pageSize = action.payload.pageSize;
        state.totalPages = action.payload.totalPages;
      })
      .addCase(fetchCustomers.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      })
      .addCase(createCustomer.fulfilled, (state, action) => {
        state.items.push(action.payload);
        state.total += 1;
      })
      .addCase(updateCustomer.fulfilled, (state, action) => {
        const index = state.items.findIndex(
          (item) => item.CustomerID === action.payload.CustomerID
        );
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })
      .addCase(deleteCustomer.fulfilled, (state, action) => {
        state.items = state.items.filter(
          (item) => item.CustomerID !== action.payload
        );
        state.total -= 1;
      });
  },
});

export const {
  updateCustomerFromWebSocket,
  addCustomerFromWebSocket,
  removeCustomerFromWebSocket,
} = customerSlice.actions;

export default customerSlice.reducer;

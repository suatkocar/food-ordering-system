import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../api/axiosInstance";

export const fetchOrders = createAsyncThunk(
  "orders/fetchOrders",
  async ({ page, pageSize, search }) => {
    const response = await axiosInstance.get("/orders", {
      params: { page, pageSize, search },
    });
    return response.data;
  }
);

export const fetchCustomerOrders = createAsyncThunk(
  "orders/fetchCustomerOrders",
  async (customerId, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(
        `/orders/customer/${customerId}`
      );
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response.data);
    }
  }
);

export const createOrder = createAsyncThunk(
  "orders/createOrder",
  async (order, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post("/orders", order);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response.data);
    }
  }
);

export const updateOrder = createAsyncThunk(
  "orders/updateOrder",
  async (order, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.put(
        `/orders/${order.OrderID}`,
        order
      );
      if (!response.data) {
        throw new Error("No data received from server");
      }
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const deleteOrder = createAsyncThunk(
  "orders/deleteOrder",
  async (id, { rejectWithValue }) => {
    try {
      await axiosInstance.delete(`/orders/${id}`);
      return id;
    } catch (err) {
      return rejectWithValue(err.response.data);
    }
  }
);

const orderSlice = createSlice({
  name: "orders",
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
    addOrderFromWebSocket: (state, action) => {
      const newOrder = { ...action.payload.order, isNew: true };
      state.items = [newOrder, ...state.items];
      state.total += 1;
    },
    clearNewOrderFlag: (state, action) => {
      const order = state.items.find((item) => item.OrderID === action.payload);
      if (order) {
        order.isNew = false;
      }
    },
    updateOrderFromWebSocket: (state, action) => {
      const index = state.items.findIndex(
        (item) => item.OrderID === action.payload.OrderID
      );
      if (index !== -1) {
        state.items[index] = action.payload;
      }
    },
    removeOrderFromWebSocket: (state, action) => {
      state.items = state.items.filter(
        (item) => item.OrderID !== action.payload
      );
      state.total -= 1;
    },
    updateOrderInStore: (state, action) => {
      const updatedOrder = action.payload;
      const index = state.items.findIndex(
        (order) => order.OrderID === updatedOrder.OrderID
      );
      if (index !== -1) {
        state.items[index] = { ...state.items[index], ...updatedOrder };
      } else {
        state.items.unshift(updatedOrder);
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchOrders.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items = action.payload.items;
        state.total = action.payload.total;
        state.currentPage = action.payload.page;
        state.pageSize = action.payload.pageSize;
        state.totalPages = action.payload.totalPages;
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      })
      .addCase(createOrder.fulfilled, (state, action) => {
        const newOrder = action.payload;
        state.items.unshift(newOrder);
        state.total += 1;
      })
      .addCase(updateOrder.fulfilled, (state, action) => {
        const index = state.items.findIndex(
          (item) => item.OrderID === action.payload.OrderID
        );
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })
      .addCase(deleteOrder.fulfilled, (state, action) => {
        state.items = state.items.filter(
          (item) => item.OrderID !== action.payload
        );
        state.total -= 1;
      })
      .addCase(fetchCustomerOrders.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchCustomerOrders.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items = action.payload;
        state.total = action.payload.length;
      })
      .addCase(fetchCustomerOrders.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      });
  },
});

export const {
  addOrderFromWebSocket,
  updateOrderFromWebSocket,
  removeOrderFromWebSocket,
  clearNewOrderFlag,
  updateOrderInStore,
} = orderSlice.actions;

export default orderSlice.reducer;

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../api/axiosInstance";

export const fetchOrderStats = createAsyncThunk(
  "orderStats/fetchOrderStats",
  async (interval, { getState, rejectWithValue }) => {
    const state = getState();
    if (state.orderStats.data.current.length > 0 && state.orderStats.interval === interval) {
      return state.orderStats.data.current;
    }
    try {
      const endpoint = `/order-stats/${interval}`;
      console.log(`Fetching ${interval} data from ${endpoint}`);
      const response = await axiosInstance.get(endpoint);
      return response.data;
    } catch (error) {
      console.log(`Error fetching ${interval} data:`, error);
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const orderStatsSlice = createSlice({
  name: "orderStats",
  initialState: {
    data: { current: [], previous: 0 },
    interval: 'daily',
    status: "idle",
    error: null,
  },
  reducers: {
    resetError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchOrderStats.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchOrderStats.fulfilled, (state, action) => {
        console.log(`Fetched data:`, action.payload);
        state.status = "succeeded";
        state.data.current = action.payload;
        state.interval = action.meta.arg;

        const previousData = action.payload.slice(0, action.payload.length - 1);
        const previousTotal = previousData.reduce(
          (acc, curr) => acc + Number(curr.total_orders),
          0
        );
        state.data.previous = previousTotal;
      })
      .addCase(fetchOrderStats.rejected, (state, action) => {
        console.log(`Failed to fetch data:`, action.payload);
        state.status = "failed";
        state.error = action.payload;
      });
  },
});

export const { resetError } = orderStatsSlice.actions;
export default orderStatsSlice.reducer;

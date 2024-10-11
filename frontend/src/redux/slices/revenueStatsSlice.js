import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../api/axiosInstance";

export const fetchRevenueStats = createAsyncThunk(
  "revenueStats/fetchRevenueStats",
  async (interval, { getState, rejectWithValue }) => {
    const state = getState();
    if (state.revenueStats.data.current.length > 0 && state.revenueStats.interval === interval) {
      return state.revenueStats.data.current;
    }
    try {
      const response = await axiosInstance.get(`/revenue/${interval}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const revenueStatsSlice = createSlice({
  name: "revenueStats",
  initialState: {
    data: { current: [] },
    interval: 'daily',
    status: "idle",
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchRevenueStats.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchRevenueStats.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.data.current = action.payload;
      })
      .addCase(fetchRevenueStats.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      });
  },
});

export default revenueStatsSlice.reducer;

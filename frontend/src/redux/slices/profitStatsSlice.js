import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../api/axiosInstance";

export const fetchProfitStats = createAsyncThunk(
  "profitStats/fetchProfitStats",
  async (interval, { getState, rejectWithValue }) => {
    const state = getState();
    if (state.profitStats.data.current.length > 0 && state.profitStats.interval === interval) {
      return state.profitStats.data.current;
    }
    try {
      const response = await axiosInstance.get(`/profit/${interval}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const profitStatsSlice = createSlice({
  name: "profitStats",
  initialState: {
    data: { current: [] },
    interval: 'daily',
    status: "idle",
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchProfitStats.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchProfitStats.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.data.current = action.payload;
      })
      .addCase(fetchProfitStats.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      });
  },
});

export default profitStatsSlice.reducer;

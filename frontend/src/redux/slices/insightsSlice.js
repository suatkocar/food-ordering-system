import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../api/axiosInstance";

export const fetchDashboardData = createAsyncThunk(
  "insights/fetchDashboardData",
  async () => {
    const responses = await Promise.all([
      axiosInstance.get("/profit/last-30-days"),
      axiosInstance.get("/profit/last-52-weeks"),
      axiosInstance.get("/profit/last-12-months"),
      axiosInstance.get("/profit/last-5-years"),
      axiosInstance.get("/products/top-profit"),
      axiosInstance.get("/products/top-sales-last-30-days"),
      axiosInstance.get("/products/top-sales-last-60-days"),
      axiosInstance.get("/orders/peak-hours"),
      axiosInstance.get("/promotions/active-last-30-days"),
      axiosInstance.get("/orders/loyalty-status"),
      axiosInstance.get("/inventory/status"),
      axiosInstance.get("/products/profit-margin"),
      axiosInstance.get("/sales/season"),
      axiosInstance.get("/orders/peak-least-hours"),
      axiosInstance.get("/monthly-order-distribution-by-time"),
    ]);

    return responses.map((response) => response.data);
  }
);

const insightsSlice = createSlice({
  name: "insights",
  initialState: {
    totalProfitLast30Days: [],
    totalProfitLast52Weeks: [],
    totalProfitLast12Months: [],
    totalProfitLast5Years: [],
    topProductsByProfit: [],
    topProductsDailySalesLast30Days: [],
    topProductsDailySalesLast60Days: [],
    peakOrderHours: [],
    promotionsData: [],
    customerLoyaltyStatus: [],
    inventoryStatus: [],
    productProfitMargin: [],
    salesBySeason: [],
    monthlyPeakAndLeastOrderHours: [],
    monthlyOrderDistributionByTime: [],
    loading: false,
    error: null,
    fetched: false,
  },
  reducers: {
    resetInsights: (state) => {
      state.totalProfitLast30Days = [];
      state.totalProfitLast52Weeks = [];
      state.totalProfitLast12Months = [];
      state.totalProfitLast5Years = [];
      state.topProductsByProfit = [];
      state.topProductsDailySalesLast30Days = [];
      state.topProductsDailySalesLast60Days = [];
      state.peakOrderHours = [];
      state.promotionsData = [];
      state.customerLoyaltyStatus = [];
      state.inventoryStatus = [];
      state.productProfitMargin = [];
      state.salesBySeason = [];
      state.monthlyPeakAndLeastOrderHours = [];
      state.monthlyOrderDistributionByTime = [];
      state.loading = false;
      state.fetched = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboardData.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchDashboardData.fulfilled, (state, action) => {
        const [
          totalProfitLast30Days,
          totalProfitLast52Weeks,
          totalProfitLast12Months,
          totalProfitLast5Years,
          topProductsByProfit,
          topProductsDailySalesLast30Days,
          topProductsDailySalesLast60Days,
          peakOrderHours,
          promotionsData,
          customerLoyaltyStatus,
          inventoryStatus,
          productProfitMargin,
          salesBySeason,
          monthlyPeakAndLeastOrderHours,
          monthlyOrderDistributionByTime,
        ] = action.payload;

        state.totalProfitLast30Days = totalProfitLast30Days;
        state.totalProfitLast52Weeks = totalProfitLast52Weeks;
        state.totalProfitLast12Months = totalProfitLast12Months;
        state.totalProfitLast5Years = totalProfitLast5Years;
        state.topProductsByProfit = topProductsByProfit;
        state.topProductsDailySalesLast30Days = topProductsDailySalesLast30Days;
        state.topProductsDailySalesLast60Days = topProductsDailySalesLast60Days;
        state.peakOrderHours = peakOrderHours;
        state.promotionsData = promotionsData;
        state.customerLoyaltyStatus = customerLoyaltyStatus;
        state.inventoryStatus = inventoryStatus;
        state.productProfitMargin = productProfitMargin;
        state.salesBySeason = salesBySeason;
        state.monthlyPeakAndLeastOrderHours = monthlyPeakAndLeastOrderHours;
        state.monthlyOrderDistributionByTime = monthlyOrderDistributionByTime;
        state.loading = false;
        state.fetched = true;
      })
      .addCase(fetchDashboardData.rejected, (state, action) => {
        state.error = action.payload;
        state.loading = false;
      });
  },
});

export const { resetInsights } = insightsSlice.actions;

export default insightsSlice.reducer;

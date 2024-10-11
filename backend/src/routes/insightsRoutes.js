import { Router } from "express";
import {
  getTotalProfitLast30Days,
  getTotalProfitLast52Weeks,
  getTotalProfitLast12Months,
  getTotalProfitLast5Years,
  getTotalProfit,
  getTopProductsByProfit,
  getTopProductsDailySalesLast30Days,
  getTopProductsDailySalesLast60Days,
  getPeakOrderHours,
  getActivePromotionsLast30Days,
  getCustomerLoyaltyStatus,
  getInventoryStatus,
  getProductProfitMargin,
  getSalesBySeason,
  getMonthlyPeakAndLeastOrderHours,
  getMonthlyOrderDistributionByTime,
} from "../controllers/insightsController.js";

const router = Router();

router.get("/profit/last-30-days", getTotalProfitLast30Days);
router.get("/profit/last-52-weeks", getTotalProfitLast52Weeks);
router.get("/profit/last-12-months", getTotalProfitLast12Months);
router.get("/profit/last-5-years", getTotalProfitLast5Years);
router.get("/profit/total", getTotalProfit);

router.get("/products/top-profit", getTopProductsByProfit);

router.get(
  "/products/top-sales-last-30-days",
  getTopProductsDailySalesLast30Days,
);

router.get(
  "/products/top-sales-last-60-days",
  getTopProductsDailySalesLast60Days,
);

router.get("/orders/peak-hours", getPeakOrderHours);

router.get("/promotions/active-last-30-days", getActivePromotionsLast30Days);

router.get("/orders/loyalty-status", getCustomerLoyaltyStatus);

router.get("/inventory/status", getInventoryStatus);

router.get("/products/profit-margin", getProductProfitMargin);

router.get("/sales/season", getSalesBySeason);

router.get("/orders/peak-least-hours", getMonthlyPeakAndLeastOrderHours);

router.get(
  "/monthly-order-distribution-by-time",
  getMonthlyOrderDistributionByTime,
);

export default router;

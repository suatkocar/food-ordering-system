import express from "express";
import {
  getDailyRevenueStats,
  getWeeklyRevenueStats,
  getMonthlyRevenueStats,
  getYearlyRevenueStats,
} from "../controllers/revenueController.js";

const router = express.Router();

router.get("/revenue/daily", getDailyRevenueStats);

router.get("/revenue/weekly", getWeeklyRevenueStats);

router.get("/revenue/monthly", getMonthlyRevenueStats);

router.get("/revenue/yearly", getYearlyRevenueStats);

export default router;

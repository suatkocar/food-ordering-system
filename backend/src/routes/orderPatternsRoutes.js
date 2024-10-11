import express from "express";
import {
  getDailyOrderStats,
  getWeeklyOrderStats,
  getMonthlyOrderStats,
  getYearlyOrderStats,
} from "../controllers/orderPatternsController.js";

const router = express.Router();

router.get("/order-stats/daily", getDailyOrderStats);

router.get("/order-stats/weekly", getWeeklyOrderStats);

router.get("/order-stats/monthly", getMonthlyOrderStats);

router.get("/order-stats/yearly", getYearlyOrderStats);

export default router;

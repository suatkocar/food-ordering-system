import express from "express";
import {
  getDailyProfitStats,
  getWeeklyProfitStats,
  getMonthlyProfitStats,
  getYearlyProfitStats,
} from "../controllers/profitController.js";

const router = express.Router();

router.get("/profit/daily", getDailyProfitStats);

router.get("/profit/weekly", getWeeklyProfitStats);

router.get("/profit/monthly", getMonthlyProfitStats);

router.get("/profit/yearly", getYearlyProfitStats);

export default router;

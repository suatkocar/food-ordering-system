import express from "express";
import {
  getAllPromotions,
  createPromotion,
} from "../controllers/promotionsController.js";

const router = express.Router();

router.get("/promotions", getAllPromotions);

router.post("/promotions", createPromotion);

export default router;

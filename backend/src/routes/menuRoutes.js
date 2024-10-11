import express from "express";
import {
  updateMenuRankings,
  getProductsWithPopularity,
  getAllPopularProducts,
  createPopularProduct,
  updatePopularProduct,
  deletePopularProduct,
  getProductsByRanking,
  getAllCategories,
} from "../controllers/menuController.js";

import {
  updateDynamicPrice,
  updatePopularProducts,
} from "../controllers/pricingController.js";

const router = express.Router();

router.post("/menu/adjust", async (req, res) => {
  try {
    await updateMenuRankings();
    res.status(200).json({ message: "Menu adjusted based on order patterns." });
  } catch (error) {
    res.status(500).json({ error: "Error adjusting menu." });
  }
});

router.post("/menu/update-all", async (req, res) => {
  try {
    await updatePopularProducts();
    await updateDynamicPrice();
    await updateMenuRankings();
    res.status(200).json({ message: "All updates applied successfully." });
  } catch (error) {
    res.status(500).json({ error: "Error applying updates." });
  }
});

router.get("/products/popular", getProductsWithPopularity);

router.get("/products/popular/all", getAllPopularProducts);

router.post("/products/popular", createPopularProduct);

router.put("/products/popular/:id", updatePopularProduct);

router.delete("/products/popular/:id", deletePopularProduct);

router.get("/products/rankings", getProductsByRanking);

router.get("/categories", getAllCategories);

export default router;

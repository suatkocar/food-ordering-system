import express from "express";
import {
  updateDynamicPrice,
  updatePopularProducts,
} from "../controllers/pricingController.js";

const router = express.Router();

router.post("/dynamic-pricing/update", async (req, res) => {
  try {
    await updateDynamicPrice();
    res.status(200).json({ message: "Dynamic prices updated successfully." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error updating dynamic prices." });
  }
});

router.post("/popular-products/update", async (req, res) => {
  try {
    await updatePopularProducts();
    res.status(200).json({ message: "Popular products updated successfully." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error updating popular products." });
  }
});

export default router;

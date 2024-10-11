import express from "express";
import {
  getCart,
  addToCart,
  removeFromCart,
  updateCartQuantity,
  clearCart,
} from "../controllers/cartController.js";

const router = express.Router();

router.get("/cart", getCart);
router.post("/cart", addToCart);
router.delete("/cart", removeFromCart);
router.put("/cart", updateCartQuantity);
router.delete("/cart/clear", clearCart);

export default router;

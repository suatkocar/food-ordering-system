import express from "express";
import {
  getAllOrders,
  createOrder,
  updateOrder,
  deleteOrder,
  getCustomerOrders,
} from "../controllers/ordersController.js";
import {
  updateDynamicPrice,
  updatePopularProducts,
} from "../controllers/pricingController.js";
import { updateMenuRankings } from "../controllers/menuController.js";
import { authenticateUser } from "../middleware/authenticateUser.js";

const router = express.Router();

router.get("/orders", authenticateUser, getAllOrders);

router.post("/orders", authenticateUser, async (req, res) => {
  try {
    await createOrder(req, res);

    const wss = req.app.locals.wss;

    await updateDynamicPrice(wss);
    await updatePopularProducts(wss);
    await updateMenuRankings(wss);
  } catch (error) {
    console.error("Error in processing the order and updates:", error);
    res
      .status(500)
      .json({ message: "An error occurred while processing your request." });
  }
});

router.put("/orders/:id", authenticateUser, async (req, res) => {
  try {
    const { id } = req.params;
    const wss = req.app.locals.wss;
    const updatedOrder = await updateOrder(req, res, id, wss);

    if (!updatedOrder) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.status(200).json(updatedOrder);
  } catch (error) {
    console.error("Error updating order:", error);
    res.status(500).json({
      message: "An error occurred while updating the order.",
      error: error.message,
    });
  }
});

router.delete("/orders/:id", authenticateUser, deleteOrder);

router.get("/orders/customer/:customerId", authenticateUser, getCustomerOrders);

export default router;

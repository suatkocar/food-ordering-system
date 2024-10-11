import express from "express";
import {
  getAllOrderDetails,
  createOrderDetail,
  updateOrderDetail,
  deleteOrderDetail,
} from "../controllers/orderDetailsController.js";

const router = express.Router();

router.get("/orderdetails", getAllOrderDetails);
router.post("/orderdetails", createOrderDetail);
router.put("/orderdetails/:id", updateOrderDetail);
router.delete("/orderdetails/:id", deleteOrderDetail);

export default router;

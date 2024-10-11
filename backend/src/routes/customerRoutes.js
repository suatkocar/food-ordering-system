import express from "express";
import {
  getAllCustomers,
  createCustomer,
  updateCustomer,
  getCustomerById,
  deleteCustomer,
} from "../controllers/customerController.js";

const router = express.Router();

router.get("/customers", getAllCustomers);
router.get("/customers/:id", getCustomerById);
router.post("/customers", createCustomer);
router.put("/customers/:id", updateCustomer);
router.delete("/customers/:id", deleteCustomer);

export default router;

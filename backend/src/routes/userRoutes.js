import express from "express";
import {
  getAllUsers,
  createUser,
  updateUser,
  deleteUser,
  registerUser,
  loginUser,
  logoutUser,
  refreshToken,
  getUserDetails,
} from "../controllers/userController.js";

const router = express.Router();

router.get("/users", getAllUsers);
router.post("/users", createUser);
router.put("/users/:id", updateUser);
router.delete("/users/:id", deleteUser);
router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/logout", logoutUser);
router.post("/refresh-token", refreshToken);
router.get("/user", getUserDetails);

export default router;

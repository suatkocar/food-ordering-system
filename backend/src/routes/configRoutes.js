import express from "express";
import config from "../config/index.js";

const router = express.Router();

router.get("/config", (req, res) => {
  res.json({
    backendHost: config.localIp,
    backendPort: config.port,
    frontendPort: process.env.FRONTEND_PORT || 3001,
  });
});

export default router;

import cron from "node-cron";
import {
  updateDynamicPrice,
  updatePopularProducts,
} from "../controllers/pricingController.js";
import { updateMenuRankings } from "../controllers/menuController.js";
import { getWebSocketServer, broadcast } from "../middleware/websocket.js";
import db from "../models/db.js";

export const initTasks = async () => {
  console.log("Initializing the application with startup tasks...");
  try {
    await updateDynamicPrice();
    await updatePopularProducts();
    await updateMenuRankings();
    console.log("Database analysed.");
    console.log("Startup tasks completed successfully.");

    const currentDate = new Date();
    const formattedDate = currentDate.toLocaleString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
    console.log(formattedDate);
    console.log("---------------------------------");
  } catch (err) {
    console.error(`Startup tasks failed: ${err.message}`);
  }
};

const runUpdateTasks = async () => {
  try {
    await updatePopularProducts();
    await updateDynamicPrice();
    const updatedProducts = await updateMenuRankings();
    
    const wss = getWebSocketServer();
    broadcast(wss, {
      type: "menu-update",
      data: updatedProducts,
    });
    
    console.log("Update tasks completed and broadcasted");
  } catch (err) {
    console.error(`Update tasks failed: ${err.message}`);
  }
};

// Full update job
cron.schedule("0 */12 * * *", runUpdateTasks);

// Dynamic pricing update job
cron.schedule("0 */2 * * *", async () => {
  try {
    await updateDynamicPrice();
    const updatedProducts = await db.query("SELECT * FROM Products");
    
    const wss = getWebSocketServer();
    broadcast(wss, {
      type: "menu-update",
      data: updatedProducts[0],
    });
    
    console.log("Dynamic pricing updated and broadcasted");
  } catch (err) {
    console.error(`Dynamic pricing update failed: ${err.message}`);
  }
});

// Popular products update job
cron.schedule("0 0 * * *", async () => {
  try {
    await updatePopularProducts();
    const updatedProducts = await db.query("SELECT * FROM Products");
    
    const wss = getWebSocketServer();
    broadcast(wss, {
      type: "menu-update",
      data: updatedProducts[0],
    });
    
    console.log("Popular products updated and broadcasted");
  } catch (err) {
    console.error(`Popular products update failed: ${err.message}`);
  }
});

// Menu adjustment job
cron.schedule("0 */6 * * *", async () => {
  try {
    const updatedProducts = await updateMenuRankings();
    
    const wss = getWebSocketServer();
    broadcast(wss, {
      type: "menu-update",
      data: updatedProducts,
    });
    
    console.log("Menu rankings updated and broadcasted");
  } catch (err) {
    console.error(`Menu adjustment failed: ${err.message}`);
  }
});

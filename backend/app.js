import express from "express";
import cors from "cors";
import http from "http";
import { sessionMiddleware } from "./src/redis/index.js";
import { initializeWebSocket, getWebSocketServer } from "./src/middleware/websocket.js";
import config from "./src/config/index.js";
import {
  serveStaticFiles,
  serveDefaultImage,
} from "./src/middleware/staticFiles.js";
import userRoutes from "./src/routes/userRoutes.js";
import productRoutes from "./src/routes/productRoutes.js";
import orderRoutes from "./src/routes/orderRoutes.js";
import orderDetailsRoutes from "./src/routes/orderDetailsRoutes.js";
import customerRoutes from "./src/routes/customerRoutes.js";
import pricingRoutes from "./src/routes/pricingRoutes.js";
import menuRoutes from "./src/routes/menuRoutes.js";
import promotionsRoutes from "./src/routes/promotionsRoutes.js";
import cartRoutes from "./src/routes/cartRoutes.js";
import orderPatternsRoutes from "./src/routes/orderPatternsRoutes.js";
import revenueRoutes from "./src/routes/revenueRoutes.js";
import insightsRoutes from "./src/routes/insightsRoutes.js";
import profitRoutes from "./src/routes/profitRoutes.js";
import configRoutes from "./src/routes/configRoutes.js";
import chalk from "chalk";
import boxen from "boxen";
import { initTasks } from "./src/utils/cronJobs.js";
import { setCacheControl } from "./src/middleware/cacheControl.js";
import { authenticateUser } from "./src/middleware/authenticateUser.js";
import { fileURLToPath } from "url";
import path from "path";
import os from "os";
import dotenv from "dotenv";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, `.env.${process.env.NODE_ENV}`) });

console.log(chalk.blue('BACKEND_URL:'), chalk.green(process.env.BACKEND_URL));
console.log(chalk.blue('FRONTEND_URL:'), chalk.green(process.env.FRONTEND_URL));
console.log(chalk.blue('NODE_ENV:'), chalk.green(process.env.NODE_ENV));

const app = express();

const getLocalIp = () => {
  const networkInterfaces = os.networkInterfaces();
  for (const interfaceName in networkInterfaces) {
    for (const net of networkInterfaces[interfaceName]) {
      if (net.family === "IPv4" && !net.internal) {
        return net.address;
      }
    }
  }
  return "127.0.0.1";
};

const allowedOrigins = [
  config.frontendUrl,
  "http://localhost:3001",
  "http://127.0.0.1:3001",
  "http://suatkocar.dev",
  "https://suatkocar.dev",
];

if (process.env.NODE_ENV === "network") {
  allowedOrigins.push(`http://${getLocalIp()}:3001`);
}

if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1);
}

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("CORS policy violation"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());
app.use(sessionMiddleware);

app.use((req, res, next) => {
  if (req.session && req.session.user) {
    req.user = req.session.user;
  }
  next();
});

app.use(setCacheControl);

app.use(
  express.static("public", {
    maxAge: "1y",
    setHeaders: (res, path) => {
      if (
        [
          ".png",
          ".jpg",
          ".jpeg",
          ".gif",
          ".webp",
          ".css",
          ".js",
          ".woff",
          ".woff2",
          ".ttf",
        ].some((ext) => path.endsWith(ext))
      ) {
        res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
      }
    },
  })
);

app.use(
  "/assets",
  express.static(path.join(__dirname, "public/assets"), {
    maxAge: "1y",
    setHeaders: (res, path) => {
      if (
        [
          ".png",
          ".jpg",
          ".jpeg",
          ".gif",
          ".webp",
          ".css",
          ".js",
          ".woff",
          ".woff2",
          ".ttf",
        ].some((ext) => path.endsWith(ext))
      ) {
        res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
      }
    },
  })
);

app.use("/assets/images", serveStaticFiles());
app.use("/assets/images/products/:filename", serveDefaultImage);

app.use("/api", userRoutes);
app.use("/api", productRoutes);
app.use("/api", orderRoutes);
app.use("/api", orderDetailsRoutes);
app.use("/api", customerRoutes);
app.use("/api", pricingRoutes);
app.use("/api", menuRoutes);
app.use("/api", promotionsRoutes);
app.use("/api", cartRoutes);
app.use("/api", orderPatternsRoutes);
app.use("/api", revenueRoutes);
app.use("/api", insightsRoutes);
app.use("/api", profitRoutes);
app.use("/api", configRoutes);

app.use(authenticateUser);

const startServer = (port) => {
  const server = http.createServer(app);

  const wss = initializeWebSocket(server);

  app.locals.wss = wss;

  server.listen(port, config.host, async () => {
    try {
      await initTasks();

      const displayHost =
        process.env.NODE_ENV === "network" ? getLocalIp() : "localhost";
      const message = chalk.green.bold(
        `Backend server is running at http://${displayHost}:${port}`
      );
      const boxenOptions = {
        padding: 1,
        margin: 1,
        borderStyle: "round",
        borderColor: "green",
        backgroundColor: "#555555",
      };
      console.log(boxen(message, boxenOptions));
    } catch (err) {
      console.error(chalk.red("Error during initial execution of tasks:"), err);
    }
  });

  server.on("error", (err) => {
    if (err.code === "EADDRINUSE") {
      console.log(chalk.red(`Port ${port} is in use, trying another port...`));
      setTimeout(() => startServer(port + 1), 1000);
    } else {
      console.error(chalk.red(err));
    }
  });
};

startServer(config.port);

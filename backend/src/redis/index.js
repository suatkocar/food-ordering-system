import RedisStore from "connect-redis";
import session from "express-session";
import { createClient } from "redis";
import dotenv from "dotenv";
import os from "os";

const envFile = process.env.NODE_ENV ? `.env.${process.env.NODE_ENV}` : ".env";
dotenv.config({ path: envFile });

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

const redisUrl = `redis://${process.env.REDIS_HOST || getLocalIp()}:${process.env.REDIS_PORT || 6379}`;
console.log(`Connecting to Redis at ${redisUrl}`);

const redisClient = createClient({
  url: redisUrl,
});

redisClient
  .connect()
  .then(() => {
    console.log("Connected to Redis successfully.");
    return true;
  })
  .catch((error) => {
    console.error("Failed to connect to Redis:", error);
    return false;
  });

const isProduction = process.env.NODE_ENV === "production";

const redisStore = new RedisStore({
  client: redisClient,
  prefix: "myapp:",
});

export const sessionMiddleware = session({
  store: redisStore,
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: isProduction,
    httpOnly: isProduction,
    maxAge: 1000 * 60 * 60 * 24 * 7,
  },
});

export default redisClient;

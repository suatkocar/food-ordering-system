import { fileURLToPath } from 'url';
import path from 'path';
import dotenv from 'dotenv';
import os from 'os';

const projectRoot = process.cwd();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const envFileName = `.env.${process.env.NODE_ENV || 'development'}`;
dotenv.config({ path: path.resolve(process.cwd(), envFileName) });

const getLocalIp = () => {
  const networkInterfaces = os.networkInterfaces();
  for (const interfaceName in networkInterfaces) {
    for (const net of networkInterfaces[interfaceName]) {
      if (net.family === 'IPv4' && !net.internal) {
        return net.address;
      }
    }
  }
  return '127.0.0.1';
};

const localIp = getLocalIp();
const isProduction = process.env.NODE_ENV === 'production';
const isNetwork = process.env.NODE_ENV === 'network';

const config = {
  port: process.env.BACKEND_PORT || 8000,
  host: isProduction
    ? process.env.BACKEND_HOST || '0.0.0.0'
    : isNetwork
      ? '0.0.0.0'
      : 'localhost',
  baseUrl: isProduction
    ? process.env.BACKEND_URL
    : isNetwork
      ? `http://${localIp}:${process.env.BACKEND_PORT || 8000}`
      : `http://localhost:${process.env.BACKEND_PORT || 8000}`,
  paths: {
    images: path.join(projectRoot, 'assets/images'),
  },
  frontendUrl: isProduction
    ? process.env.FRONTEND_URL
    : isNetwork
      ? `http://${localIp}:${process.env.FRONTEND_PORT || 3001}`
      : `http://localhost:${process.env.FRONTEND_PORT || 3001}`,
  localIp: localIp,
};

export default config;

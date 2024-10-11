import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import open from 'open';
import dotenv from 'dotenv';
import os from 'os';
import axios from 'axios';
import chalk from 'chalk';
import boxen from 'boxen';
import { createServer } from 'vite';

dotenv.config({ path: `.env.${process.env.NODE_ENV}` });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

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

const waitForBackend = async (url, retries = 5, delay = 2000) => {
  for (let i = 0; i < retries; i++) {
    try {
      await axios.get(url);
      return true;
    } catch (error) {
      if (i === retries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
};

async function start() {
  const isProduction = process.env.NODE_ENV === 'production';
  const isNetwork = process.env.NODE_ENV === 'network';
  const localIp = isNetwork ? getLocalIp() : 'localhost';
  const port = process.env.VITE_API_BASE_FRONTEND_PORT || 3001;
  const backendHost = isNetwork ? localIp : process.env.VITE_API_BASE_BACKEND_HOST || 'localhost';
  const backendPort = process.env.VITE_API_BASE_BACKEND_PORT || 8000;
  const backendUrl = `http://${backendHost}:${backendPort}/api/config`;

  if (!isProduction) {
    try {
      await waitForBackend(backendUrl);
      console.log('Backend is up and running.');
    } catch (error) {
      console.error('Failed to fetch backend config:', error);
      process.exit(1);
    }

    let backendConfig;
    try {
      const response = await axios.get(backendUrl);
      backendConfig = response.data;
    } catch (error) {
      console.error('Failed to fetch backend config:', error);
      process.exit(1);
    }

    process.env.VITE_API_BASE_BACKEND_HOST = isNetwork
      ? backendConfig.backendHost
      : process.env.VITE_API_BASE_BACKEND_HOST;
    process.env.VITE_API_BASE_BACKEND_PORT = backendConfig.backendPort;
    process.env.VITE_API_BASE_URL = `http://${process.env.VITE_API_BASE_BACKEND_HOST}:${backendConfig.backendPort}/api`;
  }

  if (isProduction) {

    app.use('/food-ordering-system/assets', express.static(path.join(__dirname, 'frontend/dist/assets')));


    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });


    app.use('/assets', express.static(path.join(__dirname, 'backend/assets')));

    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
      open(`http://localhost:${port}`);
    });
  } else {
    const server = await createServer({
      configFile: path.resolve(__dirname, 'src/config/vite.config.js'),
      mode: process.env.NODE_ENV,
      server: {
        host: isNetwork ? '0.0.0.0' : '127.0.0.1',
        port: port,
        strictPort: false,
        open: false,
      },
    });

    await server.listen();

    const url = `http://${localIp}:${port}`;
    const message = chalk.blue.bold(`Frontend server is running at ${url}`);
    const boxenOptions = {
      padding: 1,
      margin: 1,
      borderStyle: 'round',
      borderColor: 'blue',
      backgroundColor: '#555555',
    };

    console.log(boxen(message, boxenOptions));

    if (!isProduction) {
      await open(url);
    }
  }
}

start();

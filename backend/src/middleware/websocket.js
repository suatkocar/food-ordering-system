import { WebSocketServer } from "ws";
import chalk from "chalk";
import WebSocket from 'ws';
import http from 'http';

let wss = null;
let serverInstance = null;

export const initializeWebSocket = (server) => {
  if (wss !== null) {
    console.log(chalk.yellow("WebSocket server already initialized."));
    return wss;
  }

  wss = new WebSocketServer({ server });
  serverInstance = server;

  const pingClients = () => {
    wss.clients.forEach((client) => {
      if (client.isAlive === false) return client.terminate();
      client.isAlive = false;
      client.ping();
    });
  };

  const interval = setInterval(pingClients, 30000);

  wss.on("connection", (socket, req) => {
    socket.isAlive = true;
    const clientAddress = req.socket.remoteAddress;
    const clientPort = req.socket.remotePort;
    const clientUrl = req.headers.origin;
    const clientUserAgent = req.headers['user-agent'];

    console.log(chalk.green(`New WebSocket connection from ${clientAddress}:${clientPort}`));
    console.log(chalk.green(`Client URL: ${clientUrl}`));
    console.log(chalk.green(`User Agent: ${clientUserAgent}`));

    socket.on("message", (message) => {
      const data = JSON.parse(message);
      if (data.type === 'ping') {
        socket.send(JSON.stringify({ type: 'pong' }));
      } else {
        console.log(chalk.blue(`Received message from ${clientAddress}:${clientPort}:`), message);
      }
    });

    socket.on("close", (code, reason) => {
      console.log(chalk.red(`WebSocket connection closed from ${clientAddress}:${clientPort}`));
      console.log(chalk.red(`Close code: ${code}, Reason: ${reason}`));
    });

    socket.on('pong', () => {
      socket.isAlive = true;
    });
  });

  wss.on("close", () => {
    clearInterval(interval);
    console.log(chalk.red("WebSocket server closed."));
    wss = null;
  });

  server.on("close", () => {
    if (wss !== null) {
      wss.close();
      wss = null;
    }
  });

  console.log(chalk.green("WebSocket server initialized."));
  return wss;
};

export const getWebSocketServer = () => {
  if (!wss) {
    throw new Error("WebSocket server is not initialized.");
  }
  return wss;
};

export const broadcast = (wss, data) => {
  try {
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(data));
      }
    });
  } catch (error) {
    console.error(chalk.red("Error broadcasting message:"), error);
    if (serverInstance && serverInstance.listening) {
      console.log(chalk.yellow("Reinitializing WebSocket server..."));
      initializeWebSocket(serverInstance);
    } else {
      console.error(chalk.red("Cannot reinitialize WebSocket server because the server instance is not running."));
    }
  }
};

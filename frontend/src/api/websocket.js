const backendHost = import.meta.env.VITE_API_BASE_BACKEND_HOST;
const backendPort = import.meta.env.VITE_API_BASE_BACKEND_PORT;
const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

let wsUrl;

if (import.meta.env.PROD) {
  const urlParts = new URL(apiBaseUrl);
  wsUrl = `wss://${urlParts.host}/food-ordering-system/socket.io/`;
} else {
  const wsProtocol = window.location.protocol === "https:" ? "wss:" : "ws:";
  wsUrl = `${wsProtocol}//${backendHost}${backendPort ? `:${backendPort}` : ''}/socket.io/`;
}

console.log('WebSocket URL:', wsUrl);

let socket;
let reconnectTimeout;
const MAX_RECONNECT_DELAY = 30000;
const INITIAL_RECONNECT_DELAY = 1000;
let reconnectDelay = INITIAL_RECONNECT_DELAY;
let connectionCheckInterval;
let pingInterval;
const MAX_RECONNECT_ATTEMPTS = 10;
let reconnectAttempts = 0;

export const setupWebSocket = (onMessage) => {
  const connect = () => {
    if (socket && socket.readyState !== WebSocket.CLOSED) return;

    console.log('Attempting to connect to WebSocket:', wsUrl);

    socket = new WebSocket(wsUrl);

    socket.onopen = () => {
      console.log("WebSocket connection established");
      reconnectDelay = INITIAL_RECONNECT_DELAY;
      reconnectAttempts = 0;
      if (reconnectTimeout) {
        clearTimeout(reconnectTimeout);
        reconnectTimeout = null;
      }
      
      startConnectionCheck();
      startPingInterval();
    };

    socket.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if (message.type === 'pong') {
        console.log("Received pong from server");
      } else {
        console.log("WebSocket message received:", message);
        onMessage(message);
      }
    };

    socket.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    socket.onclose = (event) => {
      console.log("WebSocket connection closed, attempting to reconnect...");
      console.log(`Close code: ${event.code}, Reason: ${event.reason}`);
      
      stopConnectionCheck();
      stopPingInterval();
      
      reconnect();
    };
  };

  const reconnect = () => {
    if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
      console.error("Max reconnection attempts reached. Please refresh the page.");
      return;
    }

    reconnectTimeout = setTimeout(() => {
      connect();
      reconnectAttempts++;
      reconnectDelay = Math.min(reconnectDelay * 2, MAX_RECONNECT_DELAY);
    }, reconnectDelay);
  };

  const checkConnection = () => {
    if (socket.readyState === WebSocket.CLOSED) {
      console.log("Connection lost, attempting to reconnect...");
      reconnect();
    }
  };

  const startConnectionCheck = () => {
    if (!connectionCheckInterval) {
      connectionCheckInterval = setInterval(checkConnection, 5000);
    }
  };

  const stopConnectionCheck = () => {
    if (connectionCheckInterval) {
      clearInterval(connectionCheckInterval);
      connectionCheckInterval = null;
    }
  };

  const startPingInterval = () => {
    if (!pingInterval) {
      pingInterval = setInterval(() => {
        if (socket.readyState === WebSocket.OPEN) {
          socket.send(JSON.stringify({ type: 'ping' }));
        }
      }, 30000);
    }
  };

  const stopPingInterval = () => {
    if (pingInterval) {
      clearInterval(pingInterval);
      pingInterval = null;
    }
  };

  connect();
  return socket;
};

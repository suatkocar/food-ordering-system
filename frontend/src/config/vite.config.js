import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import os from 'os';

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

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_');
  const isProduction = mode === 'production';
  const isNetwork = mode === 'network';

  const backendHost = isNetwork
    ? getLocalIp()
    : env.VITE_API_BASE_BACKEND_HOST || 'localhost';
  const backendPort = env.VITE_API_BASE_BACKEND_PORT || 8000;
  const baseUrl = isProduction
    ? env.VITE_API_BASE_URL
    : `http://${backendHost}:${backendPort}/api`;

  return {
    base: isProduction ? '/food-ordering-system/' : '/',
    plugins: [react()],
    server: {
      host: isNetwork ? '0.0.0.0' : 'localhost',
      port: parseInt(env.VITE_API_BASE_FRONTEND_PORT) || 3001,
      strictPort: false,
      open: true,
    },
    build: {
      outDir: 'dist',
      sourcemap: false,
      chunkSizeWarningLimit: 2000,
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules')) {
              return 'vendor';
            }
            if (id.includes('src/redux')) {
              return 'redux';
            }
            if (id.includes('src/components')) {
              return 'components';
            }
          },
        },
      },
    },
    resolve: {
      alias: {
        '@': '/src',
      },
    },
    publicDir: 'public',
    define: {
      'import.meta.env.VITE_API_BASE_URL': JSON.stringify(baseUrl),
    },
  };
});

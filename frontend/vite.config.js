import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load .env files
  const env = loadEnv(mode, process.cwd(), '');

  // For Vercel, don't use proxy in production
  const VITE_API_BASE_URL = process.env.VITE_API_BASE_URL || env.VITE_API_BASE_URL;
  
  return {
    plugins: [react()],
    server: {
      port: 5173,
      // Only use proxy during development
      proxy: mode === 'development' ? {
        '/api': {
          target: VITE_API_BASE_URL,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ''),
        },
      } : undefined,
    },
    define: {
      // Make API URL available to client code
      'process.env.VITE_API_BASE_URL': JSON.stringify(VITE_API_BASE_URL),
    },
  };
});
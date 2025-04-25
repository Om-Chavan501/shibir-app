import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load .env files locally
  const env = loadEnv(mode, process.cwd(), '');

  // Use Netlify environment variable if available, otherwise fallback to .env
  // const VITE_API_BASE_URL = "https://shibir-app.onrender.com";
  const VITE_API_BASE_URL = process.env.VITE_API_BASE_URL || env.VITE_API_BASE_URL;
  
  return {
    plugins: [react()],
    server: {
      port: 5173,
      proxy: {
        '/api': {
          target: VITE_API_BASE_URL,
          changeOrigin: true,
        },
      },
    },
    define: {
      // Optionally expose the env var to client code if needed
      'process.env.VITE_API_BASE_URL': JSON.stringify(VITE_API_BASE_URL),
    },
  };
});

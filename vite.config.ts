import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3001,
        host: '0.0.0.0',
        proxy: {
          '/api': {
            target: 'http://localhost:3000', // Your backend URL
            changeOrigin: true,
            secure: false,
          }
        }
      },
      plugins: [react()],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.REACT_APP_BACKEND_URL': JSON.stringify(env.REACT_APP_BACKEND_URL),
        'process.env.REACT_APP_LINE_LOGIN_CHANNEL_ID': JSON.stringify(env.REACT_APP_LINE_LOGIN_CHANNEL_ID)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});

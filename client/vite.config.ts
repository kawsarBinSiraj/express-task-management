import path from 'node:path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig(({ mode }) => {
  // Load root .env so VITE_PORT and PORT are available here
  const env = loadEnv(mode, path.resolve(__dirname, '..'), '');

  const clientPort = parseInt(env.VITE_PORT ?? '5173', 10);
  const serverPort = parseInt(env.PORT ?? '5000', 10);

  return {
    root: path.resolve(__dirname),
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      host: '0.0.0.0',
      port: clientPort,
      strictPort: true,
      cors: true,
      proxy: {
        '/api': {
          target: `http://localhost:${serverPort}`,
          changeOrigin: true,
        },
      },
    },
    build: {
      outDir: path.resolve(__dirname, '../dist/public'),
      emptyOutDir: true,
      manifest: true,
    },
  };
});

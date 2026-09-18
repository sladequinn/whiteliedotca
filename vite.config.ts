import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, loadEnv, Plugin} from 'vite';
import {createApiApp} from './server/app';

function apiMiddlewarePlugin(): Plugin {
  return {
    name: 'api-backend-middleware',
    configureServer(server) {
      const apiApp = createApiApp();
      server.middlewares.use(apiApp);
    },
    configurePreviewServer(server) {
      const apiApp = createApiApp();
      server.middlewares.use(apiApp);
    },
  };
}

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, '.', '');
  return {
    plugins: [react(), tailwindcss(), apiMiddlewarePlugin()],
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
    },
  };
});


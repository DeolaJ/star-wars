import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    open: true,
  },
  build: {
    rollupOptions: {
      // redux-logger is CommonJS, so Rollup keeps it even though the store only
      // uses it in development. It has no side effects, so let it be dropped.
      treeshake: {
        moduleSideEffects: (id) => !id.includes('/node_modules/redux-logger/'),
      },
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test/setup.js',
  },
});

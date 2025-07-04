import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: ['lucide-react'],
  },
  resolve: {
    dedupe: ['react', 'react-dom', 'lucide-react']
  },
  build: {
    commonjsOptions: {
      include: [/lucide-react/, /node_modules/],
    },
  },
});
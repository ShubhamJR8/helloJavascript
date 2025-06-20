import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  base: process.env.NODE_ENV === 'production' ? '/' : '/', // Ensure consistent base URL
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    // Ensure proper handling of dynamic imports
    rollupOptions: {
      output: {
        manualChunks: undefined,
        // Ensure assets are referenced correctly
        assetFileNames: 'assets/[name]-[hash][extname]',
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
      },
    },
    // Generate source maps for better debugging
    sourcemap: true,
  },
  server: {
    port: 3000,
    // Enable CORS for development
    cors: true,
  },
  // Ensure proper handling of environment variables
  define: {
    'process.env': process.env
  }
})

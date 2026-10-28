import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    // in dev, send /api calls to the backend so we don't need full URLs or CORS
    proxy: {
      '/api': 'http://localhost:6789',
    },
  },
})

import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// This Tailwind plugin allows us to use the Tailwind classes in our code.
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
})

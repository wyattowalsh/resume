import react from '@vitejs/plugin-react'
import vike from 'vike/plugin'
import vercel from 'vike-vercel'
import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig({
  plugins: [react(), vike(), tailwindcss(), vercel()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@assets': path.resolve(__dirname, './assets'),
    },
  },
  ssr: {
    noExternal: ['react-helmet-async'],
  },
}); 
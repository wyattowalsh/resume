import react from '@vitejs/plugin-react'
import vike from 'vike/plugin'
import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig({
  plugins: [react(), vike(), tailwindcss()],
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
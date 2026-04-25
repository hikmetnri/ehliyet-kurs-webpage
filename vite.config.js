import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import fs from 'fs'
import path from 'path'

// Custom plugin to copy .htaccess to dist after build (required for cPanel/Apache SPA routing)
const copyHtaccess = () => ({
  name: 'copy-htaccess',
  closeBundle() {
    const src = path.resolve(__dirname, 'public/.htaccess')
    const dest = path.resolve(__dirname, 'dist/.htaccess')
    if (fs.existsSync(src)) {
      fs.copyFileSync(src, dest)
      console.log('✓ .htaccess copied to dist/')
    }
  }
})

export default defineConfig({
  plugins: [react(), tailwindcss(), copyHtaccess()],
  base: './',
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
      }
    }
  }
})

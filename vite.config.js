import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import fs from 'fs'
import path from 'path'

// Custom plugin to copy static files to dist after build (required for cPanel/Apache SPA routing/assets)
const copyStaticFiles = () => ({
  name: 'copy-static-files',
  closeBundle() {
    const htaccessSrc = path.resolve(__dirname, 'public/.htaccess')
    const htaccessDest = path.resolve(__dirname, 'dist/.htaccess')
    if (fs.existsSync(htaccessSrc)) {
      fs.copyFileSync(htaccessSrc, htaccessDest)
      console.log('✓ .htaccess copied to dist/')
    }

    const signsSrc = path.resolve(__dirname, 'public/images/signs')
    const signsDest = path.resolve(__dirname, 'dist/images/signs')
    if (fs.existsSync(signsSrc)) {
      fs.rmSync(signsDest, { recursive: true, force: true })
      fs.mkdirSync(path.dirname(signsDest), { recursive: true })
      fs.cpSync(signsSrc, signsDest, { recursive: true })
      console.log('✓ traffic signs copied to dist/')
    }
  }
})

export default defineConfig({
  plugins: [react(), tailwindcss(), copyStaticFiles()],
  base: './',
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
      },
      '/images': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
      },
      '/signs': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
      },
      '/content': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
      },
      '/uploads': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
      },
    }
  }
})

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
// Custom plugin to copy Apache SPA routing config to dist after build.
const copyStaticFiles = () => ({
  name: 'copy-static-files',
  closeBundle() {
    const htaccessSrc = path.resolve(__dirname, 'public/.htaccess')
    const htaccessDest = path.resolve(__dirname, 'dist/.htaccess')
    if (fs.existsSync(htaccessSrc)) {
      fs.copyFileSync(htaccessSrc, htaccessDest)
      console.log('✓ .htaccess copied to dist/')
    }

    const remoteMediaDirs = [
      path.resolve(__dirname, 'dist/images/signs'),
      path.resolve(__dirname, 'dist/content'),
    ]
    remoteMediaDirs.forEach((dir) => {
      fs.rmSync(dir, { recursive: true, force: true })
    })
    console.log('✓ remote media folders excluded from dist/')
  }
})

export default defineConfig({
  plugins: [react(), tailwindcss(), copyStaticFiles()],
  base: './',
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (
              id.includes('react') ||
              id.includes('react-dom') ||
              id.includes('react-router') ||
              id.includes('zustand') ||
              id.includes('axios')
            ) {
              return 'vendor-core';
            }
            if (id.includes('recharts') || id.includes('d3')) {
              return 'vendor-charts';
            }
            if (id.includes('firebase')) {
              return 'vendor-firebase';
            }
            if (id.includes('lucide-react')) {
              return 'vendor-icons';
            }
            if (
              id.includes('react-markdown') ||
              id.includes('remark') ||
              id.includes('rehype') ||
              id.includes('micromark') ||
              id.includes('unist') ||
              id.includes('vfile') ||
              id.includes('mdast') ||
              id.includes('parse5') ||
              id.includes('property-information') ||
              id.includes('space-separated-tokens') ||
              id.includes('comma-separated-tokens') ||
              id.includes('decode-named-character-reference')
            ) {
              return 'vendor-markdown';
            }
            if (id.includes('framer-motion')) {
              return 'vendor-motion';
            }
          }
        }
      }
    }
  },
  server: {
    host: '127.0.0.1',
    port: 5173,
    strictPort: true,
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
      '/uploads': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
      },
    }
  }
})

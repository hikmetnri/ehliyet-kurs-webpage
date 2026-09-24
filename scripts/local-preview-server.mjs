// Yerel ölçüm için basit sunucu: dist'i servis eder + /api'yi yerel backend'e
// (localhost:3000) proxy'ler. Böylece uygulama canlı ortamdaki gibi açılır.
// Kullanım: node scripts/local-preview-server.mjs [port]
import http from 'node:http'
import fs from 'node:fs'
import path from 'node:path'
import zlib from 'node:zlib'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const dist = path.resolve(__dirname, '..', 'dist')
const port = Number(process.argv[2] || 4173)

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.webp': 'image/webp',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml',
}

const compressible = (ext) => ['.html', '.js', '.css', '.json', '.svg', '.txt', '.xml'].includes(ext)

const server = http.createServer((req, res) => {
  if (req.url.startsWith('/api')) {
    // Backend POST isteklerinde Origin kontrolü yapıyor (CSRF koruması).
    // Tarayıcı same-origin POST'ta Origin: http://127.0.0.1:4173 gönderir ve
    // backend bunu reddeder (403); yerel önizlemede Origin/Host'u kendi
    // adresine çeviriyoruz (canlıda web ↔ api farklı origin olduğu için sorun yok).
    const headers = { ...req.headers, host: '127.0.0.1:3000', origin: 'http://127.0.0.1:3000' }
    delete headers.referer
    const proxy = http.request(
      { hostname: '127.0.0.1', port: 3000, path: req.url, method: req.method, headers },
      (upstream) => {
        console.log(`[proxy] ${req.method} ${req.url} → ${upstream.statusCode}`)
        res.writeHead(upstream.statusCode || 502, upstream.headers)
        upstream.pipe(res)
      },
    )
    proxy.on('error', () => { res.writeHead(502, { 'content-type': 'application/json' }); res.end('{"error":"backend yok"}') })
    req.pipe(proxy)
    return
  }

  const urlPath = decodeURIComponent(req.url.split('?')[0])
  let filePath = path.join(dist, urlPath === '/' ? 'index.html' : urlPath)
  if (!path.extname(filePath) || !fs.existsSync(filePath)) {
    // SPA fallback + uzantısız yollar
    filePath = path.join(dist, 'index.html')
  }
  try {
    let data = fs.readFileSync(filePath)
    const ext = path.extname(filePath)
    const headers = { 'content-type': MIME[ext] || 'application/octet-stream' }
    if (compressible(ext) && /\bgzip\b/.test(req.headers['accept-encoding'] || '')) {
      data = zlib.gzipSync(data)
      headers['content-encoding'] = 'gzip'
    }
    headers['content-length'] = data.length
    res.writeHead(200, headers)
    res.end(data)
  } catch {
    res.writeHead(404); res.end('not found')
  }
})

server.listen(port, '127.0.0.1', () => {
  console.log(`✓ local preview: http://127.0.0.1:${port} (dist + /api → :3000)`)
})

// Build sonrası çalışır: landingsayfasını statik HTML olarak dist/index.html'e gömer.
// Böylece mobildeki ilk boyama (FCP/LCP) React paketi inmeden gerçekleşir.
// Çalıştırma: vite build && node scripts/prerender.mjs
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { createServer } from 'vite'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')
const htmlPath = path.join(root, 'dist', 'index.html')

// Node 25'in deneysel localStorage/sessionStorage global'i eksik metodlarla
// geliyor (session.js modül başlangıcında kullanıyor). Tarayıcı benzeri güvenli
// stub'larla değiştir.
const createStorageStub = () => {
  const map = new Map()
  return {
    getItem: (key) => (map.has(key) ? map.get(key) : null),
    setItem: (key, value) => { map.set(key, String(value)) },
    removeItem: (key) => { map.delete(key) },
    clear: () => map.clear(),
    key: (index) => Array.from(map.keys())[index] ?? null,
    get length() { return map.size },
  }
}
for (const name of ['localStorage', 'sessionStorage']) {
  Object.defineProperty(globalThis, name, {
    value: createStorageStub(),
    configurable: true,
    writable: true,
  })
}

if (!fs.existsSync(htmlPath)) {
  console.error('✗ dist/index.html bulunamadı; önce vite build çalıştır.')
  process.exit(1)
}

const vite = await createServer({
  root,
  logLevel: 'error',
  server: { middlewareMode: true },
  appType: 'custom',
})

try {
  const { renderLanding } = await vite.ssrLoadModule('/src/entry-prerender.jsx')
  const markup = renderLanding()
  const html = fs.readFileSync(htmlPath, 'utf8')
  // İdempotent: hem boş root hem de daha önce ön-render edilmiş içerik desteklenir.
  const emptyRe = /<div id="root">\s*<\/div>/
  const filledRe = /<div id="root">[\s\S]*?<\/div>\s*(<script type="module")/
  if (emptyRe.test(html)) {
    fs.writeFileSync(htmlPath, html.replace(emptyRe, `<div id="root">${markup}</div>`))
  } else if (filledRe.test(html)) {
    fs.writeFileSync(htmlPath, html.replace(filledRe, `<div id="root">${markup}</div>\n    $1`))
  } else {
    console.error('✗ index.html içinde <div id="root"> bulunamadı.')
    process.exit(1)
  }
  console.log(`✓ Landing ön-render edildi (${markup.length} karakter) → dist/index.html`)
} finally {
  await vite.close()
}

// Vite sunucusu bazı ortamlarda kapanışta açık handle bırakabiliyor;
// build adımının askıda kalmaması için açık çıkış.
process.exit(0)

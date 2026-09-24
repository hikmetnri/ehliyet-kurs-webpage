import { StrictMode } from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import './index.css'
import './styles/flutter-mobile.css'
import App from './App.jsx'

const container = document.getElementById('root')
const app = (
  <StrictMode>
    <App />
  </StrictMode>
)

// Ön-render yalnızca "/" için yapıldı. Derin link'te (örn. /login) prerender
// edilen landing HTML'i ile istemci render'ı eşleşmeyeceği için oralarda
// doğrudan createRoot kullan; root'ta ise hydrate et (LCP korunur, boş kare olmaz).
const isPrerenderedRoute = window.location.pathname === '/' || window.location.pathname === ''

if (container.firstElementChild && isPrerenderedRoute) {
  hydrateRoot(container, app)
} else {
  createRoot(container).render(app)
}

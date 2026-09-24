// Build sırasında landing sayfasını statik HTML'e çevirmek için kullanılır.
// Amaç: mobilde ilk boyama (FCP) ve LCP'nin React paketini beklemeden
// gerçekleşmesi — PageSpeed mobil hedefi için kritik. İstemci tarafı bu HTML'i
// main.jsx içindeki hydrateRoot ile devralır; createRoot ile yeniden çizilmez
// (aksi halde prerender kazancı sıfırlanır ve ekranda boş kare oluşur).
import { renderToString } from 'react-dom/server'
import { StaticRouter } from 'react-router'
import { AppRoutes } from './App'

export function renderLanding() {
  return renderToString(
    <StaticRouter location="/">
      <AppRoutes />
    </StaticRouter>,
  )
}

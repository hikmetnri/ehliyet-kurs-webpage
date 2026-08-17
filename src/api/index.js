import axios from 'axios'
import useAuthStore from '../store/authStore'

const api = axios.create({
  // Üretim ortamında doğrudan api subdomainine gitmesi için güncellendi
  baseURL: import.meta.env.VITE_API_URL || 'https://api.ehliyetyolu.com/api',
  timeout: 10000,
  withCredentials: true,  // ✅ HttpOnly cookie'leri otomatik gönder
})

const getToken = () => {
  // ✅ Sadece sessionStorage'dan token al (backup olarak)
  // localStorage'dan token silmeye devam et (eski cache temizle)
  localStorage.removeItem('token')
  return sessionStorage.getItem('token')
}

const isGuestToken = (token) => typeof token === 'string' && token.startsWith('guest-')

const getCsrfToken = () => {
  const storedToken = sessionStorage.getItem('csrf-token')
  if (storedToken) return storedToken

  // CSRF token cookie'den al
  const name = 'csrf-token'
  const value = `; ${document.cookie}`
  const parts = value.split(`; ${name}=`)
  if (parts.length === 2) return parts.pop().split(';').shift()
  return null
}

const shouldRedirectToLogin = () => {
  const path = window.location.pathname
  return path === '/settings' || path.startsWith('/dashboard') || path.startsWith('/admin')
}

// Request interceptor — JWT token + CSRF token ekle
api.interceptors.request.use(
  (config) => {
    const token = getToken()
    // Misafir kimliği backend tarafından imzalanmış bir JWT değildir.
    // Authorization başlığına eklenirse korumalı endpoint'ler 401 döndürür.
    if (token && !isGuestToken(token)) {
      config.headers.Authorization = `Bearer ${token}`
    }

    // 🛡️ CSRF Token ekle (POST/PUT/DELETE işlemleri için)
    if (['post', 'put', 'delete', 'patch'].includes(config.method?.toLowerCase())) {
      const csrfToken = getCsrfToken()
      if (csrfToken) {
        config.headers['x-csrf-token'] = csrfToken
      }
    }

    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor — 401 → logout
api.interceptors.response.use(
  (response) => {
    const csrfToken = response.data?._csrf
    if (csrfToken) sessionStorage.setItem('csrf-token', csrfToken)
    return response
  },
  (error) => {
    const suspended = error.response?.status === 403 &&
      String(error.response?.data?.error || error.response?.data?.message || '').includes('askıya')

    const hadAuthHeader = error.config?.headers?.Authorization || error.config?.headers?.authorization
    const isGuestSession = Boolean(useAuthStore.getState().user?.isGuest)

    if ((error.response?.status === 401 || suspended) && hadAuthHeader && !isGuestSession) {
      sessionStorage.removeItem('token')
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      localStorage.removeItem('last_visited_id')
      localStorage.removeItem('last_visited_name')
      localStorage.removeItem('last_visited_icon')
      localStorage.removeItem('last_visited_type')
      localStorage.removeItem('last_visited_ts')
      // Zustand store'u da sıfırla — sayfa yönlendirmesinden önce state temiz olsun
      try { useAuthStore.getState().logout() } catch { /* store henüz init olmadıysa yoksay */ }
      if (shouldRedirectToLogin() && window.location.pathname !== '/login') {
         window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

export default api

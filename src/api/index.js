import axios from 'axios'

const api = axios.create({
  // Üretim ortamında doğrudan api subdomainine gitmesi için güncellendi
  baseURL: import.meta.env.VITE_API_URL || 'https://api.ehliyetyolu.com/api',
  timeout: 10000,
})

const getToken = () => {
  localStorage.removeItem('token')
  return sessionStorage.getItem('token')
}

// Request interceptor — JWT token ekle
api.interceptors.request.use(
  (config) => {
    const token = getToken()
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor — 401 → logout
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const suspended = error.response?.status === 403 &&
      String(error.response?.data?.error || error.response?.data?.message || '').includes('askıya')

    if (error.response?.status === 401 || suspended) {
      sessionStorage.removeItem('token')
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      localStorage.removeItem('last_visited_id')
      localStorage.removeItem('last_visited_name')
      localStorage.removeItem('last_visited_icon')
      localStorage.removeItem('last_visited_type')
      localStorage.removeItem('last_visited_ts')
      if (window.location.pathname !== '/login') {
         window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

export default api

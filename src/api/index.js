import axios from 'axios'
import useAuthStore from '../store/authStore'
import { getAccessToken, setAccessToken, getSessionGeneration, clearAccessToken } from './session'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://api.ehliyetyolu.com/api',
  timeout: 15000,
  withCredentials: true,
})
const credentialPaths = new Set(['/auth/login', '/auth/register', '/auth/google', '/auth/forgot-password', '/auth/refresh-token', '/auth/logout'])
let csrfToken = null
let refreshing = null
let bootstrapping = null

api.interceptors.request.use(config => {
  if (['/auth/login', '/auth/register', '/auth/google'].includes(config.url)) clearAccessToken()
  config.authGeneration ??= getSessionGeneration()
  const token = getAccessToken()
  if (token && !credentialPaths.has(config.url)) config.headers.Authorization = `Bearer ${token}`
  if (['post', 'put', 'delete', 'patch'].includes(config.method?.toLowerCase()) && csrfToken) {
    config.headers['x-csrf-token'] = csrfToken
  }
  if (['/auth/login', '/auth/register', '/auth/google', '/auth/session', '/auth/refresh-token'].includes(config.url)) {
    config.data = { ...config.data, sessionTransport: 'cookie' }
  }
  return config
})

export const refreshSession = () => {
  if (!refreshing) {
    const generation = getSessionGeneration()
    const run = async () => {
      // Obtain the current CSRF cookie after acquiring the cross-tab lock.
      await api.get('/auth/csrf')
      const { data } = await api.post('/auth/refresh-token')
      if (generation !== getSessionGeneration()) throw new axios.CanceledError('Oturum kapatıldı')
      setAccessToken(data.token)
      useAuthStore.setState({ token: data.token })
    }
    // Multiple tabs share one rotating cookie; serialize their refreshes too.
    refreshing = (navigator.locks ? navigator.locks.request('ehliyet-auth-refresh', run) : run())
      .finally(() => { refreshing = null })
  }
  return refreshing
}

export const revokeSession = async () => {
  try { await refreshing } catch { /* still try to revoke the session */ }
  const run = async () => {
    await api.get('/auth/csrf')
    await api.post('/auth/logout', {}, { headers: getAccessToken() ? { Authorization: `Bearer ${getAccessToken()}` } : {} })
  }
  return navigator.locks ? navigator.locks.request('ehliyet-auth-refresh', run) : run()
}

api.interceptors.response.use(response => {
  if (response.data?._csrf) csrfToken = response.data._csrf
  return response
}, async error => {
  const config = error.config
  const suspended = error.response?.data?.code === 'ACCOUNT_SUSPENDED'
  if (!config || credentialPaths.has(config.url) || config.authGeneration !== getSessionGeneration()) return Promise.reject(error)
  if ((error.response?.status === 401 || suspended) && getAccessToken()) {
    if (!suspended && !config.authRetried) {
      config.authRetried = true
      try {
        if (config.headers.Authorization === `Bearer ${getAccessToken()}`) await refreshSession()
        if (config.authGeneration !== getSessionGeneration()) throw new axios.CanceledError('Oturum kapatıldı')
        return api(config)
      } catch (refreshError) {
        if (refreshError.response?.status !== 401) return Promise.reject(refreshError)
      }
    }
    useAuthStore.getState().clearSession()
  }
  return Promise.reject(error)
})

// UI callers may log Axios errors. Remove request bodies, credentials and transport objects
// after retry handling, so diagnostics cannot expose passwords or Authorization headers.
api.interceptors.response.use(undefined, error => {
  const status = error.response?.status
  const config = { method: error.config?.method, url: String(error.config?.url || '').split('?')[0].replace(/(reset-password\/)[^/]+/, '$1[redacted]') }
  const response = error.response ? { status, data: error.response.data, headers: {}, config } : undefined
  const safe = new axios.AxiosError(status ? `İstek tamamlanamadı (${status})` : 'Sunucuya ulaşılamadı', error.code, config, undefined, response)
  if (axios.isCancel(error)) safe.__CANCEL__ = true
  return Promise.reject(safe)
})

export const bootstrapSession = () => {
  if (bootstrapping) return bootstrapping
  useAuthStore.setState({ initialized: false, startupError: null })
  const generation = getSessionGeneration()
  bootstrapping = (async () => {
    try {
      if (!getAccessToken()) await refreshSession()
      const { data } = await api.get('/auth/me')
      // Only legacy JWTs (without sid) are eligible for the one-time upgrade.
      let legacy = false
      try { legacy = !JSON.parse(atob(getAccessToken().split('.')[1])).sid } catch { /* server verified above */ }
      if (legacy) {
        const upgrade = await api.post('/auth/session')
        setAccessToken(upgrade.data.token)
      }
      if (generation !== getSessionGeneration()) return
      useAuthStore.getState().setAuth(data.user, getAccessToken())
      useAuthStore.setState({ initialized: true })
    } catch (error) {
      if ([401, 403].includes(error.response?.status)) {
        useAuthStore.getState().clearSession()
        useAuthStore.setState({ initialized: true })
      } else {
        useAuthStore.setState({ startupError: 'Oturum doğrulanamadı. Bağlantınızı kontrol edip tekrar deneyin.' })
      }
    }
  })().finally(() => { bootstrapping = null })
  return bootstrapping
}

export default api

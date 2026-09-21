import { queueOperation, flushOperations } from '../services/resultOutbox'
import { TEST_TYPES } from '../constants/testTypes'
import { create } from 'zustand'
import { signOut } from 'firebase/auth'
import { auth } from '../config/firebase'
import { registerWebPushToken } from '../services/webPushService'
import api, { revokeSession } from '../api'
import { setAccessToken, clearAccessToken, getSessionGeneration } from '../api/session'

const clearCategorySession = () => {
  localStorage.removeItem('last_visited_id')
  localStorage.removeItem('last_visited_name')
  localStorage.removeItem('last_visited_icon')
  localStorage.removeItem('last_visited_type')
  localStorage.removeItem('last_visited_ts')
}

const syncCategorySession = (user) => {
  if (!user?.selectedCategoryId) {
    clearCategorySession()
  }
}

const registerPushAfterAuth = () => {
  registerWebPushToken().catch((error) => {
    console.info('Web push token kaydedilemedi:', error?.message || error)
  })
}

const syncGuestData = async (user) => {
  const owner = String(user?._id || user?.id || '')
  const generation = getSessionGeneration()
  try {
    for (const key of ['guest_saved_results', 'guest_wrong_answers']) {
      const rows = JSON.parse(localStorage.getItem(key) || '[]').map(row => ({ ...row, _ownerId: row._ownerId || owner, operationId: row.operationId || crypto.randomUUID() }))
      localStorage.setItem(key, JSON.stringify(rows))
      for (const row of rows) {
        if (generation !== getSessionGeneration()) return
        if (row._ownerId !== owner) continue
        const result = key === 'guest_saved_results'
        queueOperation(owner, result ? '/exam-results' : '/wrong-answers/bulk', result ? row : {
          operationId: row.operationId, wrongQuestions: [row], correctQuestionIds: [], testType: row.testType || TEST_TYPES.SHORT_TEST, categoryId: row.categoryId || '',
        })
        const current = JSON.parse(localStorage.getItem(key) || '[]')
        localStorage.setItem(key, JSON.stringify(current.filter(item => item.operationId !== row.operationId)))
      }
    }
    await flushOperations(owner)
  } catch { console.warn('Misafir verileri cihazda korunuyor; aktarım tekrar denenecek.') }
}

const useAuthStore = create((set) => ({
  user: null,
  token: null,
  initialized: false,
  startupError: null,
  logoutError: null,
  loading: false,
  error: null,

  setAuth: (user, token) => {
    localStorage.removeItem('user')
    setAccessToken(token)
    localStorage.removeItem('token')
    syncCategorySession(user)
    registerPushAfterAuth()
    if (user && !user.isGuest) {
      syncGuestData(user)
    }
    set({ user, token, error: null })
  },

  setUser: (user) => {
    localStorage.removeItem('user')
    syncCategorySession(user)
    set({ user })
  },

  setLoading: (loading) => set({ loading }),

  setError: (error) => set({ error }),

  logout: async () => {
    if (!useAuthStore.getState().user?.isGuest) {
      try { await revokeSession() } catch {
        set({ logoutError: 'Çıkış tamamlanamadı. Bağlantınızı kontrol edip tekrar deneyin.' })
        return false
      }
    }
    try { await signOut(auth) } catch { /* Local application session is still cleared. */ }
    useAuthStore.getState().clearSession()
    if (typeof BroadcastChannel !== 'undefined') {
      const channel = new BroadcastChannel('ehliyet-auth')
      channel.postMessage('logout')
      channel.close()
    }
    return true
  },

  clearSession: () => {
    clearAccessToken()
    sessionStorage.removeItem('token')
    sessionStorage.removeItem('web_push_token_key')
    sessionStorage.removeItem('csrf-token')
    sessionStorage.removeItem('ehliyet_yolu_ai_chat')
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    localStorage.removeItem('guest_solved_test_count')
    localStorage.removeItem('guest_wrong_answers')
    localStorage.removeItem('guest_saved_results')
    localStorage.removeItem('guest_ai_credits')
    clearCategorySession()
    
    // Reset theme attributes when logging out
    if (typeof document !== 'undefined') {
      document.documentElement.removeAttribute('data-theme')
      const currentMode = localStorage.getItem('theme-mode') || 'dark'
      document.documentElement.setAttribute('data-theme-mode', currentMode)
    }

    set({ user: null, token: null, error: null, logoutError: null })
  },

  startGuestMode: (categoryId = null, categoryName = null) => {
    // ✅ Güvenli guest mode - random token
    const guestUser = {
      role: 'user',
      isGuest: true,
      selectedCategoryId: categoryId,
      selectedCategoryName: categoryName
    }
    // Guest token olarak basit string kullanmak yerine unique identifier oluştur
    // Produksiyonda bu backend'den gelmeli, şimdilik client-side token
    const guestToken = `guest-${Math.random().toString(36).substr(2, 20)}`
    clearAccessToken()
    localStorage.removeItem('user')
    set({ user: guestUser, token: guestToken, error: null })
  },

  isAdmin: () => {
    const state = useAuthStore.getState()
    return state.user?.role === 'admin'
  },

  isAuthenticated: () => {
    const state = useAuthStore.getState()
    return !!state.token && !!state.user && !state.user.isGuest
  },
}))

if (typeof BroadcastChannel !== 'undefined') {
  const channel = new BroadcastChannel('ehliyet-auth')
  channel.onmessage = event => { if (event.data === 'logout') useAuthStore.getState().clearSession() }
}

export default useAuthStore

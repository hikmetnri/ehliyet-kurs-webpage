import { create } from 'zustand'
import { registerWebPushToken } from '../services/webPushService'
import api from '../api'

const getStoredUser = () => {
  try {
    const u = localStorage.getItem('user')
    return u ? JSON.parse(u) : null
  } catch {
    return null
  }
}

const getStoredToken = () => {
  localStorage.removeItem('token')
  const token = sessionStorage.getItem('token')
  return token || null
}

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

const syncGuestData = async () => {
  try {
    const guestResults = localStorage.getItem('guest_saved_results')
    const guestWrong = localStorage.getItem('guest_wrong_answers')

    if (guestResults) {
      const results = JSON.parse(guestResults)
      for (const resPayload of results) {
        await api.post('/exam-results', resPayload).catch(e => console.warn('Sync exam result failed:', e))
      }
      localStorage.removeItem('guest_saved_results')
    }

    if (guestWrong) {
      const wrong = JSON.parse(guestWrong)
      const wrongPayload = {
        wrongQuestions: wrong,
        correctQuestionIds: [],
        categoryId: null,
        categoryName: '',
        testType: 'short_test',
      }
      await api.post('/wrong-answers/bulk', wrongPayload).catch(e => console.warn('Sync wrong answers failed:', e))
      localStorage.removeItem('guest_wrong_answers')
    }

    localStorage.removeItem('guest_solved_test_count')
    localStorage.removeItem('guest_ai_credits')
  } catch (err) {
    console.error('Error syncing guest data:', err)
  }
}

const useAuthStore = create((set) => ({
  user: getStoredUser(),
  token: getStoredToken(),
  loading: false,
  error: null,

  setAuth: (user, token) => {
    localStorage.setItem('user', JSON.stringify(user))
    sessionStorage.setItem('token', token)
    localStorage.removeItem('token')
    syncCategorySession(user)
    registerPushAfterAuth()
    if (user && !user.isGuest) {
      syncGuestData()
    }
    set({ user, token, error: null })
  },

  setUser: (user) => {
    localStorage.setItem('user', JSON.stringify(user))
    syncCategorySession(user)
    set({ user })
  },

  setLoading: (loading) => set({ loading }),

  setError: (error) => set({ error }),

  logout: () => {
    sessionStorage.removeItem('token')
    sessionStorage.removeItem('web_push_token_key')
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    localStorage.removeItem('guest_solved_test_count')
    localStorage.removeItem('guest_wrong_answers')
    localStorage.removeItem('guest_saved_results')
    localStorage.removeItem('guest_ai_credits')
    clearCategorySession()
    set({ user: null, token: null, error: null })
  },

  startGuestMode: (categoryId = null, categoryName = null) => {
    const guestUser = {
      role: 'user',
      isGuest: true,
      selectedCategoryId: categoryId,
      selectedCategoryName: categoryName
    }
    const guestToken = 'guest-token'
    localStorage.setItem('user', JSON.stringify(guestUser))
    sessionStorage.setItem('token', guestToken)
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

export default useAuthStore

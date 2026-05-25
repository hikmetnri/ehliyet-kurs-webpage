import { create } from 'zustand'

const getStoredUser = () => {
  try {
    const u = localStorage.getItem('user')
    return u ? JSON.parse(u) : null
  } catch {
    return null
  }
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

const useAuthStore = create((set) => ({
  user: getStoredUser(),
  token: localStorage.getItem('token') || null,
  loading: false,
  error: null,

  setAuth: (user, token) => {
    localStorage.setItem('user', JSON.stringify(user))
    localStorage.setItem('token', token)
    syncCategorySession(user)
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
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    clearCategorySession()
    set({ user: null, token: null, error: null })
  },

  isAdmin: () => {
    const state = useAuthStore.getState()
    return state.user?.role === 'admin'
  },

  isAuthenticated: () => {
    const state = useAuthStore.getState()
    return !!state.token && !!state.user
  },
}))

export default useAuthStore

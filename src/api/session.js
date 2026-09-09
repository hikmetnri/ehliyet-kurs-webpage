// Access tokens stay in memory. Only the server can read the refresh cookie.
let token = sessionStorage.getItem('token') || null
if (token?.startsWith('guest-')) token = null
sessionStorage.removeItem('token')
localStorage.removeItem('token')
let generation = 0
export const getAccessToken = () => token
export const getSessionGeneration = () => generation
export const setAccessToken = value => { token = value }
export const clearAccessToken = () => { token = null; generation++ }

import axios from 'axios'

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
  withCredentials: true, // send httpOnly cookies
  timeout: 15000, // 15s timeout
  headers: {
    'Content-Type': 'application/json',
  },
})

export default api

// Response interceptor: auto-refresh on 401
// Track if a refresh is in-flight to prevent concurrent refresh storms
let isRefreshing = false
let refreshSubscribers: Array<(ok: boolean) => void> = []

function onRefreshed(ok: boolean) {
  refreshSubscribers.forEach(cb => cb(ok))
  refreshSubscribers = []
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config

    // Never retry the refresh endpoint itself, or already-retried requests
    if (
      error.response?.status === 401 &&
      !original._retry &&
      !original.url?.includes('/auth/refresh') &&
      !original.url?.includes('/auth/login') &&
      !original.url?.includes('/auth/register') &&
      !original.url?.includes('/auth/otp')
    ) {
      // For /auth/me failures on public pages — just reject silently (AuthContext handles it)
      if (original.url?.includes('/auth/me')) {
        return Promise.reject(error)
      }

      original._retry = true

      if (isRefreshing) {
        // Wait for the in-flight refresh
        return new Promise((resolve, reject) => {
          refreshSubscribers.push((ok) => {
            if (ok) resolve(api(original))
            else reject(error)
          })
        })
      }

      isRefreshing = true
      try {
        await api.post('/auth/refresh')
        isRefreshing = false
        onRefreshed(true)
        return api(original)
      } catch {
        isRefreshing = false
        onRefreshed(false)
        // Only redirect to login from browser (not SSR), and only on protected pages
        if (typeof window !== 'undefined') {
          const publicPaths = ['/', '/search', '/items', '/login', '/signup']
          const isPublic = publicPaths.some(p => window.location.pathname === p || window.location.pathname.startsWith('/items/'))
          if (!isPublic) {
            window.location.href = '/login'
          }
        }
      }
    }
    return Promise.reject(error)
  }
)

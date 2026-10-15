import axios from 'axios'
import { authStorage } from '../auth/auth.storage'

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  `${window.location.protocol}//${window.location.hostname}:8000/api/v1`

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
})

const refreshClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
})

let refreshPromise = null

api.interceptors.request.use((config) => {
  const token = authStorage.getAccessToken()

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config
    const status = error.response?.status
    const requestUrl = originalRequest?.url || ''

    const excludedUrls = [
      '/auth/login/',
      '/auth/refresh/',
      '/auth/logout/',
    ]

    const isExcluded = excludedUrls.some((url) =>
      requestUrl.includes(url),
    )

    if (
      status !== 401 ||
      !originalRequest ||
      originalRequest._retry ||
      isExcluded ||
      !authStorage.getRefreshToken()
    ) {
      return Promise.reject(error)
    }

    originalRequest._retry = true

    try {
      if (!refreshPromise) {
        refreshPromise = refreshClient
          .post('/auth/refresh/', {
            refresh: authStorage.getRefreshToken(),
          })
          .then(({ data }) => {
            if (!data.access || !data.refresh) {
              throw new Error('Invalid token refresh response.')
            }

            authStorage.setTokens({
              access: data.access,
              refresh: data.refresh,
            })

            return data.access
          })
          .finally(() => {
            refreshPromise = null
          })
      }

      const newAccessToken = await refreshPromise

      originalRequest.headers.Authorization =
        `Bearer ${newAccessToken}`

      return api(originalRequest)
    } catch (refreshError) {
      authStorage.clearTokens()
      window.dispatchEvent(new Event('auth:expired'))

      return Promise.reject(refreshError)
    }
  },
)

export default api

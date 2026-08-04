import axios, { AxiosError } from 'axios'

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5000'

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
})

let refreshPromise: Promise<void> | null = null

async function refreshSession() {
  await apiClient.post('/auth/refresh')
}

// Auth cookies are httpOnly, so the browser attaches them automatically; on a
// 401 we attempt a single refresh (deduped across concurrent requests) and
// retry the original call once.
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as (typeof error.config & {
      _retried?: boolean
    }) | undefined

    const isAuthEndpoint =
      originalRequest?.url?.includes('/auth/login') ||
      originalRequest?.url?.includes('/auth/signup') ||
      originalRequest?.url?.includes('/auth/refresh')

    if (
      error.response?.status !== 401 ||
      !originalRequest ||
      originalRequest._retried ||
      isAuthEndpoint
    ) {
      throw error
    }

    originalRequest._retried = true

    try {
      refreshPromise ??= refreshSession()
      await refreshPromise
      return apiClient(originalRequest)
    } finally {
      refreshPromise = null
    }
  },
)

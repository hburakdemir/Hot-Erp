import axios from 'axios'

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

export const api = axios.create({
  baseURL,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
})

let refreshPromise = null

function doRefresh() {
  if (!refreshPromise) {
    refreshPromise = api
      .post('/auth/refresh')
      .then((r) => r)
      .finally(() => {
        refreshPromise = null
      })
  }
  return refreshPromise
}

api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const config = err.config
    const status = err.response?.status
    const isRefresh = config?.url?.includes('/auth/refresh')
    const isAuthLogin = config?.url?.includes('/auth/login')
    if (
      status === 401 &&
      config &&
      !config._retry &&
      !isRefresh &&
      !isAuthLogin
    ) {
      config._retry = true
      try {
        await doRefresh()
        return api(config)
      } catch {
        // fall through
      }
    }
    const message =
      err.response?.data?.message ||
      err.response?.data?.error ||
      err.message ||
      'Bir hata oluştu'
    const e = new Error(message)
    if (err.response?.data?.code) e.code = err.response.data.code
    return Promise.reject(e)
  }
)

export default api

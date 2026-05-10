import api from './client.js'

export const authApi = {
  login: (body) => api.post('/auth/login', body).then((r) => r.data),
  logout: () => api.post('/auth/logout').then((r) => r.data),
  logoutAll: () => api.post('/auth/logout-all').then((r) => r.data),
  me: () => api.get('/auth/me').then((r) => r.data.data),
  refresh: () => api.post('/auth/refresh').then((r) => r.data),
}

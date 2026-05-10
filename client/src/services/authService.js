import api from '../api/client.js'

/**
 * @deprecated prefer `src/api/*` modules; kept for legacy components.
 */
export const authService = {
  login: (body) => api.post('/auth/login', body).then((r) => r.data),
  register: (formData) => api.post('/auth/register', formData).then((r) => r.data),
  logout: () => api.post('/auth/logout').then((r) => r.data),
  refresh: () => api.post('/auth/refresh').then((r) => r.data),
}

export const memberService = {
  getAll: (params) => api.get('/members', { params }),
  getById: (id) => api.get(`/members/${id}`),
  getByClub: (clubId) => api.get(`/members/club/${clubId}`),
  getPending: () => api.get('/members/pending'),
  create: (data) => api.post('/members', data),
  update: (id, data) => api.patch(`/members/${id}`, data),
  remove: (id) => api.delete(`/members/${id}`),
}

export default api

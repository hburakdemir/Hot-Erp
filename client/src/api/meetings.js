import api from './client.js'

export const meetingsApi = {
  list: (params) => api.get('/meetings', { params }).then((r) => r.data.data),
  get: (id) => api.get(`/meetings/${id}`).then((r) => r.data.data),
}

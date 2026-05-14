import api from './client.js'

export const eventsApi = {
  list: (params) => api.get('/events', { params }).then((r) => r.data.data),
  get: (id) => api.get(`/events/${id}`).then((r) => r.data.data),
  categories: () => api.get('/events/categories').then((r) => r.data.data),
  participationStatuses: () => api.get('/events/participation-statuses').then((r) => r.data.data),
}

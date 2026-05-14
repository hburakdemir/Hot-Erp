import api from './client.js'

export const announcementsApi = {
  list: (params) => api.get('/announcements', { params }).then((r) => r.data.data),
}

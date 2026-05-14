import api from './client.js'

export const dashboardApi = {
  summary: () => api.get('/dashboard/summary').then((r) => r.data.data),
}

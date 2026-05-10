import api from './client.js'

export const permissionsApi = {
  grouped: () => api.get('/permissions/grouped').then((r) => r.data.data),
  list: () => api.get('/permissions').then((r) => r.data.data),
}

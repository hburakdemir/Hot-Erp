import api from './client.js'

export const rolesApi = {
  list: () => api.get('/roles').then((r) => r.data.data),
  get: (id) => api.get(`/roles/${id}`).then((r) => r.data.data),
  create: (body) => api.post('/roles', body).then((r) => r.data.data),
  update: (id, body) => api.patch(`/roles/${id}`, body).then((r) => r.data.data),
  remove: (id) => api.delete(`/roles/${id}`).then((r) => r.data),
  assignPermissions: (id, permissionIds) =>
    api.post(`/roles/${id}/permissions`, { permissionIds }).then((r) => r.data.data),
}

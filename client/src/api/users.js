import api from './client.js'

export const usersApi = {
  getMyUiPreferences: () => api.get('/users/me/ui-preferences').then((r) => r.data.data),
  patchMyUiPreferences: (body) =>
    api.patch('/users/me/ui-preferences', body).then((r) => r.data.data),
  list: (params) => api.get('/users', { params }).then((r) => r.data.data),
  get: (id) => api.get(`/users/${id}`).then((r) => r.data.data),
  create: (body) => api.post('/users', body).then((r) => r.data.data),
  update: (id, body) => api.patch(`/users/${id}`, body).then((r) => r.data.data),
  assignRoles: (id, roleIds) =>
    api.patch(`/users/${id}/roles`, { roleIds }).then((r) => r.data.data),
  remove: (id) => api.delete(`/users/${id}`).then((r) => r.data),
  bulkApproveRegistration: (userIds) =>
    api.post('/users/bulk/approve-registration', { userIds }).then((r) => r.data.data),
  bulkSetPortalDeactivated: (userIds, portalDeactivated) =>
    api.post('/users/bulk/portal-deactivated', { userIds, portalDeactivated }).then((r) => r.data.data),
}

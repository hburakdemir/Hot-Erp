const prisma = require('../../config/prisma')

const getAllPermissions = async () => {
  return prisma.permission.findMany({
    orderBy: [{ category: 'asc' }, { key: 'asc' }],
  })
}

/** Permissions grouped by category for checkbox UI */
const getPermissionsGrouped = async () => {
  const rows = await getAllPermissions()
  const groups = {}
  for (const p of rows) {
    if (!groups[p.category]) groups[p.category] = []
    groups[p.category].push(p)
  }
  return Object.entries(groups).map(([category, permissions]) => ({
    category,
    permissions,
  }))
}

module.exports = { getAllPermissions, getPermissionsGrouped }

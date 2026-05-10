const prisma = require('../../config/prisma')
const logger = require('../../config/logger')
const { logAudit } = require('../../services/audit.service')

const ROLE_SELECT = {
  id: true,
  name: true,
  description: true,
  createdAt: true,
  updatedAt: true,
  permissions: {
    select: {
      permission: {
        select: {
          id: true,
          key: true,
          category: true,
          description: true,
        },
      },
    },
  },
}

const formatRole = (role) => ({
  ...role,
  permissions: role.permissions.map((rp) => rp.permission),
})

const getAllRoles = async () => {
  const roles = await prisma.role.findMany({
    select: ROLE_SELECT,
    orderBy: { createdAt: 'asc' },
  })
  return roles.map(formatRole)
}

const getRoleById = async (id) => {
  const role = await prisma.role.findUnique({ where: { id }, select: ROLE_SELECT })
  if (!role) {
    const err = new Error('Role not found')
    err.statusCode = 404
    throw err
  }
  return formatRole(role)
}

const createRole = async ({ name, description }, req, actorId) => {
  const existing = await prisma.role.findUnique({ where: { name } })
  if (existing) {
    const err = new Error(`Role "${name}" already exists`)
    err.statusCode = 409
    throw err
  }

  const role = await prisma.role.create({
    data: { name, description },
    select: ROLE_SELECT,
  })

  await logAudit({
    actorId,
    action: 'role.created',
    entityType: 'Role',
    entityId: role.id,
    metadata: { name },
    req,
  })

  logger.info({ roleId: role.id, name }, 'role.created')
  return formatRole(role)
}

const updateRole = async (id, data, req, actorId) => {
  const role = await prisma.role.findUnique({ where: { id } })
  if (!role) {
    const err = new Error('Role not found')
    err.statusCode = 404
    throw err
  }

  if (data.name && data.name !== role.name) {
    const existing = await prisma.role.findUnique({ where: { name: data.name } })
    if (existing) {
      const err = new Error(`Role "${data.name}" already exists`)
      err.statusCode = 409
      throw err
    }
  }

  const updated = await prisma.role.update({
    where: { id },
    data,
    select: ROLE_SELECT,
  })

  await logAudit({
    actorId,
    action: 'role.updated',
    entityType: 'Role',
    entityId: id,
    metadata: data,
    req,
  })

  return formatRole(updated)
}

const deleteRole = async (id, req, actorId) => {
  const role = await prisma.role.findUnique({ where: { id } })
  if (!role) {
    const err = new Error('Role not found')
    err.statusCode = 404
    throw err
  }

  await prisma.role.delete({ where: { id } })

  await logAudit({
    actorId,
    action: 'role.deleted',
    entityType: 'Role',
    entityId: id,
    metadata: { name: role.name },
    req,
  })

  logger.info({ roleId: id }, 'role.deleted')
}

const assignPermissions = async (roleId, permissionIds, req, actorId) => {
  const role = await prisma.role.findUnique({ where: { id: roleId } })
  if (!role) {
    const err = new Error('Role not found')
    err.statusCode = 404
    throw err
  }

  const permissions = await prisma.permission.findMany({
    where: { id: { in: permissionIds } },
  })
  if (permissions.length !== permissionIds.length) {
    const err = new Error('One or more permissions not found')
    err.statusCode = 404
    throw err
  }

  const txs = [prisma.rolePermission.deleteMany({ where: { roleId } })]
  if (permissionIds.length) {
    txs.push(
      prisma.rolePermission.createMany({
        data: permissionIds.map((permissionId) => ({ roleId, permissionId })),
      })
    )
  }
  await prisma.$transaction(txs)

  await logAudit({
    actorId,
    action: 'role.permissions_updated',
    entityType: 'Role',
    entityId: roleId,
    metadata: { permissionIds },
    req,
  })

  logger.info({ roleId, permissionIds }, 'role.permissions_updated')
  return getRoleById(roleId)
}

module.exports = { getAllRoles, getRoleById, createRole, updateRole, deleteRole, assignPermissions }

const bcrypt = require('bcrypt')
const prisma = require('../../config/prisma')
const logger = require('../../config/logger')
const { logAudit } = require('../../services/audit.service')

const SALT_ROUNDS = 10

const USER_SELECT = {
  id: true,
  email: true,
  username: true,
  firstName: true,
  lastName: true,
  phone: true,
  university: true,
  faculty: true,
  department: true,
  year: true,
  avatarUrl: true,
  employmentStatus: true,
  isActive: true,
  registrationStatus: true,
  portalDeactivated: true,
  approvedAt: true,
  approvedById: true,
  approvedBy: {
    select: { id: true, firstName: true, lastName: true, username: true },
  },
  createdAt: true,
  updatedAt: true,
  roles: {
    select: {
      role: { select: { id: true, name: true } },
    },
  },
}

const formatUser = (user) => {
  const { approvedBy, ...rest } = user
  return {
    ...rest,
    roles: (user.roles ?? []).map((ur) => ur.role),
    approvedBy: approvedBy
      ? {
          id: approvedBy.id,
          firstName: approvedBy.firstName,
          lastName: approvedBy.lastName,
          username: approvedBy.username,
        }
      : null,
  }
}

const getAllUsers = async (query) => {
  const {
    page,
    limit,
    search,
    roleId,
    employmentStatus,
    isActive,
    registrationStatus,
    portalDeactivated,
    sortBy,
    sortOrder,
  } = query

  const skip = (page - 1) * limit

  const where = {
    AND: [{ deletedAt: null }],
  }

  if (search?.trim()) {
    const q = search.trim()
    where.AND.push({
      OR: [
        { email: { contains: q, mode: 'insensitive' } },
        { username: { contains: q, mode: 'insensitive' } },
        { firstName: { contains: q, mode: 'insensitive' } },
        { lastName: { contains: q, mode: 'insensitive' } },
        { department: { contains: q, mode: 'insensitive' } },
        { faculty: { contains: q, mode: 'insensitive' } },
        { university: { contains: q, mode: 'insensitive' } },
        { phone: { contains: q, mode: 'insensitive' } },
        { year: { contains: q, mode: 'insensitive' } },
      ],
    })
  }

  if (employmentStatus) {
    where.AND.push({ employmentStatus })
  }

  if (isActive !== undefined) {
    where.AND.push({ isActive: isActive === 'true' })
  }

  if (registrationStatus) {
    where.AND.push({ registrationStatus })
  }

  if (portalDeactivated !== undefined) {
    where.AND.push({ portalDeactivated: portalDeactivated === 'true' })
  }

  if (roleId) {
    where.AND.push({
      roles: { some: { roleId } },
    })
  }

  const orderBy = { [sortBy]: sortOrder }

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where: where.AND.length ? where : undefined,
      select: USER_SELECT,
      skip,
      take: limit,
      orderBy,
    }),
    prisma.user.count({
      where: where.AND.length ? where : undefined,
    }),
  ])

  return {
    users: users.map(formatUser),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 0,
    },
  }
}

const getUserById = async (id) => {
  const user = await prisma.user.findFirst({
    where: { id, deletedAt: null },
    select: USER_SELECT,
  })

  if (!user) {
    const err = new Error('User not found')
    err.statusCode = 404
    throw err
  }

  return formatUser(user)
}

const createUser = async (data, req, actorId) => {
  const hashedPassword = await bcrypt.hash(data.password, SALT_ROUNDS)

  const existing = await prisma.user.findFirst({
    where: { OR: [{ email: data.email }, { username: data.username }] },
  })
  if (existing) {
    const err = new Error('Email or username already in use')
    err.statusCode = 409
    throw err
  }

  const user = await prisma.user.create({
    data: {
      email: data.email,
      username: data.username,
      password: hashedPassword,
      firstName: data.firstName,
      lastName: data.lastName,
      department: data.department ?? null,
      employmentStatus: data.employmentStatus ?? 'ACTIVE',
      avatarUrl: data.avatarUrl ?? null,
      registrationStatus: 'APPROVED',
      approvedAt: new Date(),
      approvedById: actorId,
    },
    select: USER_SELECT,
  })

  await logAudit({
    actorId,
    action: 'user.created',
    entityType: 'User',
    entityId: user.id,
    metadata: { email: user.email },
    req,
  })

  logger.info({ userId: user.id }, 'user.created')
  return formatUser(user)
}

const assignRoles = async (userId, roleIds, req, actorId) => {
  const user = await prisma.user.findFirst({ where: { id: userId, deletedAt: null } })
  if (!user) {
    const err = new Error('User not found')
    err.statusCode = 404
    throw err
  }

  if (roleIds.length) {
    const roles = await prisma.role.findMany({ where: { id: { in: roleIds } } })
    if (roles.length !== roleIds.length) {
      const err = new Error('One or more roles not found')
      err.statusCode = 404
      throw err
    }
  }

  await prisma.$transaction([
    prisma.userRole.deleteMany({ where: { userId } }),
    ...(roleIds.length
      ? [
          prisma.userRole.createMany({
            data: roleIds.map((roleId) => ({ userId, roleId })),
          }),
        ]
      : []),
  ])

  await logAudit({
    actorId,
    action: 'user.roles_updated',
    entityType: 'User',
    entityId: userId,
    metadata: { roleIds },
    req,
  })

  logger.info({ userId, roleIds }, 'user.roles_updated')

  return getUserById(userId)
}

const updateUser = async (id, data, req, actorId) => {
  const user = await prisma.user.findFirst({ where: { id, deletedAt: null } })
  if (!user) {
    const err = new Error('User not found')
    err.statusCode = 404
    throw err
  }

  const updated = await prisma.user.update({
    where: { id },
    data,
    select: USER_SELECT,
  })

  await logAudit({
    actorId,
    action: 'user.updated',
    entityType: 'User',
    entityId: id,
    metadata: data,
    req,
  })

  return formatUser(updated)
}

const deleteUser = async (id, req, actorId) => {
  const user = await prisma.user.findFirst({ where: { id, deletedAt: null } })
  if (!user) {
    const err = new Error('User not found')
    err.statusCode = 404
    throw err
  }

  await prisma.user.update({
    where: { id },
    data: { deletedAt: new Date() },
  })

  await logAudit({
    actorId,
    action: 'user.soft_deleted',
    entityType: 'User',
    entityId: id,
    metadata: { email: user.email },
    req,
  })

  logger.info({ userId: id }, 'user.soft_deleted')
}

const bulkApproveRegistration = async (userIds, req, actorId) => {
  const result = await prisma.user.updateMany({
    where: { id: { in: userIds }, deletedAt: null },
    data: {
      registrationStatus: 'APPROVED',
      approvedAt: new Date(),
      approvedById: actorId,
    },
  })

  await logAudit({
    actorId,
    action: 'user.bulk_approved',
    entityType: 'User',
    entityId: actorId,
    metadata: { userIds, count: result.count },
    req,
  })

  return { updated: result.count }
}

const bulkSetPortalDeactivated = async (userIds, portalDeactivated, req, actorId) => {
  if (userIds.includes(actorId)) {
    const err = new Error('Kendi hesabınızı bu işlemle değiştiremezsiniz')
    err.statusCode = 400
    throw err
  }

  const result = await prisma.user.updateMany({
    where: { id: { in: userIds }, deletedAt: null },
    data: { portalDeactivated },
  })

  await logAudit({
    actorId,
    action: 'user.bulk_portal_status',
    entityType: 'User',
    entityId: actorId,
    metadata: { userIds, portalDeactivated, count: result.count },
    req,
  })

  return { updated: result.count }
}

const getMyUiPreferences = async (userId) => {
  const row = await prisma.user.findUnique({
    where: { id: userId },
    select: { uiPreferences: true },
  })
  return row?.uiPreferences && typeof row.uiPreferences === 'object' ? row.uiPreferences : {}
}

const patchMyUiPreferences = async (userId, patch) => {
  const row = await prisma.user.findUnique({
    where: { id: userId },
    select: { uiPreferences: true },
  })
  const prev =
    row?.uiPreferences && typeof row.uiPreferences === 'object' && !Array.isArray(row.uiPreferences)
      ? row.uiPreferences
      : {}
  const next = { ...prev }
  if (patch.membersTable && Array.isArray(patch.membersTable.columns)) {
    next.membersTable = {
      ...(prev.membersTable || {}),
      columns: patch.membersTable.columns,
    }
  }
  await prisma.user.update({
    where: { id: userId },
    data: { uiPreferences: next },
  })
  return next
}

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  assignRoles,
  updateUser,
  deleteUser,
  bulkApproveRegistration,
  bulkSetPortalDeactivated,
  getMyUiPreferences,
  patchMyUiPreferences,
}

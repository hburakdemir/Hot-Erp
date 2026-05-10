const crypto = require('crypto')
const bcrypt = require('bcrypt')
const prisma = require('../../config/prisma')
const {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} = require('../../utils/jwt')
const logger = require('../../config/logger')
const env = require('../../config/env')
const { AppError } = require('../../errors/AppError')
const { logAudit } = require('../../services/audit.service')

const SALT_ROUNDS = 10

const getRefreshExpiry = (rememberMe) => {
  const durationStr = rememberMe
    ? env.REFRESH_TOKEN_REMEMBER_ME_EXPIRES_IN
    : env.REFRESH_TOKEN_EXPIRES_IN

  const match = durationStr.match(/^(\d+)([smhd])$/)
  if (!match) throw new Error('Invalid refresh token duration format')

  const value = parseInt(match[1])
  const unit = match[2]
  const multipliers = { s: 1, m: 60, h: 3600, d: 86400 }
  return new Date(Date.now() + value * multipliers[unit] * 1000)
}

const roleNamesForUser = (user) =>
  user.roles.map((ur) => ur.role.name)

const register = async (body, req) => {
  const {
    email,
    username,
    password,
    firstName,
    lastName,
    phone,
    university,
    faculty,
    department,
    year,
  } = body

  const finalUsername = username || email.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '_')

  const existingUser = await prisma.user.findFirst({
    where: { OR: [{ email }, { username: finalUsername }] },
  })

  if (existingUser) {
    throw new AppError(
      existingUser.email === email ? 'This email is already registered' : 'This username is already taken',
      409,
      'DUPLICATE'
    )
  }

  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS)

  const user = await prisma.user.create({
    data: {
      email,
      username: finalUsername,
      password: hashedPassword,
      firstName,
      lastName,
      phone: phone || null,
      university: university || null,
      faculty: faculty || null,
      department: department || null,
      year: year || null,
    },
    select: {
      id: true,
      email: true,
      username: true,
      firstName: true,
      lastName: true,
      createdAt: true,
    },
  })

  await logAudit({
    actorId: user.id,
    action: 'user.registered',
    entityType: 'User',
    entityId: user.id,
    metadata: { email: user.email },
    req,
  })

  logger.info({ userId: user.id, email }, 'auth.register')
  return user
}

const login = async ({ identifier, password, rememberMe }, req) => {
  const isEmail = identifier.includes('@')

  const user = await prisma.user.findFirst({
    where: isEmail ? { email: identifier } : { username: identifier },
    select: {
      id: true,
      email: true,
      username: true,
      password: true,
      firstName: true,
      lastName: true,
      university: true,
      faculty: true,
      department: true,
      year: true,
      avatarUrl: true,
      employmentStatus: true,
      isActive: true,
      roles: {
        select: {
          role: { select: { id: true, name: true } },
        },
      },
    },
  })

  if (!user) {
    throw new AppError('Invalid credentials', 401, 'INVALID_CREDENTIALS')
  }

  if (!user.isActive) {
    throw new AppError('Account is disabled', 403, 'ACCOUNT_DISABLED')
  }

  const ok = await bcrypt.compare(password, user.password)
  if (!ok) {
    throw new AppError('Invalid credentials', 401, 'INVALID_CREDENTIALS')
  }

  const roles = roleNamesForUser(user)
  const accessToken = generateAccessToken({ userId: user.id })
  const refreshJwt = generateRefreshToken(user.id, rememberMe)
  const familyId = crypto.randomUUID()

  await prisma.refreshToken.create({
    data: {
      token: refreshJwt,
      userId: user.id,
      familyId,
      expiresAt: getRefreshExpiry(rememberMe),
    },
  })

  await logAudit({
    actorId: user.id,
    action: 'auth.login',
    entityType: 'Session',
    entityId: user.id,
    metadata: { rememberMe: !!rememberMe },
    req,
  })

  logger.info({ userId: user.id }, 'auth.login')

  return {
    accessToken,
    refreshToken: refreshJwt,
    rememberMe,
    user: {
      id: user.id,
      email: user.email,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      university: user.university,
      faculty: user.faculty,
      department: user.department,
      year: user.year,
      avatarUrl: user.avatarUrl,
      employmentStatus: user.employmentStatus,
      roles,
    },
  }
}

const logout = async (refreshToken, req) => {
  if (!refreshToken) return

  const row = await prisma.refreshToken.findUnique({
    where: { token: refreshToken },
    select: { userId: true },
  })

  await prisma.refreshToken.updateMany({
    where: { token: refreshToken, isRevoked: false },
    data: { isRevoked: true },
  })

  if (row?.userId) {
    await logAudit({
      actorId: row.userId,
      action: 'auth.logout',
      entityType: 'Session',
      entityId: row.userId,
      req,
    })
  }

  logger.info('auth.logout')
}

const revokeAllSessions = async (userId, req) => {
  await prisma.refreshToken.updateMany({
    where: { userId, isRevoked: false },
    data: { isRevoked: true },
  })

  await logAudit({
    actorId: userId,
    action: 'auth.logout_all',
    entityType: 'User',
    entityId: userId,
    req,
  })
}

const refresh = async (refreshToken, req) => {
  if (!refreshToken) {
    throw new AppError('Refresh token required', 401, 'NO_REFRESH')
  }

  const stored = await prisma.refreshToken.findUnique({
    where: { token: refreshToken },
  })

  if (!stored) {
    throw new AppError('Invalid refresh token', 401, 'INVALID_REFRESH')
  }

  if (stored.isRevoked) {
    await prisma.refreshToken.updateMany({
      where: { userId: stored.userId, isRevoked: false },
      data: { isRevoked: true },
    })
    await logAudit({
      actorId: stored.userId,
      action: 'auth.token_reuse',
      entityType: 'Session',
      entityId: stored.userId,
      metadata: { familyId: stored.familyId },
      req,
    })
    logger.warn({ userId: stored.userId }, 'auth.refresh_token_reuse')
    throw new AppError('Refresh token reuse detected — sessions invalidated', 401, 'TOKEN_REUSE')
  }

  let decoded
  try {
    decoded = verifyRefreshToken(refreshToken)
  } catch {
    throw new AppError('Invalid or expired refresh token', 401, 'INVALID_REFRESH')
  }

  if (decoded.userId !== stored.userId) {
    throw new AppError('Invalid refresh token', 401, 'INVALID_REFRESH')
  }

  if (stored.expiresAt < new Date()) {
    await prisma.refreshToken.update({
      where: { id: stored.id },
      data: { isRevoked: true },
    })
    throw new AppError('Refresh token expired', 401, 'REFRESH_EXPIRED')
  }

  const user = await prisma.user.findUnique({
    where: { id: stored.userId },
    select: { id: true, isActive: true },
  })

  if (!user?.isActive) {
    throw new AppError('Account is disabled', 403, 'ACCOUNT_DISABLED')
  }

  await prisma.refreshToken.update({
    where: { id: stored.id },
    data: { isRevoked: true },
  })

  const rememberMe =
    stored.expiresAt.getTime() - stored.createdAt.getTime() >
    2 * 24 * 60 * 60 * 1000

  const newRefreshJwt = generateRefreshToken(user.id, rememberMe)

  await prisma.refreshToken.create({
    data: {
      token: newRefreshJwt,
      userId: user.id,
      familyId: stored.familyId,
      expiresAt: getRefreshExpiry(rememberMe),
    },
  })

  const accessToken = generateAccessToken({ userId: user.id })

  logger.info({ userId: user.id }, 'auth.refresh_rotated')

  return { accessToken, refreshToken: newRefreshJwt, rememberMe }
}

const me = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
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
      createdAt: true,
      uiPreferences: true,
      roles: {
        select: {
          role: {
            select: {
              id: true,
              name: true,
              permissions: {
                select: {
                  permission: { select: { key: true, category: true } },
                },
              },
            },
          },
        },
      },
    },
  })

  if (!user) {
    throw new AppError('User not found', 404, 'NOT_FOUND')
  }

  const roles = user.roles.map((ur) => ({
    id: ur.role.id,
    name: ur.role.name,
  }))

  const permissionSet = new Set()
  for (const ur of user.roles) {
    for (const rp of ur.role.permissions) {
      permissionSet.add(rp.permission.key)
    }
  }

  return {
    id: user.id,
    email: user.email,
    username: user.username,
    firstName: user.firstName,
    lastName: user.lastName,
    phone: user.phone,
    university: user.university,
    faculty: user.faculty,
    department: user.department,
    year: user.year,
    avatarUrl: user.avatarUrl,
    employmentStatus: user.employmentStatus,
    isActive: user.isActive,
    createdAt: user.createdAt,
    uiPreferences: user.uiPreferences ?? {},
    roles,
    permissions: [...permissionSet],
  }
}

module.exports = {
  register,
  login,
  logout,
  refresh,
  revokeAllSessions,
  me,
}

const { verifyAccessToken } = require('../utils/jwt')
const { error } = require('../utils/response')
const logger = require('../config/logger')
const prisma = require('../config/prisma')

function collectPermissionKeys(userRecord) {
  const set = new Set()
  for (const ur of userRecord.roles) {
    for (const rp of ur.role.permissions) {
      if (rp.permission?.key) set.add(rp.permission.key)
    }
  }
  return [...set]
}

/**
 * Verifies access JWT and loads fresh RBAC permissions from DB (immediate role changes).
 */
const authMiddleware = async (req, res, next) => {
  try {
    const token = req.cookies?.accessToken

    if (!token) {
      return error(res, 'Authentication required', 401)
    }

    let decoded
    try {
      decoded = verifyAccessToken(token)
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        return error(res, 'Access token expired', 401)
      }
      return error(res, 'Invalid access token', 401)
    }

    const userId = decoded.userId
    if (!userId) {
      return error(res, 'Invalid access token', 401)
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        isActive: true,
        email: true,
        username: true,
        firstName: true,
        lastName: true,
        roles: {
          select: {
            role: {
              select: {
                id: true,
                name: true,
                permissions: {
                  select: {
                    permission: { select: { key: true } },
                  },
                },
              },
            },
          },
        },
      },
    })

    if (!user) {
      return error(res, 'User not found', 401)
    }

    if (!user.isActive) {
      return error(res, 'Account is disabled', 403)
    }

    const permissions = collectPermissionKeys(user)
    const roles = user.roles.map((ur) => ({
      id: ur.role.id,
      name: ur.role.name,
    }))

    req.user = {
      userId: user.id,
      email: user.email,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      roles,
      permissions,
    }

    next()
  } catch (err) {
    logger.error({ err }, 'auth.middleware')
    return error(res, 'Authentication failed', 500)
  }
}

module.exports = authMiddleware

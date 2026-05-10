const { error } = require('../utils/response')
const logger = require('../config/logger')

/**
 * Require a granular permission key (e.g. member.view, role.update).
 * Depends on auth middleware populating req.user.permissions (string[]).
 */
const requirePermission = (permissionKey) => {
  return (req, res, next) => {
    const permissions = req.user?.permissions

    if (!permissions || !Array.isArray(permissions)) {
      return error(res, 'Authentication required', 401)
    }

    if (!permissions.includes(permissionKey)) {
      logger.warn({ userId: req.user?.userId, permissionKey }, 'permission.denied')
      return error(res, `Forbidden: missing permission ${permissionKey}`, 403)
    }

    next()
  }
}

module.exports = requirePermission

const prisma = require('../config/prisma')
const logger = require('../config/logger')

/**
 * @param {object} params
 * @param {string|null} params.actorId
 * @param {string} params.action
 * @param {string} params.entityType
 * @param {string|null} [params.entityId]
 * @param {object|null} [params.metadata]
 * @param {import('express').Request|null} [params.req]
 */
async function logAudit({ actorId, action, entityType, entityId = null, metadata = null, req = null }) {
  try {
    const ip =
      req?.headers?.['x-forwarded-for']?.split(',')[0]?.trim() ||
      req?.ip ||
      req?.socket?.remoteAddress ||
      null
    const userAgent = req?.headers?.['user-agent'] || null

    await prisma.auditLog.create({
      data: {
        actorId,
        action,
        entityType,
        entityId,
        metadata: metadata ?? undefined,
        ipAddress: ip,
        userAgent,
      },
    })
  } catch (err) {
    logger.error({ err }, 'audit.log_failed')
  }
}

module.exports = { logAudit }

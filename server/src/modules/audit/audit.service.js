const prisma = require('../../config/prisma')

const listAuditLogs = async (query) => {
  const {
    page,
    limit,
    action,
    entityType,
    actorId,
    from,
    to,
    sortOrder,
  } = query

  const skip = (page - 1) * limit

  const where = {
    AND: [],
  }

  if (action?.trim()) {
    where.AND.push({ action: { contains: action.trim(), mode: 'insensitive' } })
  }
  if (entityType?.trim()) {
    where.AND.push({ entityType: { contains: entityType.trim(), mode: 'insensitive' } })
  }
  if (actorId) {
    where.AND.push({ actorId })
  }
  const createdFilter = {}
  if (from) createdFilter.gte = new Date(from)
  if (to) createdFilter.lte = new Date(to)
  if (Object.keys(createdFilter).length) {
    where.AND.push({ createdAt: createdFilter })
  }

  const [items, total] = await Promise.all([
    prisma.auditLog.findMany({
      where: where.AND.length ? where : undefined,
      orderBy: { createdAt: sortOrder },
      skip,
      take: limit,
      include: {
        actor: {
          select: {
            id: true,
            email: true,
            username: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    }),
    prisma.auditLog.count({
      where: where.AND.length ? where : undefined,
    }),
  ])

  return {
    items,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 0,
    },
  }
}

module.exports = { listAuditLogs }

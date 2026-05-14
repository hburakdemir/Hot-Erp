const prisma = require('../../config/prisma')
const { logAudit } = require('../../services/audit.service')

const listWhere = { deletedAt: null }

const list = async ({ page, limit, search }) => {
  const skip = (page - 1) * limit
  const where = {
    ...listWhere,
    ...(search?.trim()
      ? {
          OR: [
            { title: { contains: search.trim(), mode: 'insensitive' } },
            { content: { contains: search.trim(), mode: 'insensitive' } },
          ],
        }
      : {}),
  }
  const [items, total] = await Promise.all([
    prisma.announcement.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.announcement.count({ where }),
  ])
  return {
    items,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) || 0 },
  }
}

const getById = async (id) => {
  const row = await prisma.announcement.findFirst({ where: { id, ...listWhere } })
  if (!row) {
    const err = new Error('Duyuru bulunamadı')
    err.statusCode = 404
    throw err
  }
  return row
}

const create = async (data, actorId, req) => {
  const row = await prisma.announcement.create({
    data: {
      title: data.title,
      content: data.content,
      clubId: data.clubId ?? null,
      isGlobal: data.isGlobal ?? false,
    },
  })
  await logAudit({
    actorId,
    action: 'announcement.created',
    entityType: 'Announcement',
    entityId: row.id,
    req,
  })
  return row
}

const update = async (id, data, actorId, req) => {
  await getById(id)
  const row = await prisma.announcement.update({ where: { id }, data })
  await logAudit({
    actorId,
    action: 'announcement.updated',
    entityType: 'Announcement',
    entityId: id,
    req,
  })
  return row
}

const softDelete = async (id, actorId, req) => {
  await getById(id)
  await prisma.announcement.update({
    where: { id },
    data: { deletedAt: new Date() },
  })
  await logAudit({
    actorId,
    action: 'announcement.soft_deleted',
    entityType: 'Announcement',
    entityId: id,
    req,
  })
}

module.exports = { list, getById, create, update, softDelete }

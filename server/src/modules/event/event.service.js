const prisma = require('../../config/prisma')
const { logAudit } = require('../../services/audit.service')

const EVENT_SCOPE = 'EVENT'

const notDeleted = { deletedAt: null }

const assertClub = async (clubId) => {
  const c = await prisma.club.findFirst({ where: { id: clubId, isActive: true } })
  if (!c) {
    const err = new Error('Kulüp bulunamadı')
    err.statusCode = 404
    throw err
  }
}

const listParticipationStatuses = async () => {
  return prisma.participationStatus.findMany({
    where: { scope: EVENT_SCOPE, ...notDeleted },
    orderBy: { sortOrder: 'asc' },
  })
}

const createParticipationStatus = async (data, actorId, req) => {
  const row = await prisma.participationStatus.create({
    data: {
      scope: EVENT_SCOPE,
      label: data.label,
      color: data.color ?? null,
      fontWeight: data.fontWeight ?? null,
      fontStyle: data.fontStyle ?? null,
      sortOrder: data.sortOrder ?? 0,
    },
  })
  await logAudit({
    actorId,
    action: 'event_participation_status.created',
    entityType: 'ParticipationStatus',
    entityId: row.id,
    req,
  })
  return row
}

const updateParticipationStatus = async (id, data, actorId, req) => {
  const row = await prisma.participationStatus.findFirst({
    where: { id, scope: EVENT_SCOPE, ...notDeleted },
  })
  if (!row) {
    const err = new Error('Durum bulunamadı')
    err.statusCode = 404
    throw err
  }
  const updated = await prisma.participationStatus.update({
    where: { id },
    data: {
      ...(data.label !== undefined && { label: data.label }),
      ...(data.color !== undefined && { color: data.color }),
      ...(data.fontWeight !== undefined && { fontWeight: data.fontWeight }),
      ...(data.fontStyle !== undefined && { fontStyle: data.fontStyle }),
      ...(data.sortOrder !== undefined && { sortOrder: data.sortOrder }),
    },
  })
  await logAudit({
    actorId,
    action: 'event_participation_status.updated',
    entityType: 'ParticipationStatus',
    entityId: id,
    req,
  })
  return updated
}

const softDeleteParticipationStatus = async (id, actorId, req) => {
  const row = await prisma.participationStatus.findFirst({
    where: { id, scope: EVENT_SCOPE, ...notDeleted },
  })
  if (!row) {
    const err = new Error('Durum bulunamadı')
    err.statusCode = 404
    throw err
  }
  await prisma.participationStatus.update({
    where: { id },
    data: { deletedAt: new Date() },
  })
  await logAudit({
    actorId,
    action: 'event_participation_status.soft_deleted',
    entityType: 'ParticipationStatus',
    entityId: id,
    req,
  })
}

const listCategories = async () => {
  return prisma.eventCategory.findMany({
    where: notDeleted,
    orderBy: { sortOrder: 'asc' },
  })
}

const createCategory = async (data, actorId, req) => {
  const row = await prisma.eventCategory.create({
    data: {
      name: data.name,
      description: data.description ?? null,
      color: data.color ?? null,
      sortOrder: data.sortOrder ?? 0,
    },
  })
  await logAudit({ actorId, action: 'event_category.created', entityType: 'EventCategory', entityId: row.id, req })
  return row
}

const updateCategory = async (id, data, actorId, req) => {
  const row = await prisma.eventCategory.findFirst({ where: { id, ...notDeleted } })
  if (!row) {
    const err = new Error('Kategori bulunamadı')
    err.statusCode = 404
    throw err
  }
  const patch = {}
  if (data.name !== undefined) patch.name = data.name
  if (data.description !== undefined) patch.description = data.description
  if (data.color !== undefined) patch.color = data.color
  if (data.sortOrder !== undefined) patch.sortOrder = data.sortOrder
  const updated = await prisma.eventCategory.update({ where: { id }, data: patch })
  await logAudit({ actorId, action: 'event_category.updated', entityType: 'EventCategory', entityId: id, req })
  return updated
}

const softDeleteCategory = async (id, actorId, req) => {
  const row = await prisma.eventCategory.findFirst({ where: { id, ...notDeleted } })
  if (!row) {
    const err = new Error('Kategori bulunamadı')
    err.statusCode = 404
    throw err
  }
  await prisma.eventCategory.update({ where: { id }, data: { deletedAt: new Date() } })
  await logAudit({ actorId, action: 'event_category.soft_deleted', entityType: 'EventCategory', entityId: id, req })
}

const listEvents = async (query) => {
  const { page, limit, clubId, search } = query
  const skip = (page - 1) * limit
  const where = {
    ...notDeleted,
    ...(clubId ? { clubId } : {}),
    ...(search?.trim()
      ? {
          OR: [
            { title: { contains: search.trim(), mode: 'insensitive' } },
            { description: { contains: search.trim(), mode: 'insensitive' } },
          ],
        }
      : {}),
  }
  const [items, total] = await Promise.all([
    prisma.event.findMany({
      where,
      skip,
      take: limit,
      orderBy: { startDate: 'desc' },
      include: {
        category: true,
        _count: { select: { attendees: { where: { deletedAt: null } } } },
      },
    }),
    prisma.event.count({ where }),
  ])
  return {
    items,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) || 0 },
  }
}

const getEvent = async (id) => {
  const ev = await prisma.event.findFirst({
    where: { id, ...notDeleted },
    include: {
      category: true,
      club: { select: { id: true, name: true } },
      attendees: {
        where: { deletedAt: null },
        include: {
          user: { select: { id: true, username: true, firstName: true, lastName: true, avatarUrl: true } },
          participationStatus: true,
        },
      },
    },
  })
  if (!ev) {
    const err = new Error('Etkinlik bulunamadı')
    err.statusCode = 404
    throw err
  }
  return ev
}

const createEvent = async (data, actorId, req) => {
  await assertClub(data.clubId)
  const row = await prisma.event.create({
    data: {
      title: data.title,
      description: data.description ?? null,
      location: data.location ?? null,
      startDate: data.startUndetermined ? null : data.startDate ? new Date(data.startDate) : null,
      endDate: data.endUndetermined ? null : data.endDate ? new Date(data.endDate) : null,
      startUndetermined: !!data.startUndetermined,
      endUndetermined: !!data.endUndetermined,
      capacity: data.capacity ?? null,
      isPublic: data.isPublic !== false,
      clubId: data.clubId,
      categoryId: data.categoryId ?? null,
    },
  })
  await logAudit({ actorId, action: 'event.created', entityType: 'Event', entityId: row.id, req })
  return getEvent(row.id)
}

const updateEvent = async (id, data, actorId, req) => {
  await getEvent(id)
  const patch = {}
  if (data.title !== undefined) patch.title = data.title
  if (data.description !== undefined) patch.description = data.description
  if (data.location !== undefined) patch.location = data.location
  if (data.capacity !== undefined) patch.capacity = data.capacity
  if (data.isPublic !== undefined) patch.isPublic = data.isPublic
  if (data.categoryId !== undefined) patch.categoryId = data.categoryId
  if (data.startUndetermined !== undefined) patch.startUndetermined = data.startUndetermined
  if (data.endUndetermined !== undefined) patch.endUndetermined = data.endUndetermined
  if (data.startUndetermined) patch.startDate = null
  else if (data.startDate !== undefined) patch.startDate = data.startDate ? new Date(data.startDate) : null
  if (data.endUndetermined) patch.endDate = null
  else if (data.endDate !== undefined) patch.endDate = data.endDate ? new Date(data.endDate) : null

  await prisma.event.update({ where: { id }, data: patch })
  await logAudit({ actorId, action: 'event.updated', entityType: 'Event', entityId: id, req })
  return getEvent(id)
}

const softDeleteEvent = async (id, actorId, req) => {
  await getEvent(id)
  await prisma.event.update({ where: { id }, data: { deletedAt: new Date() } })
  await logAudit({ actorId, action: 'event.soft_deleted', entityType: 'Event', entityId: id, req })
}

const setParticipation = async (eventId, userId, participationStatusId, actorId, req) => {
  if (userId !== actorId) {
    const err = new Error('Yalnızca kendi katılımınızı güncelleyebilirsiniz')
    err.statusCode = 403
    throw err
  }
  await getEvent(eventId)
  if (participationStatusId) {
    const st = await prisma.participationStatus.findFirst({
      where: { id: participationStatusId, scope: EVENT_SCOPE, ...notDeleted },
    })
    if (!st) {
      const err = new Error('Geçersiz katılım durumu')
      err.statusCode = 400
      throw err
    }
  }
  await prisma.eventAttendee.upsert({
    where: { eventId_userId: { eventId, userId } },
    create: {
      eventId,
      userId,
      participationStatusId: participationStatusId ?? null,
    },
    update: {
      participationStatusId: participationStatusId ?? null,
      deletedAt: null,
    },
  })
  await logAudit({
    actorId,
    action: 'event.participation_set',
    entityType: 'Event',
    entityId: eventId,
    metadata: { userId, participationStatusId },
    req,
  })
  return getEvent(eventId)
}

module.exports = {
  listParticipationStatuses,
  createParticipationStatus,
  updateParticipationStatus,
  softDeleteParticipationStatus,
  listCategories,
  createCategory,
  updateCategory,
  softDeleteCategory,
  listEvents,
  getEvent,
  createEvent,
  updateEvent,
  softDeleteEvent,
  setParticipation,
}

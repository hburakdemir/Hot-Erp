const prisma = require('../../config/prisma')
const { logAudit } = require('../../services/audit.service')

const MEETING_SCOPE = 'MEETING'
const notDeleted = { deletedAt: null }

const assertClub = async (clubId) => {
  const c = await prisma.club.findFirst({ where: { id: clubId, isActive: true } })
  if (!c) {
    const err = new Error('Kulüp bulunamadı')
    err.statusCode = 404
    throw err
  }
}

const listParticipationStatuses = async () =>
  prisma.participationStatus.findMany({
    where: { scope: MEETING_SCOPE, ...notDeleted },
    orderBy: { sortOrder: 'asc' },
  })

const createParticipationStatus = async (data, actorId, req) => {
  const row = await prisma.participationStatus.create({
    data: {
      scope: MEETING_SCOPE,
      label: data.label,
      color: data.color ?? null,
      fontWeight: data.fontWeight ?? null,
      fontStyle: data.fontStyle ?? null,
      sortOrder: data.sortOrder ?? 0,
    },
  })
  await logAudit({
    actorId,
    action: 'meeting_participation_status.created',
    entityType: 'ParticipationStatus',
    entityId: row.id,
    req,
  })
  return row
}

const updateParticipationStatus = async (id, data, actorId, req) => {
  const row = await prisma.participationStatus.findFirst({
    where: { id, scope: MEETING_SCOPE, ...notDeleted },
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
    action: 'meeting_participation_status.updated',
    entityType: 'ParticipationStatus',
    entityId: id,
    req,
  })
  return updated
}

const softDeleteParticipationStatus = async (id, actorId, req) => {
  const row = await prisma.participationStatus.findFirst({
    where: { id, scope: MEETING_SCOPE, ...notDeleted },
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
    action: 'meeting_participation_status.soft_deleted',
    entityType: 'ParticipationStatus',
    entityId: id,
    req,
  })
}

const listCategories = async () =>
  prisma.meetingCategory.findMany({
    where: notDeleted,
    orderBy: { sortOrder: 'asc' },
  })

const createCategory = async (data, actorId, req) => {
  const row = await prisma.meetingCategory.create({
    data: {
      name: data.name,
      color: data.color ?? null,
      sortOrder: data.sortOrder ?? 0,
    },
  })
  await logAudit({
    actorId,
    action: 'meeting_category.created',
    entityType: 'MeetingCategory',
    entityId: row.id,
    req,
  })
  return row
}

const updateCategory = async (id, data, actorId, req) => {
  const row = await prisma.meetingCategory.findFirst({ where: { id, ...notDeleted } })
  if (!row) {
    const err = new Error('Kategori bulunamadı')
    err.statusCode = 404
    throw err
  }
  const patch = {}
  if (data.name !== undefined) patch.name = data.name
  if (data.color !== undefined) patch.color = data.color
  if (data.sortOrder !== undefined) patch.sortOrder = data.sortOrder
  const updated = await prisma.meetingCategory.update({ where: { id }, data: patch })
  await logAudit({
    actorId,
    action: 'meeting_category.updated',
    entityType: 'MeetingCategory',
    entityId: id,
    req,
  })
  return updated
}

const softDeleteCategory = async (id, actorId, req) => {
  const row = await prisma.meetingCategory.findFirst({ where: { id, ...notDeleted } })
  if (!row) {
    const err = new Error('Kategori bulunamadı')
    err.statusCode = 404
    throw err
  }
  await prisma.meetingCategory.update({ where: { id }, data: { deletedAt: new Date() } })
  await logAudit({
    actorId,
    action: 'meeting_category.soft_deleted',
    entityType: 'MeetingCategory',
    entityId: id,
    req,
  })
}

const listMeetings = async (query) => {
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
    prisma.meeting.findMany({
      where,
      skip,
      take: limit,
      orderBy: { updatedAt: 'desc' },
      include: {
        category: true,
        _count: { select: { attendees: { where: { deletedAt: null } } } },
      },
    }),
    prisma.meeting.count({ where }),
  ])
  return {
    items,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) || 0 },
  }
}

const getMeeting = async (id) => {
  const m = await prisma.meeting.findFirst({
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
  if (!m) {
    const err = new Error('Toplantı bulunamadı')
    err.statusCode = 404
    throw err
  }
  return m
}

const createMeeting = async (data, actorId, req) => {
  await assertClub(data.clubId)
  const row = await prisma.meeting.create({
    data: {
      title: data.title,
      description: data.description ?? null,
      location: data.location ?? null,
      startDate: data.startUndetermined ? null : data.startDate ? new Date(data.startDate) : null,
      endDate: data.endUndetermined ? null : data.endDate ? new Date(data.endDate) : null,
      startUndetermined: !!data.startUndetermined,
      endUndetermined: !!data.endUndetermined,
      clubId: data.clubId,
      categoryId: data.categoryId ?? null,
    },
  })
  await logAudit({ actorId, action: 'meeting.created', entityType: 'Meeting', entityId: row.id, req })
  return getMeeting(row.id)
}

const updateMeeting = async (id, data, actorId, req) => {
  await getMeeting(id)
  const patch = {}
  if (data.title !== undefined) patch.title = data.title
  if (data.description !== undefined) patch.description = data.description
  if (data.location !== undefined) patch.location = data.location
  if (data.categoryId !== undefined) patch.categoryId = data.categoryId
  if (data.startUndetermined !== undefined) patch.startUndetermined = data.startUndetermined
  if (data.endUndetermined !== undefined) patch.endUndetermined = data.endUndetermined
  if (data.startUndetermined) patch.startDate = null
  else if (data.startDate !== undefined) patch.startDate = data.startDate ? new Date(data.startDate) : null
  if (data.endUndetermined) patch.endDate = null
  else if (data.endDate !== undefined) patch.endDate = data.endDate ? new Date(data.endDate) : null

  await prisma.meeting.update({ where: { id }, data: patch })
  await logAudit({ actorId, action: 'meeting.updated', entityType: 'Meeting', entityId: id, req })
  return getMeeting(id)
}

const softDeleteMeeting = async (id, actorId, req) => {
  await getMeeting(id)
  await prisma.meeting.update({ where: { id }, data: { deletedAt: new Date() } })
  await logAudit({ actorId, action: 'meeting.soft_deleted', entityType: 'Meeting', entityId: id, req })
}

const setParticipation = async (meetingId, userId, participationStatusId, actorId, req) => {
  if (userId !== actorId) {
    const err = new Error('Yalnızca kendi katılımınızı güncelleyebilirsiniz')
    err.statusCode = 403
    throw err
  }
  await getMeeting(meetingId)
  if (participationStatusId) {
    const st = await prisma.participationStatus.findFirst({
      where: { id: participationStatusId, scope: MEETING_SCOPE, ...notDeleted },
    })
    if (!st) {
      const err = new Error('Geçersiz katılım durumu')
      err.statusCode = 400
      throw err
    }
  }
  await prisma.meetingAttendee.upsert({
    where: { meetingId_userId: { meetingId, userId } },
    create: {
      meetingId,
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
    action: 'meeting.participation_set',
    entityType: 'Meeting',
    entityId: meetingId,
    metadata: { userId, participationStatusId },
    req,
  })
  return getMeeting(meetingId)
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
  listMeetings,
  getMeeting,
  createMeeting,
  updateMeeting,
  softDeleteMeeting,
  setParticipation,
}

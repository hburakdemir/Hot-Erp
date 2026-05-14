const eventService = require('./event.service')
const { success } = require('../../utils/response')

const wrap = (fn) => async (req, res, next) => {
  try {
    await fn(req, res, next)
  } catch (err) {
    next(err)
  }
}

exports.listParticipationStatuses = wrap(async (req, res) => {
  const rows = await eventService.listParticipationStatuses()
  return success(res, rows, 'Katılım durumları')
})

exports.createParticipationStatus = wrap(async (req, res) => {
  const row = await eventService.createParticipationStatus(req.body, req.user.userId, req)
  return success(res, row, 'Oluşturuldu', 201)
})

exports.updateParticipationStatus = wrap(async (req, res) => {
  const row = await eventService.updateParticipationStatus(req.params.statusId, req.body, req.user.userId, req)
  return success(res, row, 'Güncellendi')
})

exports.deleteParticipationStatus = wrap(async (req, res) => {
  await eventService.softDeleteParticipationStatus(req.params.statusId, req.user.userId, req)
  return success(res, null, 'Silindi (soft)')
})

exports.listCategories = wrap(async (req, res) => {
  const rows = await eventService.listCategories()
  return success(res, rows, 'Kategoriler')
})

exports.createCategory = wrap(async (req, res) => {
  const row = await eventService.createCategory(req.body, req.user.userId, req)
  return success(res, row, 'Oluşturuldu', 201)
})

exports.updateCategory = wrap(async (req, res) => {
  const row = await eventService.updateCategory(req.params.categoryId, req.body, req.user.userId, req)
  return success(res, row, 'Güncellendi')
})

exports.deleteCategory = wrap(async (req, res) => {
  await eventService.softDeleteCategory(req.params.categoryId, req.user.userId, req)
  return success(res, null, 'Silindi (soft)')
})

exports.listEvents = wrap(async (req, res) => {
  const data = await eventService.listEvents(req.validatedQuery)
  return success(res, data, 'Etkinlikler')
})

exports.getEvent = wrap(async (req, res) => {
  const row = await eventService.getEvent(req.params.id)
  return success(res, row, 'Etkinlik')
})

exports.createEvent = wrap(async (req, res) => {
  const row = await eventService.createEvent(req.body, req.user.userId, req)
  return success(res, row, 'Oluşturuldu', 201)
})

exports.updateEvent = wrap(async (req, res) => {
  const row = await eventService.updateEvent(req.params.id, req.body, req.user.userId, req)
  return success(res, row, 'Güncellendi')
})

exports.deleteEvent = wrap(async (req, res) => {
  await eventService.softDeleteEvent(req.params.id, req.user.userId, req)
  return success(res, null, 'Silindi (soft)')
})

exports.setParticipation = wrap(async (req, res) => {
  const row = await eventService.setParticipation(
    req.params.id,
    req.user.userId,
    req.body.participationStatusId,
    req.user.userId,
    req
  )
  return success(res, row, 'Katılım kaydedildi')
})

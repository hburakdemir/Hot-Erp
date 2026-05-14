const meetingService = require('./meeting.service')
const { success } = require('../../utils/response')

const wrap = (fn) => async (req, res, next) => {
  try {
    await fn(req, res, next)
  } catch (err) {
    next(err)
  }
}

exports.listParticipationStatuses = wrap(async (req, res) => {
  const rows = await meetingService.listParticipationStatuses()
  return success(res, rows, 'Katılım durumları')
})

exports.createParticipationStatus = wrap(async (req, res) => {
  const row = await meetingService.createParticipationStatus(req.body, req.user.userId, req)
  return success(res, row, 'Oluşturuldu', 201)
})

exports.updateParticipationStatus = wrap(async (req, res) => {
  const row = await meetingService.updateParticipationStatus(req.params.statusId, req.body, req.user.userId, req)
  return success(res, row, 'Güncellendi')
})

exports.deleteParticipationStatus = wrap(async (req, res) => {
  await meetingService.softDeleteParticipationStatus(req.params.statusId, req.user.userId, req)
  return success(res, null, 'Silindi (soft)')
})

exports.listCategories = wrap(async (req, res) => {
  const rows = await meetingService.listCategories()
  return success(res, rows, 'Kategoriler')
})

exports.createCategory = wrap(async (req, res) => {
  const row = await meetingService.createCategory(req.body, req.user.userId, req)
  return success(res, row, 'Oluşturuldu', 201)
})

exports.updateCategory = wrap(async (req, res) => {
  const row = await meetingService.updateCategory(req.params.categoryId, req.body, req.user.userId, req)
  return success(res, row, 'Güncellendi')
})

exports.deleteCategory = wrap(async (req, res) => {
  await meetingService.softDeleteCategory(req.params.categoryId, req.user.userId, req)
  return success(res, null, 'Silindi (soft)')
})

exports.listMeetings = wrap(async (req, res) => {
  const data = await meetingService.listMeetings(req.validatedQuery)
  return success(res, data, 'Toplantılar')
})

exports.getMeeting = wrap(async (req, res) => {
  const row = await meetingService.getMeeting(req.params.id)
  return success(res, row, 'Toplantı')
})

exports.createMeeting = wrap(async (req, res) => {
  const row = await meetingService.createMeeting(req.body, req.user.userId, req)
  return success(res, row, 'Oluşturuldu', 201)
})

exports.updateMeeting = wrap(async (req, res) => {
  const row = await meetingService.updateMeeting(req.params.id, req.body, req.user.userId, req)
  return success(res, row, 'Güncellendi')
})

exports.deleteMeeting = wrap(async (req, res) => {
  await meetingService.softDeleteMeeting(req.params.id, req.user.userId, req)
  return success(res, null, 'Silindi (soft)')
})

exports.setParticipation = wrap(async (req, res) => {
  const row = await meetingService.setParticipation(
    req.params.id,
    req.user.userId,
    req.body.participationStatusId,
    req.user.userId,
    req
  )
  return success(res, row, 'Katılım kaydedildi')
})

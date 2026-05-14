const announcementService = require('./announcement.service')
const { success } = require('../../utils/response')

const list = async (req, res, next) => {
  try {
    const data = await announcementService.list(req.validatedQuery)
    return success(res, data, 'Duyurular')
  } catch (err) {
    next(err)
  }
}

const getById = async (req, res, next) => {
  try {
    const row = await announcementService.getById(req.params.id)
    return success(res, row, 'Duyuru')
  } catch (err) {
    next(err)
  }
}

const create = async (req, res, next) => {
  try {
    const row = await announcementService.create(req.body, req.user.userId, req)
    return success(res, row, 'Oluşturuldu', 201)
  } catch (err) {
    next(err)
  }
}

const update = async (req, res, next) => {
  try {
    const row = await announcementService.update(req.params.id, req.body, req.user.userId, req)
    return success(res, row, 'Güncellendi')
  } catch (err) {
    next(err)
  }
}

const remove = async (req, res, next) => {
  try {
    await announcementService.softDelete(req.params.id, req.user.userId, req)
    return success(res, null, 'Silindi (soft)')
  } catch (err) {
    next(err)
  }
}

module.exports = { list, getById, create, update, remove }

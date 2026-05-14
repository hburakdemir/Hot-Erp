const userService = require('./user.service')
const { success } = require('../../utils/response')

const getAllUsers = async (req, res, next) => {
  try {
    const data = await userService.getAllUsers(req.validatedQuery)
    return success(res, data, 'Users retrieved successfully')
  } catch (err) {
    next(err)
  }
}

const getUserById = async (req, res, next) => {
  try {
    const user = await userService.getUserById(req.params.id)
    return success(res, user, 'User retrieved successfully')
  } catch (err) {
    next(err)
  }
}

const createUser = async (req, res, next) => {
  try {
    const user = await userService.createUser(req.body, req, req.user.userId)
    return success(res, user, 'User created successfully', 201)
  } catch (err) {
    next(err)
  }
}

const assignRoles = async (req, res, next) => {
  try {
    const { roleIds } = req.body
    const user = await userService.assignRoles(req.params.id, roleIds, req, req.user.userId)
    return success(res, user, 'Roles assigned successfully')
  } catch (err) {
    next(err)
  }
}

const updateUser = async (req, res, next) => {
  try {
    const user = await userService.updateUser(req.params.id, req.body, req, req.user.userId)
    return success(res, user, 'User updated successfully')
  } catch (err) {
    next(err)
  }
}

const deleteUser = async (req, res, next) => {
  try {
    await userService.deleteUser(req.params.id, req, req.user.userId)
    return success(res, null, 'User deleted successfully')
  } catch (err) {
    next(err)
  }
}

const getMyUiPreferences = async (req, res, next) => {
  try {
    const prefs = await userService.getMyUiPreferences(req.user.userId)
    return success(res, prefs, 'Arayüz tercihleri')
  } catch (err) {
    next(err)
  }
}

const patchMyUiPreferences = async (req, res, next) => {
  try {
    const prefs = await userService.patchMyUiPreferences(req.user.userId, req.body)
    return success(res, prefs, 'Tercihler kaydedildi')
  } catch (err) {
    next(err)
  }
}

const bulkApproveRegistration = async (req, res, next) => {
  try {
    const data = await userService.bulkApproveRegistration(req.body.userIds, req, req.user.userId)
    return success(res, data, 'Üyeler onaylandı')
  } catch (err) {
    next(err)
  }
}

const bulkSetPortalDeactivated = async (req, res, next) => {
  try {
    const data = await userService.bulkSetPortalDeactivated(
      req.body.userIds,
      req.body.portalDeactivated,
      req,
      req.user.userId
    )
    return success(res, data, 'Hesap durumu güncellendi')
  } catch (err) {
    next(err)
  }
}

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  assignRoles,
  updateUser,
  deleteUser,
  getMyUiPreferences,
  patchMyUiPreferences,
  bulkApproveRegistration,
  bulkSetPortalDeactivated,
}

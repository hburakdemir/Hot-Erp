const permissionService = require('./permission.service')
const { success } = require('../../utils/response')

const getAllPermissions = async (req, res, next) => {
  try {
    const permissions = await permissionService.getAllPermissions()
    return success(res, permissions, 'Permissions retrieved successfully')
  } catch (err) {
    next(err)
  }
}

const getPermissionsGrouped = async (req, res, next) => {
  try {
    const grouped = await permissionService.getPermissionsGrouped()
    return success(res, grouped, 'Permissions grouped')
  } catch (err) {
    next(err)
  }
}

module.exports = { getAllPermissions, getPermissionsGrouped }

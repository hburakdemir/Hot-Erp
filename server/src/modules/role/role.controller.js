const roleService = require('./role.service')
const { success } = require('../../utils/response')

const getAllRoles = async (req, res, next) => {
  try {
    const roles = await roleService.getAllRoles()
    return success(res, roles, 'Roles retrieved successfully')
  } catch (err) {
    next(err)
  }
}

const getRoleById = async (req, res, next) => {
  try {
    const role = await roleService.getRoleById(req.params.id)
    return success(res, role, 'Role retrieved successfully')
  } catch (err) {
    next(err)
  }
}

const createRole = async (req, res, next) => {
  try {
    const role = await roleService.createRole(req.body, req, req.user.userId)
    return success(res, role, 'Role created successfully', 201)
  } catch (err) {
    next(err)
  }
}

const updateRole = async (req, res, next) => {
  try {
    const role = await roleService.updateRole(req.params.id, req.body, req, req.user.userId)
    return success(res, role, 'Role updated successfully')
  } catch (err) {
    next(err)
  }
}

const deleteRole = async (req, res, next) => {
  try {
    await roleService.deleteRole(req.params.id, req, req.user.userId)
    return success(res, null, 'Role deleted successfully')
  } catch (err) {
    next(err)
  }
}

const assignPermissions = async (req, res, next) => {
  try {
    const role = await roleService.assignPermissions(
      req.params.id,
      req.body.permissionIds,
      req,
      req.user.userId
    )
    return success(res, role, 'Permissions assigned successfully')
  } catch (err) {
    next(err)
  }
}

module.exports = { getAllRoles, getRoleById, createRole, updateRole, deleteRole, assignPermissions }

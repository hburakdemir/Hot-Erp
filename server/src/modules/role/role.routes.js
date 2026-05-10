const { Router } = require('express')
const controller = require('./role.controller')
const authMiddleware = require('../../middleware/auth.middleware')
const requirePermission = require('../../middleware/permission.middleware')
const validate = require('../../middleware/validate.middleware')
const { createRoleSchema, updateRoleSchema, assignPermissionsSchema } = require('./role.schema')

const router = Router()

router.use(authMiddleware)

router.get('/', requirePermission('role.view'), controller.getAllRoles)
router.get('/:id', requirePermission('role.view'), controller.getRoleById)
router.post('/', requirePermission('role.create'), validate(createRoleSchema), controller.createRole)
router.patch('/:id', requirePermission('role.update'), validate(updateRoleSchema), controller.updateRole)
router.delete('/:id', requirePermission('role.delete'), controller.deleteRole)

router.post(
  '/:id/permissions',
  requirePermission('role.update'),
  validate(assignPermissionsSchema),
  controller.assignPermissions
)

module.exports = router

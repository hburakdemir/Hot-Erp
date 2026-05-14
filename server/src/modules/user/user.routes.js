const { Router } = require('express')
const controller = require('./user.controller')
const authMiddleware = require('../../middleware/auth.middleware')
const requireFullPortalAccess = require('../../middleware/portalAccess.middleware')
const requirePermission = require('../../middleware/permission.middleware')
const validate = require('../../middleware/validate.middleware')
const validateQuery = require('../../middleware/validateQuery.middleware')
const {
  assignRolesSchema,
  updateUserSchema,
  listUsersQuerySchema,
  createUserSchema,
  patchUiPreferencesSchema,
  bulkUserIdsSchema,
  bulkPortalSchema,
} = require('./user.schema')

const router = Router()

router.use(authMiddleware)
router.use(requireFullPortalAccess)

router.get('/me/ui-preferences', controller.getMyUiPreferences)
router.patch('/me/ui-preferences', validate(patchUiPreferencesSchema), controller.patchMyUiPreferences)

router.post(
  '/bulk/approve-registration',
  requirePermission('member.update'),
  validate(bulkUserIdsSchema),
  controller.bulkApproveRegistration
)
router.post(
  '/bulk/portal-deactivated',
  requirePermission('member.update'),
  validate(bulkPortalSchema),
  controller.bulkSetPortalDeactivated
)

router.get('/', requirePermission('member.view'), validateQuery(listUsersQuerySchema), controller.getAllUsers)

router.post('/', requirePermission('member.create'), validate(createUserSchema), controller.createUser)

router.get('/:id', requirePermission('member.view'), controller.getUserById)

router.patch('/:id', requirePermission('member.update'), validate(updateUserSchema), controller.updateUser)

router.patch('/:id/roles', requirePermission('member.update'), validate(assignRolesSchema), controller.assignRoles)

router.delete('/:id', requirePermission('member.delete'), controller.deleteUser)

module.exports = router

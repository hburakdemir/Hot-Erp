const { Router } = require('express')
const controller = require('./announcement.controller')
const authMiddleware = require('../../middleware/auth.middleware')
const requireFullPortalAccess = require('../../middleware/portalAccess.middleware')
const requirePermission = require('../../middleware/permission.middleware')
const validate = require('../../middleware/validate.middleware')
const validateQuery = require('../../middleware/validateQuery.middleware')
const {
  listQuerySchema,
  createAnnouncementSchema,
  updateAnnouncementSchema,
} = require('./announcement.schema')

const router = Router()

router.use(authMiddleware)
router.use(requireFullPortalAccess)

router.get('/', requirePermission('announcement.view'), validateQuery(listQuerySchema), controller.list)
router.get('/:id', requirePermission('announcement.view'), controller.getById)
router.post(
  '/',
  requirePermission('announcement.create'),
  validate(createAnnouncementSchema),
  controller.create
)
router.patch(
  '/:id',
  requirePermission('announcement.update'),
  validate(updateAnnouncementSchema),
  controller.update
)
router.delete('/:id', requirePermission('announcement.delete'), controller.remove)

module.exports = router

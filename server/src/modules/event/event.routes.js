const { Router } = require('express')
const controller = require('./event.controller')
const authMiddleware = require('../../middleware/auth.middleware')
const requireFullPortalAccess = require('../../middleware/portalAccess.middleware')
const requirePermission = require('../../middleware/permission.middleware')
const validate = require('../../middleware/validate.middleware')
const validateQuery = require('../../middleware/validateQuery.middleware')
const {
  listEventsQuerySchema,
  createEventSchema,
  updateEventSchema,
  participationStatusBody,
  patchParticipationStatusSchema,
  eventCategoryBody,
  patchEventCategorySchema,
  setParticipationSchema,
} = require('./event.schema')

const router = Router()

router.use(authMiddleware)
router.use(requireFullPortalAccess)

router.get(
  '/participation-statuses',
  requirePermission('event.view'),
  controller.listParticipationStatuses
)
router.post(
  '/participation-statuses',
  requirePermission('event.update'),
  validate(participationStatusBody),
  controller.createParticipationStatus
)
router.patch(
  '/participation-statuses/:statusId',
  requirePermission('event.update'),
  validate(patchParticipationStatusSchema),
  controller.updateParticipationStatus
)
router.delete(
  '/participation-statuses/:statusId',
  requirePermission('event.delete'),
  controller.deleteParticipationStatus
)

router.get('/categories', requirePermission('event.view'), controller.listCategories)
router.post(
  '/categories',
  requirePermission('event.create'),
  validate(eventCategoryBody),
  controller.createCategory
)
router.patch(
  '/categories/:categoryId',
  requirePermission('event.update'),
  validate(patchEventCategorySchema),
  controller.updateCategory
)
router.delete('/categories/:categoryId', requirePermission('event.delete'), controller.deleteCategory)

router.get('/', requirePermission('event.view'), validateQuery(listEventsQuerySchema), controller.listEvents)
router.post('/', requirePermission('event.create'), validate(createEventSchema), controller.createEvent)

router.post(
  '/:id/participation',
  requirePermission('event.view'),
  validate(setParticipationSchema),
  controller.setParticipation
)

router.get('/:id', requirePermission('event.view'), controller.getEvent)
router.patch('/:id', requirePermission('event.update'), validate(updateEventSchema), controller.updateEvent)
router.delete('/:id', requirePermission('event.delete'), controller.deleteEvent)

module.exports = router

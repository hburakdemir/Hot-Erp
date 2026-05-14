const { Router } = require('express')
const controller = require('./meeting.controller')
const authMiddleware = require('../../middleware/auth.middleware')
const requireFullPortalAccess = require('../../middleware/portalAccess.middleware')
const requirePermission = require('../../middleware/permission.middleware')
const validate = require('../../middleware/validate.middleware')
const validateQuery = require('../../middleware/validateQuery.middleware')
const {
  listMeetingsQuerySchema,
  createMeetingSchema,
  updateMeetingSchema,
  participationStatusBody,
  patchParticipationStatusSchema,
  meetingCategoryBody,
  patchMeetingCategorySchema,
  setParticipationSchema,
} = require('./meeting.schema')

const router = Router()

router.use(authMiddleware)
router.use(requireFullPortalAccess)

router.get(
  '/participation-statuses',
  requirePermission('meeting.view'),
  controller.listParticipationStatuses
)
router.post(
  '/participation-statuses',
  requirePermission('meeting.update'),
  validate(participationStatusBody),
  controller.createParticipationStatus
)
router.patch(
  '/participation-statuses/:statusId',
  requirePermission('meeting.update'),
  validate(patchParticipationStatusSchema),
  controller.updateParticipationStatus
)
router.delete(
  '/participation-statuses/:statusId',
  requirePermission('meeting.delete'),
  controller.deleteParticipationStatus
)

router.get('/categories', requirePermission('meeting.view'), controller.listCategories)
router.post(
  '/categories',
  requirePermission('meeting.create'),
  validate(meetingCategoryBody),
  controller.createCategory
)
router.patch(
  '/categories/:categoryId',
  requirePermission('meeting.update'),
  validate(patchMeetingCategorySchema),
  controller.updateCategory
)
router.delete('/categories/:categoryId', requirePermission('meeting.delete'), controller.deleteCategory)

router.get('/', requirePermission('meeting.view'), validateQuery(listMeetingsQuerySchema), controller.listMeetings)
router.post('/', requirePermission('meeting.create'), validate(createMeetingSchema), controller.createMeeting)

router.post(
  '/:id/participation',
  requirePermission('meeting.view'),
  validate(setParticipationSchema),
  controller.setParticipation
)

router.get('/:id', requirePermission('meeting.view'), controller.getMeeting)
router.patch('/:id', requirePermission('meeting.update'), validate(updateMeetingSchema), controller.updateMeeting)
router.delete('/:id', requirePermission('meeting.delete'), controller.deleteMeeting)

module.exports = router

const { Router } = require('express')
const controller = require('./permission.controller')
const authMiddleware = require('../../middleware/auth.middleware')
const requirePermission = require('../../middleware/permission.middleware')

const router = Router()

router.use(authMiddleware)
const requireFullPortalAccess = require('../../middleware/portalAccess.middleware')
router.use(requireFullPortalAccess)

router.get('/grouped', requirePermission('role.view'), controller.getPermissionsGrouped)
router.get('/', requirePermission('role.view'), controller.getAllPermissions)

module.exports = router

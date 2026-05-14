const { Router } = require('express')
const controller = require('./dashboard.controller')
const authMiddleware = require('../../middleware/auth.middleware')
const requireFullPortalAccess = require('../../middleware/portalAccess.middleware')

const router = Router()

router.use(authMiddleware)
router.use(requireFullPortalAccess)

router.get('/summary', controller.getSummary)

module.exports = router

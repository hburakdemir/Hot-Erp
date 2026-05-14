const { Router } = require('express')
const controller = require('./audit.controller')
const authMiddleware = require('../../middleware/auth.middleware')
const requirePermission = require('../../middleware/permission.middleware')
const validateQuery = require('../../middleware/validateQuery.middleware')
const { listAuditQuerySchema } = require('./audit.schema')

const router = Router()

router.use(authMiddleware)
const requireFullPortalAccess = require('../../middleware/portalAccess.middleware')
router.use(requireFullPortalAccess)

router.get('/', requirePermission('audit.view'), validateQuery(listAuditQuerySchema), controller.listAuditLogs)

module.exports = router

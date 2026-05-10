const { Router } = require('express')
const controller = require('./auth.controller')
const validate = require('../../middleware/validate.middleware')
const authMiddleware = require('../../middleware/auth.middleware')
const { registerSchema, loginSchema } = require('./auth.schema')

const router = Router()

router.post('/register', validate(registerSchema), controller.register)
router.post('/login', validate(loginSchema), controller.login)
router.post('/logout', controller.logout)
router.post('/refresh', controller.refresh)

router.get('/me', authMiddleware, controller.me)
router.post('/logout-all', authMiddleware, controller.logoutAll)

module.exports = router

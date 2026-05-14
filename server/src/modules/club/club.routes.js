const { Router } = require('express')
const prisma = require('../../config/prisma')
const authMiddleware = require('../../middleware/auth.middleware')
const requireFullPortalAccess = require('../../middleware/portalAccess.middleware')
const { success } = require('../../utils/response')

const router = Router()

router.use(authMiddleware)
router.use(requireFullPortalAccess)

router.get('/', async (req, res, next) => {
  try {
    const rows = await prisma.club.findMany({
      where: { isActive: true },
      select: { id: true, name: true, description: true },
      orderBy: { name: 'asc' },
    })
    return success(res, rows, 'Kulüpler')
  } catch (err) {
    next(err)
  }
})

module.exports = router

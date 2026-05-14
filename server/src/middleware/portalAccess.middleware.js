const { error } = require('../utils/response')

/**
 * Pasif (portal) üyeleri tüm işlevsel API'lerden uzak tutar.
 * /auth/me ve çıkış yolları bu middleware'i kullanmaz.
 */
const requireFullPortalAccess = (req, res, next) => {
  if (req.user?.portalDeactivated) {
    return res.status(403).json({
      success: false,
      message: 'Hesabınız pasifleştirildi. Yalnızca bilgilendirme sayfasına erişebilirsiniz.',
      code: 'PORTAL_DEACTIVATED',
    })
  }
  next()
}

module.exports = requireFullPortalAccess

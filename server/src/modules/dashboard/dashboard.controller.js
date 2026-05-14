const { success } = require('../../utils/response')
const dashboardService = require('./dashboard.service')

const getSummary = async (req, res, next) => {
  try {
    const data = await dashboardService.getSummary(req.user.permissions || [])
    return success(res, data, 'Özet istatistikler')
  } catch (err) {
    next(err)
  }
}

module.exports = { getSummary }

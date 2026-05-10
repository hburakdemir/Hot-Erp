const auditService = require('./audit.service')
const { success } = require('../../utils/response')

const listAuditLogs = async (req, res, next) => {
  try {
    const data = await auditService.listAuditLogs(req.validatedQuery)
    return success(res, data, 'Audit logs retrieved')
  } catch (err) {
    next(err)
  }
}

module.exports = { listAuditLogs }

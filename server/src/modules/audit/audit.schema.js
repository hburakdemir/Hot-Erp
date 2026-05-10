const { z } = require('zod')

const listAuditQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  action: z.string().max(120).optional(),
  entityType: z.string().max(120).optional(),
  actorId: z.string().uuid().optional(),
  from: z.string().optional(),
  to: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
})

module.exports = { listAuditQuerySchema }

const { z } = require('zod')

const listQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(50).default(20),
  search: z.string().max(200).optional(),
})

const createAnnouncementSchema = z.object({
  title: z.string().min(1).max(200),
  content: z.string().min(1).max(20000),
  clubId: z.string().uuid().nullable().optional(),
  isGlobal: z.boolean().optional(),
})

const updateAnnouncementSchema = createAnnouncementSchema.partial()

module.exports = { listQuerySchema, createAnnouncementSchema, updateAnnouncementSchema }

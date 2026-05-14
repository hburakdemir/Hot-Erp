const { z } = require('zod')

const listMeetingsQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(50).default(20),
  clubId: z.string().uuid().optional(),
  search: z.string().max(200).optional(),
})

const meetingBodyBase = z.object({
  title: z.string().min(1).max(300),
  description: z.string().max(20000).nullable().optional(),
  location: z.string().max(500).nullable().optional(),
  startDate: z.string().min(1).nullable().optional(),
  endDate: z.string().min(1).nullable().optional(),
  startUndetermined: z.boolean().optional(),
  endUndetermined: z.boolean().optional(),
  clubId: z.string().uuid(),
  categoryId: z.string().uuid().nullable().optional(),
})

const createMeetingSchema = meetingBodyBase.superRefine((val, ctx) => {
  if (!val.startUndetermined && !val.startDate) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Başlangıç tarihi veya «belirsiz» seçilmelidir',
      path: ['startDate'],
    })
  }
})

const updateMeetingSchema = meetingBodyBase.partial().omit({ clubId: true })

const participationStatusBody = z.object({
  label: z.string().min(1).max(120),
  color: z.string().max(32).nullable().optional(),
  fontWeight: z.string().max(32).nullable().optional(),
  fontStyle: z.string().max(32).nullable().optional(),
  sortOrder: z.number().int().min(0).max(9999).optional(),
})

const patchParticipationStatusSchema = participationStatusBody.partial()

const meetingCategoryBody = z.object({
  name: z.string().min(1).max(120),
  color: z.string().max(32).nullable().optional(),
  sortOrder: z.number().int().min(0).max(9999).optional(),
})

const patchMeetingCategorySchema = meetingCategoryBody.partial()

const setParticipationSchema = z.object({
  participationStatusId: z.string().uuid().nullable(),
})

module.exports = {
  listMeetingsQuerySchema,
  createMeetingSchema,
  updateMeetingSchema,
  participationStatusBody,
  patchParticipationStatusSchema,
  meetingCategoryBody,
  patchMeetingCategorySchema,
  setParticipationSchema,
}

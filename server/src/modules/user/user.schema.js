const { z } = require('zod')

const employmentStatuses = ['ACTIVE', 'ON_LEAVE', 'PROBATION', 'TERMINATED']
const registrationStatuses = ['PENDING', 'APPROVED']

const bulkUserIdsSchema = z.object({
  userIds: z.array(z.string().uuid()).min(1).max(200),
})

const bulkPortalSchema = z.object({
  userIds: z.array(z.string().uuid()).min(1).max(200),
  portalDeactivated: z.boolean(),
})

const assignRolesSchema = z.object({
  roleIds: z.array(z.string().uuid()),
})

const updateUserSchema = z.object({
  firstName: z.string().min(1).max(50).optional(),
  lastName: z.string().min(1).max(50).optional(),
  isActive: z.boolean().optional(),
  avatarUrl: z.string().url().max(2048).nullable().optional(),
  employmentStatus: z.enum(employmentStatuses).optional(),
  department: z.string().max(120).nullable().optional(),
})

const listUsersQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  search: z.string().max(200).optional(),
  roleId: z.string().uuid().optional(),
  employmentStatus: z.enum(employmentStatuses).optional(),
  isActive: z.enum(['true', 'false']).optional(),
  registrationStatus: z.enum(registrationStatuses).optional(),
  portalDeactivated: z.enum(['true', 'false']).optional(),
  sortBy: z
    .enum([
      'createdAt',
      'updatedAt',
      'lastName',
      'firstName',
      'email',
      'username',
      'department',
      'faculty',
      'university',
      'phone',
      'employmentStatus',
      'isActive',
      'year',
      'id',
      'registrationStatus',
      'approvedAt',
      'portalDeactivated',
    ])
    .default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
})

const createUserSchema = z.object({
  email: z.string().email(),
  username: z
    .string()
    .min(2)
    .max(50)
    .regex(/^[a-zA-Z0-9_.-]+$/),
  password: z.string().min(8).max(72),
  firstName: z.string().min(1).max(80),
  lastName: z.string().min(1).max(80),
  department: z.string().max(120).optional(),
  employmentStatus: z.enum(employmentStatuses).optional(),
  avatarUrl: z.string().url().max(2048).optional(),
})

const MEMBER_TABLE_COLUMN_KEYS = [
  'id',
  'avatar',
  'fullName',
  'email',
  'username',
  'phone',
  'university',
  'faculty',
  'department',
  'year',
  'roles',
  'employmentStatus',
  'isActive',
  'registrationStatus',
  'approvedAt',
  'approvedBy',
  'portalDeactivated',
  'createdAt',
  'updatedAt',
]

const patchUiPreferencesSchema = z
  .object({
    membersTable: z
      .object({
        columns: z
          .array(z.string())
          .min(1, 'En az bir kolon seçilmelidir')
          .max(20)
          .refine(
            (cols) => cols.every((c) => MEMBER_TABLE_COLUMN_KEYS.includes(c)),
            'Geçersiz kolon anahtarı'
          ),
      })
      .optional(),
  })
  .strict()

module.exports = {
  assignRolesSchema,
  updateUserSchema,
  listUsersQuerySchema,
  createUserSchema,
  patchUiPreferencesSchema,
  bulkUserIdsSchema,
  bulkPortalSchema,
  MEMBER_TABLE_COLUMN_KEYS,
}

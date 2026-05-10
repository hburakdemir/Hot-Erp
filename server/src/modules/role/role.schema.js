const { z } = require('zod')

const createRoleSchema = z.object({
  name: z
    .string()
    .min(2, 'Rol adı en az 2 karakter olmalıdır')
    .max(120)
    .regex(/^[\p{L}\p{N}\s._\-]+$/u, 'Rol adında geçersiz karakter'),
  description: z.string().max(500).optional(),
})

const updateRoleSchema = createRoleSchema.partial()

const assignPermissionsSchema = z.object({
  permissionIds: z.array(z.string().uuid()).default([]),
})

module.exports = { createRoleSchema, updateRoleSchema, assignPermissionsSchema }

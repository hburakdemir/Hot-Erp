const { z } = require('zod')

// Uye olusturma semasi - bir kullanicinin bir kulube uye olmasi icin
const createMemberSchema = z.object({
  userId: z.string().uuid('Gecersiz kullanici ID'),
  clubId: z.string().uuid('Gecersiz kulup ID'),
  role:   z.string().max(50).optional().default('uye'),
})

// Uye guncelleme semasi - durum veya rol degisikligi icin
const updateMemberSchema = z.object({
  status: z.enum(['pending', 'approved', 'rejected', 'suspended']).optional(),
  role:   z.string().max(50).optional(),
})

module.exports = { createMemberSchema, updateMemberSchema }

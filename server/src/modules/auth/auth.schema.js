const { z } = require('zod')

// Kayit sema - frontend'den gelen tum alanlari karsilar
// username otomatik uretilir, bu yuzden frontend gondermese de calismali
const registerSchema = z.object({
  email: z.string().email('Gecerli bir e-posta adresi girin'),
  // username opsiyonel - gelmezse email'in @ oncesi kullanilir
  username: z
    .string()
    .min(3)
    .max(30)
    .regex(/^[a-zA-Z0-9_]+$/)
    .optional(),
  password: z
    .string()
    .min(8, 'Sifre en az 8 karakter olmalidir')
    .regex(/[A-Z]/, 'Sifre en az bir buyuk harf icermelidir')
    .regex(/[0-9]/, 'Sifre en az bir rakam icermelidir'),
  firstName: z.string().min(1, 'Ad zorunludur').max(50),
  lastName:  z.string().min(1, 'Soyad zorunludur').max(50),
  // Universite bilgileri opsiyonel - frontend bunlari gonderecek
  phone:      z.string().optional(),
  university: z.string().optional(),
  faculty:    z.string().optional(),
  department: z.string().optional(),
  year:       z.string().optional(),
})

// Giris semasi - email veya username ile giris desteklenir
const loginSchema = z.object({
  // identifier: email veya username olabilir
  identifier: z.string().min(1, 'E-posta veya kullanici adi zorunludur'),
  password:   z.string().min(1, 'Sifre zorunludur'),
  rememberMe: z.boolean().optional().default(false),
})

module.exports = { registerSchema, loginSchema }

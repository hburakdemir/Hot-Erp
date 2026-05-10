import { z } from 'zod'

// Giris dogrulama semasi - identifier email veya username olabilir
export const loginSchema = z.object({
  identifier: z.string().min(1, 'E-posta veya kullanici adi zorunludur'),
  password:   z.string().min(1, 'Sifre zorunludur'),
  rememberMe: z.boolean().optional().default(false),
})

// Kayit dogrulama semasi - tum alanlar dahil
export const registerSchema = z
  .object({
    firstName: z
      .string()
      .min(2, 'Ad en az 2 karakter olmalidir')
      .max(50, 'Ad en fazla 50 karakter olabilir'),
    lastName: z
      .string()
      .min(2, 'Soyad en az 2 karakter olmalidir')
      .max(50, 'Soyad en fazla 50 karakter olabilir'),
    email: z
      .string()
      .min(1, 'E-posta zorunludur')
      .email('Gecerli bir e-posta adresi girin'),
    phone: z
      .string()
      .min(10, 'Telefon numarasi en az 10 haneli olmalidir')
      .regex(/^[0-9+\s()-]+$/, 'Gecerli bir telefon numarasi girin'),
    university: z.string().min(2, 'Universite adi zorunludur'),
    faculty:    z.string().min(2, 'Fakulte adi zorunludur'),
    department: z.string().min(2, 'Bolum adi zorunludur'),
    year:       z.string().min(1, 'Sinif secimi zorunludur'),
    password: z
      .string()
      .min(8,    'Sifre en az 8 karakter olmalidir')
      .regex(/[A-Z]/, 'Sifre en az bir buyuk harf icermelidir')
      .regex(/[0-9]/, 'Sifre en az bir rakam icermelidir'),
    confirmPassword: z.string().min(1, 'Sifre onay zorunludur'),
    kvkk: z
      .boolean()
      .refine((val) => val === true, {
        message: 'Kayit olmak icin KVKK metnini onaylamaniz gereklidir',
      }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Sifreler eslesmiyow',
    path: ['confirmPassword'],
  })

// Zod semasiyla veriyi dogrular - hatalar duzlestirilerek doner
export function validate(schema, data) {
  const result = schema.safeParse(data)
  if (result.success) {
    return { success: true, data: result.data, errors: {} }
  }

  const errors = {}
  for (const issue of result.error.issues) {
    const key = issue.path[0]
    if (key && !errors[key]) errors[key] = issue.message
  }
  return { success: false, data: null, errors }
}

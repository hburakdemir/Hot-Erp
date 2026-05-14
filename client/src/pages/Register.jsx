import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  User, Mail, Lock, Phone,
  GraduationCap, BookOpen, Layers, Calendar,
  ArrowRight, ArrowLeft, Check, X,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '../hooks/useAuth.js'
import { registerSchema, validate } from '../utils/validators.js'
import AuthLayout from '../components/AuthLayout.jsx'
import Input    from '../components/Input.jsx'
import Select   from '../components/Select.jsx'
import Button   from '../components/Button.jsx'
import Card     from '../components/Card.jsx'
import Checkbox from '../components/Checkbox.jsx'

const YEAR_OPTIONS = [
  { value: 'prep', label: 'Hazirlik' },
  { value: '1',    label: '1. Sinif' },
  { value: '2',    label: '2. Sinif' },
  { value: '3',    label: '3. Sinif' },
  { value: '4',    label: '4. Sinif' },
  { value: '5',    label: '5. Sinif' },
]

const STEP_FIELDS = {
  1: ['firstName', 'lastName', 'email', 'phone'],
  2: ['university', 'faculty', 'department', 'year'],
  3: ['password', 'confirmPassword', 'kvkk'],
}
const STEP_LABELS = ['Kisisel Bilgiler', 'Universite', 'Sifre & Onay']

const INITIAL = {
  firstName: '', lastName: '', email: '', phone: '',
  university: '', faculty: '', department: '', year: '',
  password: '', confirmPassword: '', kvkk: false,
}

// Sifre kural kontrollerini hesaplar - canli geri bildirim icin
const checkRules = (pwd) => ({
  length:    pwd.length >= 8,
  uppercase: /[A-Z]/.test(pwd),
  number:    /[0-9]/.test(pwd),
})

export default function Register() {
  const { register } = useAuth()
  const navigate      = useNavigate()
  const [step,    setStep]    = useState(1)
  const [form,    setForm]    = useState(INITIAL)
  const [errors,  setErrors]  = useState({})
  const [loading, setLoading] = useState(false)

  const set = (field) => (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value
    setForm((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }))
  }

  // Sadece mevcut adimin alanlarini dogrula - tam sema uzerinden filtrele
  const validateStep = (stepNum) => {
    const fields = STEP_FIELDS[stepNum]
    const result = registerSchema.safeParse({ ...INITIAL, ...form })
    const stepErrors = {}
    if (!result.success) {
      for (const issue of result.error.issues) {
        const key = issue.path[0]
        if (fields.includes(String(key)) && !stepErrors[key]) {
          stepErrors[key] = issue.message
        }
      }
    }
    return stepErrors
  }

  const nextStep = () => {
    const stepErrors = validateStep(step)
    if (Object.keys(stepErrors).length > 0) { setErrors(stepErrors); return }
    setStep((s) => s + 1)
    setErrors({})
  }

  const prevStep = () => { setStep((s) => s - 1); setErrors({}) }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const { success, data, errors: ve } = validate(registerSchema, form)
    if (!success) { setErrors(ve); return }

    setLoading(true)
    try {
      // KVKK ve confirmPassword backend'e gonderilmez
      const { kvkk, confirmPassword, ...payload } = data
      await register(payload)
      toast.success('Kayıt alındı. Yönetici onayından sonra giriş yapabileceksiniz.')
      navigate('/login')
    } catch (err) {
      toast.error(err.message || 'Kayit olusturulamadi')
    } finally {
      setLoading(false)
    }
  }

  const pwdRules = checkRules(form.password)
  const allRulesOk = Object.values(pwdRules).every(Boolean)

  return (
    <AuthLayout>
      <div className="animate-fade-up">
        <div className="mb-8">
          <h1 className="font-display text-3xl text-navy-900 mb-2">Uyelik olustur</h1>
          <p className="text-zinc-500 text-sm">Universite kulup yonetim sistemine katilin</p>
        </div>

        {/* Adim gostergesi */}
        <div className="flex items-center mb-6 gap-0">
          {STEP_LABELS.map((label, i) => {
            const num    = i + 1
            const active = step === num
            const done   = step > num
            return (
              <div key={num} className="flex items-center flex-1 last:flex-none">
                <div className="flex flex-col items-center">
                  <div className={`
                    w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold
                    transition-all duration-300 shrink-0
                    ${done   ? 'bg-navy-800 text-white'  : ''}
                    ${active ? 'bg-navy-800 text-white ring-4 ring-navy-200' : ''}
                    ${!done && !active ? 'bg-cream-300 text-zinc-500' : ''}
                  `}>
                    {done ? <Check size={13} strokeWidth={3} /> : num}
                  </div>
                  <span className={`text-xs mt-1 font-medium transition-colors whitespace-nowrap ${active || done ? 'text-navy-800' : 'text-zinc-400'}`}>
                    {label}
                  </span>
                </div>
                {num < 3 && (
                  <div className={`flex-1 h-0.5 mx-2 mb-4 rounded-full transition-all duration-500 ${done ? 'bg-navy-800' : 'bg-cream-300'}`} />
                )}
              </div>
            )
          })}
        </div>

        <Card className="p-7">
          {/*
            name="register-form" ve action="#" ile tarayici bu formu
            login formundan ayirt eder ve kayit sirasinda yeni credential kaydeder.
            autoComplete="on" olmadan bazi tarayicilar kaydetme teklif etmiyor.
          */}
          <form
            onSubmit={handleSubmit}
            noValidate
            name="register-form"
            action="#"
            autoComplete="on"
          >

            {/* Adim 1: Kisisel bilgiler */}
            {step === 1 && (
              <div className="flex flex-col gap-4 animate-fade-in">
                <div className="grid grid-cols-2 gap-4">
                  <Input label="Ad" name="firstName" icon={User} placeholder="Adiniz"
                    value={form.firstName} onChange={set('firstName')} error={errors.firstName} autoComplete="given-name" />
                  <Input label="Soyad" name="lastName" icon={User} placeholder="Soyadiniz"
                    value={form.lastName}  onChange={set('lastName')}  error={errors.lastName}  autoComplete="family-name" />
                </div>
                {/*
                  name="username" ve autoComplete="username" olmali - tarayici
                  kayit sirasinda bu alani credential'in kimlik kismi olarak algilar.
                  Kayit tamamlaninca tarayici "bu siteye kaydet?" diye sorar.
                */}
                <Input label="E-posta Adresi" name="username" type="email" icon={Mail}
                  placeholder="ornek@universite.edu.tr"
                  value={form.email} onChange={set('email')} error={errors.email} autoComplete="username" />
                <Input label="Telefon Numarasi" name="phone" type="tel" icon={Phone}
                  placeholder="0532 000 00 00"
                  value={form.phone} onChange={set('phone')} error={errors.phone}
                  hint="Dogrulama icin kullanilacaktir" autoComplete="tel" />
              </div>
            )}

            {/* Adim 2: Universite bilgileri */}
            {step === 2 && (
              <div className="flex flex-col gap-4 animate-fade-in">
                <Input label="Universite" name="university" icon={GraduationCap}
                  placeholder="Orta Dogu Teknik Universitesi"
                  value={form.university} onChange={set('university')} error={errors.university} />
                <Input label="Fakulte" name="faculty" icon={BookOpen}
                  placeholder="Muhendislik Fakultesi"
                  value={form.faculty} onChange={set('faculty')} error={errors.faculty} />
                <Input label="Bolum" name="department" icon={Layers}
                  placeholder="Bilgisayar Muhendisligi"
                  value={form.department} onChange={set('department')} error={errors.department} />
                <Select label="Sinif" name="year" icon={Calendar}
                  placeholder="Sinifinizi secin..."
                  options={YEAR_OPTIONS}
                  value={form.year} onChange={set('year')} error={errors.year} />
              </div>
            )}

            {/* Adim 3: Sifre ve KVKK */}
            {step === 3 && (
              <div className="flex flex-col gap-4 animate-fade-in">

                {/* Sifre kural gostergesi - canli geri bildirim saglar */}
                <div className="bg-navy-50 border border-zinc-100 rounded-xl p-4">
                  <p className="text-xs font-semibold text-navy-700 mb-3 uppercase tracking-wider">
                    Sifre Gereksinimleri
                  </p>
                  <div className="space-y-2">
                    {[
                      { key: 'length',    label: 'En az 8 karakter' },
                      { key: 'uppercase', label: 'En az bir buyuk harf (A-Z)' },
                      { key: 'number',    label: 'En az bir rakam (0-9)' },
                    ].map(({ key, label }) => (
                      <div key={key} className={`
                        flex items-center gap-2.5 text-sm px-3 py-2 rounded-lg
                        transition-all duration-200
                        ${pwdRules[key]
                          ? 'bg-green-50 text-green-700'
                          : 'bg-white text-zinc-500 border border-zinc-100'
                        }
                      `}>
                        <span className={`
                          w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0
                          ${pwdRules[key] ? 'bg-green-500' : 'bg-navy-200'}
                        `}>
                          {pwdRules[key]
                            ? <Check size={10} strokeWidth={3} className="text-white" />
                            : <X size={10} strokeWidth={3} className="text-white" />
                          }
                        </span>
                        <span className="font-medium">{label}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <Input label="Sifre" name="password" type="password" icon={Lock}
                  placeholder="Sifrenizi girin"
                  value={form.password} onChange={set('password')} error={errors.password}
                  autoComplete="new-password" />

                <Input label="Sifre Tekrar" name="confirmPassword" type="password" icon={Lock}
                  placeholder="Sifrenizi tekrar girin"
                  value={form.confirmPassword} onChange={set('confirmPassword')}
                  error={errors.confirmPassword} autoComplete="new-password" />

                {/* KVKK onay kutusu - kayit olurken de zorunlu */}
                <div className="bg-cream-100 rounded-xl p-4 border border-cream-300 mt-1">
                  <Checkbox name="kvkk" checked={form.kvkk} onChange={set('kvkk')} error={errors.kvkk}>
                    <span className="text-navy-700">
                      <button type="button" className="text-navy-800 font-medium underline underline-offset-2 hover:text-navy-900 transition-colors">
                        KVKK Aydinlatma Metni
                      </button>
                      {'\'ni okudum ve kisisel verilerimin islenmesini kabul ediyorum.'}
                    </span>
                  </Checkbox>
                </div>
              </div>
            )}

            {/* Navigasyon butonlari */}
            <div className="flex gap-3 mt-6">
              {step > 1 && (
                <Button type="button" variant="secondary" size="md" onClick={prevStep} className="gap-1.5">
                  <ArrowLeft size={15} /> Geri
                </Button>
              )}
              {step < 3 ? (
                <Button type="button" size="full" onClick={nextStep} className="flex-1 gap-1.5">
                  Devam Et <ArrowRight size={15} />
                </Button>
              ) : (
                <Button type="submit" size="full" loading={loading} className="flex-1 gap-1.5">
                  Kayit Ol <ArrowRight size={15} />
                </Button>
              )}
            </div>
          </form>
        </Card>

        <p className="mt-6 text-center text-sm text-zinc-500">
          Zaten hesabiniz var mi?{' '}
          <Link to="/login" className="text-navy-800 font-medium hover:text-navy-900 underline underline-offset-2 transition-colors">
            Giris yapin
          </Link>
        </p>
      </div>
    </AuthLayout>
  )
}
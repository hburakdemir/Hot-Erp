import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { User, Lock, ArrowRight } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '../hooks/useAuth.js'
import { loginSchema, validate } from '../utils/validators.js'
import AuthLayout from '../components/AuthLayout.jsx'
import Input from '../components/Input.jsx'
import Button from '../components/Button.jsx'
import Checkbox from '../components/Checkbox.jsx'
import Card from '../components/Card.jsx'

const INITIAL = { identifier: '', password: '', rememberMe: false, }

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState(INITIAL)
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  const set = (field) => (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value
    setForm((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const { success, data, errors: ve } = validate(loginSchema, form)
    if (!success) {
      setErrors(ve)
      return
    }

    setLoading(true)
    try {
      await login(data)
      toast.success('Hoş geldiniz, giriş başarılı.')
      navigate('/dashboard')
    } catch (err) {
      toast.error(err.message || 'Giriş yapılamadı')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout>
      <div className="animate-fade-up">
        <div className="mb-8">
          <h1 className="font-display text-3xl text-zinc-900 dark:text-white mb-2">
            Tekrar hoş geldiniz
          </h1>
          <p className="text-zinc-500 dark:text-red-100/70 text-sm">
            Hacettepe öğrenci topluluğu paneline giriş yapın
          </p>
        </div>

        <Card className="p-7 dark:bg-navy-900 dark:border-red-950/40">
          <form
            onSubmit={handleSubmit}
            noValidate
            name="login-form"
            action="#"
            autoComplete="on"
            className="flex flex-col gap-5"
          >
            <Input
              label="E-posta veya kullanıcı adı"
              name="username"
              id="username"
              icon={User}
              placeholder="ornek@stud.hacettepe.edu.tr"
              value={form.identifier}
              onChange={set('identifier')}
              error={errors.identifier}
              autoComplete="username"
            />

            <Input
              label="Şifre"
              name="password"
              id="password"
              type="password"
              icon={Lock}
              placeholder="Şifrenizi girin"
              value={form.password}
              onChange={set('password')}
              error={errors.password}
              autoComplete="current-password"
            />

            <div className="flex items-center justify-between">
              <Checkbox name="rememberMe" checked={form.rememberMe} onChange={set('rememberMe')}>
                Beni hatırla <span className="text-zinc-400 text-xs">(30 gün)</span>
              </Checkbox>
              <button
                type="button"
                className="text-xs text-zinc-500 hover:text-red-800 dark:hover:text-red-300 underline underline-offset-2 transition-colors"
              >
                Şifremi unuttum
              </button>
            </div>

            <Button type="submit" size="full" loading={loading} className="mt-1 gap-2">
              Giriş yap <ArrowRight size={16} />
            </Button>
          </form>
        </Card>

        <p className="mt-6 text-center text-sm text-zinc-500">
          Hesabınız yok mu?{' '}
          <Link
            to="/register"
            className="text-red-800 dark:text-red-300 font-medium hover:text-red-900 underline underline-offset-2 transition-colors"
          >
            Kayıt olun
          </Link>
        </p>
      </div>
    </AuthLayout>
  )
}

import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { ArrowLeft } from 'lucide-react'
import { usersApi } from '../../api/users.js'
import Card from '../../components/Card.jsx'
import Button from '../../components/Button.jsx'
import Input from '../../components/Input.jsx'

export default function UserCreatePage() {
  const navigate = useNavigate()
  const qc = useQueryClient()
  const [form, setForm] = useState({
    email: '',
    username: '',
    password: '',
    firstName: '',
    lastName: '',
    department: '',
  })

  const create = useMutation({
    mutationFn: () => usersApi.create(form),
    onSuccess: (data) => {
      toast.success('Kullanıcı oluşturuldu')
      qc.invalidateQueries({ queryKey: ['users'] })
      navigate(`/users/${data.id}`)
    },
    onError: (e) => toast.error(e.message),
  })

  const set =
    (field) =>
    (e) =>
      setForm((p) => ({
        ...p,
        [field]: e.target.value,
      }))

  return (
    <div className="max-w-lg space-y-6 animate-fade-up">
      <Link
        to="/users"
        className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-navy-800 dark:text-zinc-400"
      >
        <ArrowLeft size={16} /> Geri
      </Link>
      <h1 className="font-display text-2xl text-navy-900 dark:text-white">
        Yeni üye kaydı
      </h1>
      <Card className="p-6 dark:bg-navy-900 dark:border-navy-800 space-y-4">
        <Input label="E-posta" value={form.email} onChange={set('email')} />
        <Input label="Kullanıcı adı" value={form.username} onChange={set('username')} />
        <Input
          label="Şifre"
          type="password"
          value={form.password}
          onChange={set('password')}
        />
        <Input label="Ad" value={form.firstName} onChange={set('firstName')} />
        <Input label="Soyad" value={form.lastName} onChange={set('lastName')} />
        <Input label="Departman" value={form.department} onChange={set('department')} />
        <Button
          className="w-full"
          loading={create.isPending}
          onClick={() => create.mutate()}
        >
          Oluştur
        </Button>
      </Card>
    </div>
  )
}

import { useState, useEffect } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { ArrowLeft } from 'lucide-react'
import { usersApi } from '../../api/users.js'
import { rolesApi } from '../../api/roles.js'
import Can from '../../components/permission/Can.jsx'
import Card from '../../components/Card.jsx'
import Button from '../../components/Button.jsx'
import { Skeleton } from '../../components/ui/Skeleton.jsx'

export default function UserDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const qc = useQueryClient()
  const [selectedRoles, setSelectedRoles] = useState([])

  const { data: user, isLoading } = useQuery({
    queryKey: ['user', id],
    queryFn: () => usersApi.get(id),
    enabled: !!id,
  })

  const { data: roles } = useQuery({
    queryKey: ['roles'],
    queryFn: rolesApi.list,
  })

  useEffect(() => {
    if (user?.roles) setSelectedRoles(user.roles.map((r) => r.id))
  }, [user])

  const saveRoles = useMutation({
    mutationFn: () => usersApi.assignRoles(id, selectedRoles ?? []),
    onSuccess: () => {
      toast.success('Roller güncellendi')
      qc.invalidateQueries({ queryKey: ['user', id] })
      qc.invalidateQueries({ queryKey: ['users'] })
    },
    onError: (e) => toast.error(e.message),
  })

  const deleteUser = useMutation({
    mutationFn: () => usersApi.remove(id),
    onSuccess: () => {
      toast.success('Kullanıcı silindi')
      qc.invalidateQueries({ queryKey: ['users'] })
      navigate('/users')
    },
    onError: (e) => toast.error(e.message),
  })

  if (isLoading || !user) {
    return (
      <div className="space-y-4 max-w-3xl">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  const toggleRole = (rid) => {
    setSelectedRoles((prev) => {
      const base = prev ?? []
      return base.includes(rid) ? base.filter((x) => x !== rid) : [...base, rid]
    })
  }

  return (
    <div className="max-w-3xl space-y-6 animate-fade-up">
      <Link
        to="/users"
        className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-red-800 dark:text-red-300"
      >
        <ArrowLeft size={16} /> Üye listesine dön
      </Link>

      <div className="flex flex-col sm:flex-row gap-6 items-start">
        <img
          src={
            user.avatarUrl ||
            `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`
          }
          alt=""
          className="w-28 h-28 rounded-3xl object-cover ring-4 ring-white dark:ring-navy-800 shadow-card"
        />
        <div className="flex-1 min-w-0">
          <h1 className="font-display text-3xl text-navy-900 dark:text-cream-50">
            {user.firstName} {user.lastName}
          </h1>
          <p className="text-zinc-500 mt-1">{user.email}</p>
          <p className="text-sm text-zinc-400 font-mono mt-1">@{user.username}</p>
          <div className="flex flex-wrap gap-2 mt-4">
            {(user.roles ?? []).map((r) => (
              <span
                key={r.id}
                className="text-xs px-3 py-1 rounded-full bg-navy-900 text-cream-50 dark:bg-navy-700"
              >
                {r.name}
              </span>
            ))}
          </div>
        </div>
      </div>

      <Card className="p-5 dark:bg-navy-900 dark:border-red-950/40 space-y-3">
        <h2 className="font-display text-lg text-navy-900 dark:text-white">Profil</h2>
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
          <div>
            <dt className="text-zinc-400">Üniversite</dt>
            <dd className="text-navy-900 dark:text-white">{user.university ?? '—'}</dd>
          </div>
          <div>
            <dt className="text-zinc-400">Fakülte</dt>
            <dd className="text-navy-900 dark:text-white">{user.faculty ?? '—'}</dd>
          </div>
          <div>
            <dt className="text-zinc-400">Bölüm</dt>
            <dd className="text-navy-900 dark:text-white">{user.department ?? '—'}</dd>
          </div>
          <div>
            <dt className="text-zinc-400">İstihdam</dt>
            <dd className="text-navy-900 dark:text-white">
              {{
                ACTIVE: 'Görevde',
                ON_LEAVE: 'İzinli',
                PROBATION: 'Deneme süresi',
                TERMINATED: 'Ayrılmış',
              }[user.employmentStatus] ?? user.employmentStatus}
            </dd>
          </div>
          <div>
            <dt className="text-zinc-400">Kayıt</dt>
            <dd className="text-navy-900 dark:text-cream-100">
              {new Date(user.createdAt).toLocaleString()}
            </dd>
          </div>
          <div>
            <dt className="text-zinc-400">Hesap</dt>
            <dd>{user.isActive ? 'Aktif' : 'Devre dışı'}</dd>
          </div>
        </dl>
      </Card>

      <Can permission="member.update">
        <Card className="p-5 dark:bg-navy-900 dark:border-navy-800 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg text-navy-900 dark:text-cream-50">
              Rol ataması
            </h2>
            <Button
              size="sm"
              loading={saveRoles.isPending}
              onClick={() => saveRoles.mutate()}
            >
              Kaydet
            </Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {(roles ?? []).map((r) => (
              <label
                key={r.id}
                className="flex items-center gap-3 p-3 rounded-xl border border-zinc-100 dark:border-navy-700 cursor-pointer hover:bg-navy-50 dark:hover:bg-navy-800/50"
              >
                <input
                  type="checkbox"
                  checked={(selectedRoles ?? []).includes(r.id)}
                  onChange={() => toggleRole(r.id)}
                  className="rounded border-navy-300"
                />
                <span className="text-sm font-medium text-navy-800 dark:text-cream-100">
                  {r.name}
                </span>
              </label>
            ))}
          </div>
        </Card>
      </Can>

      <Can permission="member.delete">
        <Card className="p-5 border-red-200 dark:border-red-900/50 dark:bg-navy-900">
          <h2 className="font-display text-lg text-red-700 dark:text-red-400 mb-2">
            Tehlikeli bölge
          </h2>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">
            Bu kullanıcı kalıcı olarak silinir.
          </p>
          <Button
            variant="danger"
            loading={deleteUser.isPending}
            onClick={() => {
              if (confirm('Bu kullanıcıyı silmek istediğinize emin misiniz?')) deleteUser.mutate()
            }}
          >
            Kullanıcıyı sil
          </Button>
        </Card>
      </Can>
    </div>
  )
}

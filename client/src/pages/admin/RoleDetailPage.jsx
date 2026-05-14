import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { ArrowLeft } from 'lucide-react'
import { rolesApi } from '../../api/roles.js'
import { permissionsApi } from '../../api/permissions.js'
import { useAuth } from '../../hooks/useAuth.js'
import Can from '../../components/permission/Can.jsx'
import Card from '../../components/Card.jsx'
import Button from '../../components/Button.jsx'
import Input from '../../components/Input.jsx'

export default function RoleDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const qc = useQueryClient()
  const { hasPermission } = useAuth()
  const canEditRole = hasPermission('role.update')

  const { data: role, isLoading } = useQuery({
    queryKey: ['role', id],
    queryFn: () => rolesApi.get(id),
    enabled: !!id,
  })

  const { data: grouped } = useQuery({
    queryKey: ['permissions-grouped'],
    queryFn: permissionsApi.grouped,
  })

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [selectedPermIds, setSelectedPermIds] = useState([])

  useEffect(() => {
    if (!role) return
    setName(role.name)
    setDescription(role.description ?? '')
    setSelectedPermIds((role.permissions ?? []).map((p) => p.id))
  }, [role])

  const updateMeta = useMutation({
    mutationFn: () => rolesApi.update(id, { name, description }),
    onSuccess: () => {
      toast.success('Rol güncellendi')
      qc.invalidateQueries({ queryKey: ['role', id] })
      qc.invalidateQueries({ queryKey: ['roles'] })
    },
    onError: (e) => toast.error(e.message),
  })

  const savePerms = useMutation({
    mutationFn: () => rolesApi.assignPermissions(id, selectedPermIds),
    onSuccess: () => {
      toast.success('İzinler kaydedildi')
      qc.invalidateQueries({ queryKey: ['role', id] })
    },
    onError: (e) => toast.error(e.message),
  })

  const remove = useMutation({
    mutationFn: () => rolesApi.remove(id),
    onSuccess: () => {
      toast.success('Rol silindi')
      qc.invalidateQueries({ queryKey: ['roles'] })
      navigate('/roles')
    },
    onError: (e) => toast.error(e.message),
  })

  const togglePerm = (pid) => {
    if (!canEditRole) return
    setSelectedPermIds((prev) =>
      prev.includes(pid) ? prev.filter((x) => x !== pid) : [...prev, pid]
    )
  }

  if (isLoading || !role) {
    return <div className="text-zinc-500">Yükleniyor…</div>
  }

  return (
    <div className="max-w-4xl space-y-6 animate-fade-up">
      <Link
        to="/roles"
        className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-navy-800 dark:text-zinc-400"
      >
        <ArrowLeft size={16} /> Rollere dön
      </Link>

      <Card className="p-5 dark:bg-navy-900 dark:border-navy-800 space-y-4">
        <h1 className="font-display text-xl text-navy-900 dark:text-cream-50">
          Rol bilgisi
        </h1>
        {canEditRole ? (
          <>
            <Input label="Ad" value={name} onChange={(e) => setName(e.target.value)} />
            <Input
              label="Açıklama"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
            <Button loading={updateMeta.isPending} onClick={() => updateMeta.mutate()}>
              Kaydet
            </Button>
          </>
        ) : (
          <div className="text-sm space-y-1">
            <div className="font-medium text-navy-900 dark:text-cream-50">{role.name}</div>
            <p className="text-zinc-600 dark:text-zinc-300">{role.description || '—'}</p>
            <p className="text-xs text-zinc-500">
              Rol adı ve açıklamasını değiştirmek için <span className="font-mono">role.update</span> izni gerekir.
            </p>
          </div>
        )}
      </Card>

      <Card className="p-5 dark:bg-navy-900 dark:border-navy-800 space-y-4">
        <div className="flex justify-between items-center gap-4 flex-wrap">
          <h2 className="font-display text-lg text-navy-900 dark:text-cream-50">
            İzinler (RBAC)
          </h2>
          {canEditRole && (
            <Button size="sm" loading={savePerms.isPending} onClick={() => savePerms.mutate()}>
              İzinleri kaydet
            </Button>
          )}
        </div>
        {!canEditRole && (
          <p className="text-xs text-amber-700 dark:text-amber-200/90 bg-amber-50 dark:bg-amber-950/40 border border-amber-200/60 dark:border-amber-900/50 rounded-lg px-3 py-2">
            Salt görüntüleme: kutuları değiştirmek ve kaydetmek için <span className="font-mono">role.update</span> izni
            gerekir.
          </p>
        )}
        <div className="space-y-6">
          {(grouped ?? []).map((group) => (
            <div key={group.category}>
              <div className="text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">
                {group.category}
              </div>
              <div className="grid sm:grid-cols-2 gap-2">
                {group.permissions.map((p) => (
                  <label
                    key={p.id}
                    className={`flex items-start gap-3 p-3 rounded-xl border border-zinc-100 dark:border-navy-700 ${
                      canEditRole
                        ? 'cursor-pointer hover:bg-navy-50 dark:hover:bg-navy-800/40'
                        : 'opacity-95 cursor-default'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedPermIds.includes(p.id)}
                      onChange={() => togglePerm(p.id)}
                      disabled={!canEditRole}
                      className="mt-1 rounded border-navy-300 disabled:opacity-50"
                    />
                    <div>
                      <div className="text-sm font-mono text-navy-900 dark:text-cream-100">
                        {p.key}
                      </div>
                      {p.description && (
                        <div className="text-xs text-zinc-500">{p.description}</div>
                      )}
                    </div>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>
        {!grouped?.length && (
          <p className="text-sm text-zinc-500">
            İzin kataloğu boş — sunucuda <span className="font-mono">npx prisma db seed</span> çalıştırın.
          </p>
        )}
      </Card>

      <Can permission="role.delete">
        <Card className="p-5 border-red-200 dark:border-red-900/40 dark:bg-navy-900">
          <Button
            variant="danger"
            loading={remove.isPending}
            onClick={() => {
              if (confirm('Bu rolü silmek istediğinize emin misiniz?')) remove.mutate()
            }}
          >
            Rolü sil
          </Button>
        </Card>
      </Can>
    </div>
  )
}
